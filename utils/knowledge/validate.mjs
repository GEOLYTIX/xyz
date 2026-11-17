import {
  existsSync,
  readdirSync,
  readFileSync,
  realpathSync,
  statSync,
} from 'node:fs';
import { basename, dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import MarkdownIt from 'markdown-it';
import { parse } from 'yaml';

const markdown = new MarkdownIt();
const textValue = (value) =>
  typeof value === 'string' && value.trim().length > 0;
const mapping = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const reserved = (name) => name === 'index.md' || name === 'log.md';

/** Directories scanned for environment variables read by the XYZ API. */
const ENV_SOURCES = ['apps/xyz/mod', 'apps/xyz/router.js', 'apps/saml'];

/**
Names which are not deployment configuration: variables set by the platform or
test runner, and xyzEnv properties derived by processEnv (WALLET from SIGN_*).
*/
const ENV_IGNORED =
  /^(VERCEL(_[A-Z0-9_]+)?|NODE_ENV|VITEST|_?_VARLOCK_[A-Z_]+|WALLET)$/;

/** Parse metadata without interpreting custom YAML tags or executing content. */
export function splitDocument(text) {
  const normalized = text.replace(/^﻿/, '').replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) return { body: normalized };
  const match = /^---\n(?:([\s\S]*?)\n)?---(?:\n|$)/.exec(normalized);
  if (!match) throw new Error('Unclosed YAML frontmatter');
  const metadata = match[1]?.trim()
    ? parse(match[1], { uniqueKeys: true, maxAliasCount: 100 })
    : {};
  if (!mapping(metadata)) throw new Error('Frontmatter must be a YAML mapping');
  return { metadata, body: normalized.slice(match[0].length) };
}

function walk(directory, directories = []) {
  directories.push(directory);
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) walk(resolve(directory, entry.name), directories);
  }
  return directories;
}

function markdownFiles(directories) {
  const files = [];
  for (const directory of directories) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.isFile() && entry.name.endsWith('.md'))
        files.push(resolve(directory, entry.name));
    }
  }
  return files.sort();
}

function linkTargets(tokens) {
  const targets = [];
  for (const token of tokens) {
    if (token.type === 'link_open') targets.push(token.attrGet('href'));
    if (token.type === 'image') targets.push(token.attrGet('src'));
    if (token.children) targets.push(...linkTargets(token.children));
  }
  return targets;
}

