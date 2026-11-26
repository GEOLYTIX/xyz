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
import { checkBody, checkKeys, requirements } from './concepts.mjs';
import { collectExamples, combineExamples, GENERATED } from './examples.mjs';
import {
  buildSchema,
  checkExample,
  checkTestWorkspaces,
  SCHEMA_PATH,
  staleSchemas,
} from './schema.mjs';

const markdown = new MarkdownIt();
const textValue = (value) =>
  typeof value === 'string' && value.trim().length > 0;
const mapping = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const reserved = (name) => name === 'index.md' || name === 'log.md';

/** The OKF specification version this checker implements. */
export const OKF_VERSION = '0.3';

/** RFC 3339 date-time with an offset, or a full date (OKF v0.3 §5). */
const TIMESTAMP =
  /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/i;

/** Directories scanned for environment variables read by the XYZ API. */
const ENV_SOURCES = ['apps/xyz/mod', 'apps/xyz/router.js', 'apps/saml'];

/**
Names which are not deployment configuration: variables set by the platform or
test runner, and xyzEnv properties derived by processEnv (WALLET from SIGN_*).
*/
const ENV_IGNORED =
  /^(VERCEL(_[A-Z0-9_]+)?|NODE_ENV|VITEST|_?_VARLOCK_[A-Z_]+|WALLET)$/;

/**
OKF footnote definitions (`[^id]: text`) attribute claims to sources. Without
a footnote plugin CommonMark reads them as link definitions, so they are
blanked before links are collected; line numbers are kept.
*/
export const stripFootnotes = (body) =>
  body.replace(/^ {0,3}\[\^[^\]\s]+\]:.*$/gm, '');

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

