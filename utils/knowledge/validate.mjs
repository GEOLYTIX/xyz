import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import MarkdownIt from 'markdown-it';
import { parse } from 'yaml';

const markdown = new MarkdownIt();
const textValue = (value) =>
  typeof value === 'string' && value.trim().length > 0;
const mapping = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

/** Parse metadata without interpreting custom YAML tags or executing content. */
export function splitDocument(text) {
  const normalized = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) return { body: normalized };
  const match = /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(normalized);
  if (!match) throw new Error('Unclosed YAML frontmatter');
  const metadata = parse(match[1], { uniqueKeys: true, maxAliasCount: 100 });
  if (!mapping(metadata)) throw new Error('Frontmatter must be a YAML mapping');
  return { metadata, body: normalized.slice(match[0].length) };
}

function markdownFiles(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...markdownFiles(path));
    else if (entry.isFile() && entry.name.endsWith('.md')) files.push(path);
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

function checkTarget(target, file, context) {
  if (!textValue(target) || target.startsWith('#')) return;
  if (/^[a-z][a-z\d+.-]*:|^\/\//i.test(target)) return;
  const path = decodeURIComponent(target.split(/[?#]/)[0]);
  const resolved = path.startsWith('/')
    ? resolve(context.bundle, `.${path}`)
    : resolve(dirname(file), path);
  const fromRoot = relative(context.root, resolved);
  if (fromRoot === '..' || fromRoot.startsWith(`..${sep}`)) {
    throw new Error(`Local target escapes repository: ${target}`);
  }
  if (!existsSync(resolved)) throw new Error(`Missing local target: ${target}`);
}

function checkReserved(name, file, doc, context) {
  if (doc.metadata) {
    const rootIndex = file === resolve(context.bundle, 'index.md');
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
  }
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
  const files = markdownFiles(context.bundle);
  if (!files.length) errors.push('Knowledge bundle contains no Markdown files');
  for (const directory of new Set([context.bundle, ...files.map(dirname)])) {
    if (!existsSync(resolve(directory, 'index.md'))) {
      warnings.push(
        `${relative(context.root, directory)}: missing directory index`,
      );
    }
  }
  for (const file of files) {
    const label = relative(context.root, file).split(sep).join('/');
    const warn = (message) => warnings.push(`${label}: ${message}`);
    try {
      const doc = splitDocument(readFileSync(file, 'utf8'));
      const name = basename(file);
      if (name === 'index.md' || name === 'log.md')
        checkReserved(name, file, doc, context);
      else checkMetadata(doc.metadata, file, context, warn);
      for (const target of linkTargets(markdown.parse(doc.body, {}))) {
        checkTarget(target, file, context);
      }
    } catch (error) {
      errors.push(`${label}: ${error.message}`);
    }
  }
  return { errors, warnings, files: files.length };
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const result = validateBundle(root);
  for (const warning of result.warnings) console.warn(`WARN ${warning}`);
  for (const error of result.errors) console.error(`ERROR ${error}`);
  console.log(
    `Knowledge: ${result.files} files, ${result.errors.length} errors, ${result.warnings.length} warnings`,
  );
  process.exitCode = result.errors.length ? 1 : 0;
}