function localTarget(target, file, context) {
  if (!textValue(target) || target.startsWith('#')) return;
  if (/^[a-z][a-z\d+.-]*:|^\/\//i.test(target)) return;
  const path = decodeURIComponent(target.split(/[?#]/)[0]);
  return path.startsWith('/')
    ? resolve(context.bundle, `.${path}`)
    : resolve(dirname(file), path);
}

function checkTarget(target, file, context) {
  const resolved = localTarget(target, file, context);
  if (!resolved) return;
  const fromRoot = relative(context.root, resolved);
  if (fromRoot === '..' || fromRoot.startsWith(`..${sep}`)) {
    throw new Error(`Local target escapes repository: ${target}`);
  }
  if (!existsSync(resolved)) throw new Error(`Missing local target: ${target}`);
}

function checkReserved(name, file, doc, context) {
  const rootIndex = file === resolve(context.bundle, 'index.md');
  if (rootIndex && !doc.metadata) {
    throw new Error("Root index must declare okf_version: '0.2'");
  }
  if (doc.metadata) {
    if (
      !rootIndex ||
      Object.keys(doc.metadata).some((key) => key !== 'okf_version')
    ) {
      throw new Error(`${name} must not contain concept frontmatter`);
    }
    if (String(doc.metadata.okf_version) !== '0.2') {
      throw new Error('This checker supports okf_version 0.2');
    }
  }
  if (name !== 'log.md') return;
  let previous = '9999-12-31';
  for (const match of doc.body.matchAll(/^## (.+)$/gm)) {
    const date = match[1].trim();
    const parsed = new Date(`${date}T00:00:00Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      Number.isNaN(+parsed) ||
      parsed.toISOString().slice(0, 10) !== date ||
      date > previous
    ) {
      throw new Error(
        'Log dates must be valid YYYY-MM-DD headings, newest first',
      );
    }
    previous = date;
  }
}

function checkMetadata(metadata, file, context, warn) {
  if (!textValue(metadata?.type))
    throw new Error('Concept requires a nonempty string type');
  checkQuality(metadata, context, warn);
  checkResources(metadata, file, context, warn);
  checkVariables(metadata, warn);
}

function checkQuality(metadata, context, warn) {
  for (const key of ['title', 'description']) {
    if (!textValue(metadata[key]))
      warn(`Recommended ${key} is missing or empty`);
  }
  if (
    metadata.tags !== undefined &&
    (!Array.isArray(metadata.tags) || !metadata.tags.every(textValue))
  ) {
    warn('Optional tags should be an array of nonempty strings');
  }
  if (
    metadata.status !== undefined &&
    !['draft', 'stable', 'deprecated'].includes(metadata.status)
  ) {
    warn('Optional status should be draft, stable or deprecated');
  }
  if (metadata.stale_after !== undefined) {
    const date = Date.parse(metadata.stale_after);
    if (Number.isNaN(date)) warn('Invalid optional stale_after date');
    else if (date <= context.now)
      warn('Concept is past stale_after; review its sources');
  }
}

// A resource without whitespace which contains a slash or ends in a file
// extension is a path, not an OKF scope description.
const pathLike = (value) =>
  !/\s/.test(value) &&
  !/^[a-z][a-z\d+.-]*:/i.test(value) &&
  (value.includes('/') || /\.[a-z\d]+$/i.test(value));

function checkResources(metadata, file, context, warn) {
  const resources = [metadata.resource];
  if (metadata.sources !== undefined && !Array.isArray(metadata.sources)) {
    warn('Optional sources should be an array');
  } else {
    for (const source of metadata.sources ?? []) {
      if (!mapping(source) || !textValue(source.resource))
        warn('Source entry needs a resource string');
      else resources.push(source.resource);
    }
  }
  for (const resource of resources) {
    if (resource === undefined) continue;
    if (!textValue(resource))
      warn('Optional resource should be a nonempty string');
    // Explicit local prefixes distinguish paths from OKF scope descriptions.
    else if (/^(\.\.?\/|\/)/.test(resource))
      checkTarget(resource, file, context);
    else if (pathLike(resource))
      throw new Error(
        `Local resource needs a ./, ../ or / prefix: ${resource}`,
      );
  }
}

function checkVariables(metadata, warn) {
  if (metadata.variables === undefined) return;
  if (
    !Array.isArray(metadata.variables) ||
    !metadata.variables.every(
      (name) => typeof name === 'string' && /^[A-Z][A-Z0-9_]*\*?$/.test(name),
    )
  ) {
    warn('variables should be an array of NAME or PREFIX_* strings');
  }
}

function indexLinks(index, context) {
  try {
    const doc = splitDocument(readFileSync(index, 'utf8'));
    return new Set(
      linkTargets(markdown.parse(doc.body, {}))
        .map((target) => localTarget(target, index, context))
        .filter(Boolean),
    );
  } catch {
    return; // The index itself reports the parse error.
  }
}

function listed(entry, path, linked) {
  if (entry.isDirectory())
    return linked.has(path) || linked.has(resolve(path, 'index.md'));
  if (!entry.isFile() || !entry.name.endsWith('.md')) return true;
  return reserved(entry.name) || linked.has(path);
}

/** Warn when a concept or subdirectory is not linked from its directory index. */
function checkIndexes(directories, context, warnings) {
  for (const directory of directories) {
    const label = relative(context.root, directory).split(sep).join('/');
    const index = resolve(directory, 'index.md');
    if (!existsSync(index)) {
      warnings.push(`${label}: missing directory index`);
      continue;
    }
    const linked = indexLinks(index, context);
    if (!linked) continue;
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (!listed(entry, resolve(directory, entry.name), linked))
        warnings.push(`${label}: index does not list ${entry.name}`);
    }
  }
}

function sourceFiles(path) {
  if (!existsSync(path)) return [];
  if (statSync(path).isFile()) return [path];
  const files = [];
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    if (['node_modules', 'tests', 'public'].includes(entry.name)) continue;
    const child = resolve(path, entry.name);
    if (entry.isDirectory()) files.push(...sourceFiles(child));
    else if (/\.(c|m)?js$/.test(entry.name)) files.push(child);
  }
  return files;
}

/** Collect xyzEnv and process.env names read by the XYZ API source. */
export function readEnvironment(root) {
  const names = new Set();
  const pattern =
    /\b(?:xyzEnv|process\.env)(?:\.([A-Z][A-Z0-9_]*)\b|\[['"`]([A-Z][A-Z0-9_]*)['"`]\])/g;
  for (const source of ENV_SOURCES) {
    for (const file of sourceFiles(resolve(root, source))) {
      // Comments describe variables; only code reads count.
      const code = readFileSync(file, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '');
      for (const match of code.matchAll(pattern)) {
        const name = match[1] ?? match[2];
        if (!ENV_IGNORED.test(name)) names.add(name);
      }
    }
  }
  return names;
}

function covered(name, variables) {
  return variables.some((variable) =>
    variable.endsWith('*')
      ? name.startsWith(variable.slice(0, -1))
      : name === variable,
  );
}

/** Validate OKF structure plus XYZ's stricter local-link authoring policy. */
export function validateBundle(root, now = Date.now()) {
  const context = {
    root: resolve(root),
    bundle: resolve(root, 'knowledge'),
    now,
  };
  const errors = [];
  const warnings = [];
  if (!existsSync(context.bundle) || !statSync(context.bundle).isDirectory()) {
    return { errors: ['Missing knowledge directory'], warnings, files: 0 };
  }
  const directories = walk(context.bundle);
  const files = markdownFiles(directories);
  if (!files.length) errors.push('Knowledge bundle contains no Markdown files');
  const variables = [];
  for (const file of files) {
    const label = relative(context.root, file).split(sep).join('/');
    const warn = (message) => warnings.push(`${label}: ${message}`);
    try {
      const doc = splitDocument(readFileSync(file, 'utf8'));
      const name = basename(file);
      if (reserved(name)) checkReserved(name, file, doc, context);
      else {
        checkMetadata(doc.metadata, file, context, warn);
        if (Array.isArray(doc.metadata.variables))
          variables.push(...doc.metadata.variables.filter(textValue));
      }
      for (const target of linkTargets(markdown.parse(doc.body, {}))) {
        checkTarget(target, file, context);
      }
    } catch (error) {
      errors.push(`${label}: ${error.message}`);
    }
  }
  checkIndexes(directories, context, warnings);
  const undocumented = [...readEnvironment(context.root)]
    .filter((name) => !covered(name, variables))
    .sort();
  if (undocumented.length) {
    warnings.push(
      `knowledge/environment: ${undocumented.length} variables read in code have no concept: ${undocumented.join(', ')}`,
    );
  }
  return { errors, warnings, files: files.length, undocumented };
}

const main = process.argv[1] && realpathSync(resolve(process.argv[1]));
if (main === realpathSync(fileURLToPath(import.meta.url))) {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const result = validateBundle(root);
  for (const warning of result.warnings) console.warn(`WARN ${warning}`);
  for (const error of result.errors) console.error(`ERROR ${error}`);
  console.log(
    `Knowledge: ${result.files} files, ${result.errors.length} errors, ${result.warnings.length} warnings`,
  );
  process.exitCode = result.errors.length ? 1 : 0;
}