function checkReserved(name, file, doc, context, warn) {
  const rootIndex = file === resolve(context.bundle, 'index.md');
  if (rootIndex) return checkBundleMetadata(doc.metadata, file, context, warn);
  if (doc.metadata) {
    throw new Error(`${name} must not contain frontmatter`);
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

/** The bundle-root index carries bundle metadata (OKF v0.3 §8.1). */
function checkBundleMetadata(metadata, file, context, warn) {
  if (metadata?.okf_version === undefined) {
    throw new Error(`Root index must declare okf_version: "${OKF_VERSION}"`);
  }
  if (String(metadata.okf_version) !== OKF_VERSION) {
    throw new Error(`This checker supports okf_version ${OKF_VERSION}`);
  }
  for (const key of ['title', 'description']) {
    if (!textValue(metadata[key]))
      warn(`Recommended bundle ${key} is missing or empty`);
  }
  if (metadata.license !== undefined && !textValue(metadata.license))
    warn('Optional license should be an SPDX expression or a path');
  else if (/^(\.\.?\/|\/)/.test(metadata.license ?? ''))
    checkTarget(metadata.license, file, context);
}

function checkMetadata(metadata, file, context, warn) {
  if (!textValue(metadata?.type))
    throw new Error('Concept requires a nonempty string type');
  checkQuality(metadata, context, warn);
  checkResources(metadata, file, context, warn);
  checkVariables(metadata);
  checkTrust(metadata);
}

/** `<tool>/<model>` for agents, `<scheme>:<id>` for people and processes (OKF §7). */
const AGENT = /^[^\s/:]+\/\S+$/;
const ACTOR = /^[a-z][a-z\d-]*:\S+$/;

const timestamp = (value) =>
  TIMESTAMP.test(String(value)) && !Number.isNaN(Date.parse(value));

/**
Throw on malformed generated and verified frontmatter, an agent in verified,
and a stable concept without a current human verification. See
knowledge/decisions/actor-convention.md.
*/
function checkTrust(metadata) {
  const { generated } = metadata;
  if (generated !== undefined) {
    if (
      !mapping(generated) ||
      !(ACTOR.test(generated.by) || AGENT.test(generated.by))
    )
      throw new Error('generated needs an actor in by');
    if (generated.at !== undefined && !timestamp(generated.at))
      throw new Error('generated.at must be an RFC 3339 timestamp');
  }
  const events =
    metadata.verified === undefined
      ? []
      : Array.isArray(metadata.verified)
        ? metadata.verified
        : [metadata.verified];
  for (const event of events) {
    if (!mapping(event) || !ACTOR.test(event.by) || !timestamp(event.at))
      throw new Error(
        'verified events need a human: or process: actor in by and an RFC 3339 at',
      );
  }
  if (metadata.status !== 'stable') return;
  const since = generated?.at ? Date.parse(generated.at) : -Infinity;
  const reviewed = events.some(
    (event) => event.by.startsWith('human:') && Date.parse(event.at) >= since,
  );
  if (!reviewed)
    throw new Error(
      'status stable needs a human: verified event at or after generated.at',
    );
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
    const date = TIMESTAMP.test(String(metadata.stale_after))
      ? Date.parse(metadata.stale_after)
      : Number.NaN;
    if (Number.isNaN(date))
      warn('Invalid optional stale_after; use an RFC 3339 date or date-time');
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

/** Path fields other than sources[].resource (OKF v0.3 §6.2). */
const pathFields = (metadata) => [
  metadata.resource,
  metadata.superseded_by,
  metadata.computation,
  metadata.executor?.resource,
  metadata.attester?.resource,
];

function checkResources(metadata, file, context, warn) {
  const resources = pathFields(metadata);
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
      warn('Optional path field should be a nonempty string');
    // Explicit local prefixes distinguish paths from OKF scope descriptions.
    else if (/^(\.\.?\/|\/)/.test(resource))
      checkTarget(resource, file, context);
    else if (pathLike(resource))
      throw new Error(
        `Local resource needs a ./, ../ or / prefix: ${resource}`,
      );
  }
}

/** XYZ extension key listing the variables an Environment Variable concept documents. */
const VARIABLES = 'x-xyz-variables';

/** Throw on malformed variables: the environment coverage check relies on them. */
function checkVariables(metadata) {
  const variables = metadata[VARIABLES];
  if (variables === undefined) return;
  if (
    !Array.isArray(variables) ||
    !variables.every(
      (name) => typeof name === 'string' && /^[A-Z][A-Z0-9_]*\*?$/.test(name),
    )
  ) {
    throw new Error(
      `${VARIABLES} must be an array of NAME or PREFIX_* strings`,
    );
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

/**
Check the generated workspace schemas, the concept examples against the
strict schema, and the repository test workspaces against the open schema.
Bundles without a workspace directory, eg. test fixtures, have no schema.
*/
function checkWorkspaceSchema(context, errors, warnings) {
  if (!existsSync(resolve(context.bundle, 'workspace'))) return;
  try {
    checkSchemaExamples(context, errors, warnings);
  } catch (error) {
    // A malformed concept is reported on its own; the schema cannot be built.
    errors.push(`${SCHEMA_PATH}: not checked: ${error.message}`);
  }
}

function checkSchemaExamples(context, errors, warnings) {
  for (const path of staleSchemas(context.root))
    errors.push(`${path}: out of date; run pnpm knowledge:schema`);
  const schema = buildSchema(context.root);
  const strict = buildSchema(context.root, { strict: true });
  const examples = collectExamples(context.root);
  for (const example of examples) {
    const result = checkExample(strict, example.workspace);
    for (const error of result.errors)
      errors.push(`${example.path}: example ${error}`);
    for (const path of result.undocumented)
      errors.push(`${example.path}: example uses undocumented key ${path}`);
  }
  // The combined workspace adds the unfiltered twins which the tests run;
  // test bundles which do not document locales cannot describe it.
  if (examples.length && strict.properties?.locales) {
    const combined = checkExample(strict, combineExamples(examples));
    for (const error of combined.errors) errors.push(`${GENERATED}: ${error}`);
  }
  const tests = checkTestWorkspaces(context.root, schema);
  warnings.push(...tests.errors);
  if (tests.undocumented.size) {
    warnings.push(
      `knowledge/workspace: ${tests.undocumented.size} keys used in test workspaces have no concept: ${[...tests.undocumented.keys()].sort().join(', ')}`,
    );
  }
}

/** Check one Markdown file of the bundle; throws on errors. */
function checkFile(
  file,
  label,
  context,
  { owners, requires, variables, warn },
) {
  const text = readFileSync(file, 'utf8');
  const doc = splitDocument(text);
  const tokens = markdown.parse(stripFootnotes(doc.body), {});
  const name = basename(file);
  if (reserved(name)) checkReserved(name, file, doc, context, warn);
  else {
    checkMetadata(doc.metadata, file, context, warn);
    if (Array.isArray(doc.metadata[VARIABLES]))
      variables.push(...doc.metadata[VARIABLES].filter(textValue));
    // Each workspace key is owned by exactly one concept.
    for (const key of checkKeys(doc.metadata)) {
      if (owners.has(key))
        throw new Error(`${key} is already owned by ${owners.get(key)}`);
      owners.set(key, label);
    }
    for (const [key, target] of requirements(doc.metadata))
      requires.push({ label, key, target });
    checkBody(doc.metadata, tokens, text.split('\n').length, warn);
  }
  for (const target of linkTargets(tokens)) {
    checkTarget(target, file, context);
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
  const directories = walk(context.bundle);
  const files = markdownFiles(directories);
  if (!files.length) errors.push('Knowledge bundle contains no Markdown files');
  const variables = [];
  const owners = new Map();
  const requires = [];
  for (const file of files) {
    const label = relative(context.root, file).split(sep).join('/');
    const warn = (message) => warnings.push(`${label}: ${message}`);
    try {
      checkFile(file, label, context, { owners, requires, variables, warn });
    } catch (error) {
      errors.push(`${label}: ${error.message}`);
    }
  }
  for (const { label, key, target } of requires) {
    if (!owners.has(target))
      errors.push(`${label}: ${key} requires ${target}, which no concept owns`);
  }
  checkIndexes(directories, context, warnings);
  checkWorkspaceSchema(context, errors, warnings);
  const undocumented = [...readEnvironment(context.root)]
    .filter((name) => !covered(name, variables))
    .sort();
  if (undocumented.length) {
    errors.push(
      `knowledge/environment: ${undocumented.length} variables read in code have no concept: ${undocumented.join(', ')}`,
    );
  }
  return { errors, warnings, files: files.length, undocumented, owners };
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
