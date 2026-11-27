import {
  existsSync,
  readdirSync,
  readFileSync,
  realpathSync,
  statSync,
} from 'node:fs';
import { basename, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import MarkdownIt from 'markdown-it';
import { parse } from 'yaml';
import { checkBody, checkKeys, requirements } from './concepts.mjs';
import { collectExamples, combineExamples, GENERATED } from './examples.mjs';
import {
  LOCAL_PREFIX,
  markdownFiles,
  posix,
  reserved,
  localTarget as resolveTarget,
  directories as walk,
} from './files.mjs';
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

/** The OKF specification version this checker implements. */
export const OKF_VERSION = '0.3';

/** RFC 3339 date-time with an offset, or a full date (OKF v0.3 §5). */
const TIMESTAMP =
  /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/i;

/**
Directories and files scanned for environment variables read by the XYZ API,
its server entry, and the auth and SAML apps.
*/
const ENV_SOURCES = [
  'apps/xyz/mod',
  'apps/xyz/router.js',
  'apps/xyz/server.js',
  'apps/auth',
  'apps/saml',
];

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

function linkTargets(tokens) {
  const targets = [];
  for (const token of tokens) {
    if (token.type === 'link_open') targets.push(token.attrGet('href'));
    if (token.type === 'image') targets.push(token.attrGet('src'));
    if (token.children) targets.push(...linkTargets(token.children));
  }
  return targets;
}

const localTarget = (target, file, context) =>
  resolveTarget(target, file, context.bundle);

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
  else if (LOCAL_PREFIX.test(metadata.license ?? ''))
    checkTarget(metadata.license, file, context);
}

/**
Check the frontmatter of a concept and report each failing check. Throws when
the concept has no frontmatter, so its concept rules are not checked.
*/
function checkMetadata(metadata, file, context, warn, attempt) {
  if (!mapping(metadata))
    throw new Error('Concept requires frontmatter with a nonempty string type');
  attempt(() => {
    if (!textValue(metadata.type))
      throw new Error('Concept requires a nonempty string type');
  });
  checkQuality(metadata, context, warn);
  checkResources(metadata, file, context, warn, attempt);
  attempt(() => checkVariables(metadata));
  attempt(() => checkTrust(metadata));
  return true;
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

function checkResources(metadata, file, context, warn, attempt) {
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
    else if (LOCAL_PREFIX.test(resource))
      attempt(() => checkTarget(resource, file, context));
    else if (pathLike(resource))
      attempt(() => {
        throw new Error(
          `Local resource needs a ./, ../ or / prefix: ${resource}`,
        );
      });
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

/** A slash after one of these starts a regular expression, not a division. */
const REGEX_PRECEDES =
  /(?:^|[(,=:[!&|?{};+\-*%<>~^]|\b(?:return|typeof|case|do|else|in|of|void|yield|await|delete|throw|new))\s*$/;

/**
@function stripComments
@description
Removes block and line comments from JavaScript source.

Strings, template literals and regular expressions are copied unchanged, so a
// or /* inside them, eg. in a URL or a glob, does not start a comment. A block
comment is replaced by a space so that the code on either side stays apart.

The source is walked once by [codeStep]{@link codeStep}, which shares a state
object with [copyLiteral]{@link copyLiteral} and
[copyTemplate]{@link copyTemplate}.
@param {string} code The JavaScript source.
@returns {string} The source without comments.
*/
export function stripComments(code) {
  const state = { code, i: 0, out: '', depth: 0, substitutions: [] };
  while (state.i < code.length) codeStep(state);
  return state.out;
}

/**
@function codeStep
@description
Consumes the comment, literal or single character of code at `state.i`.

A comment is dropped. A string, regular expression or template literal is
copied by [copyLiteral]{@link copyLiteral} or [copyTemplate]{@link copyTemplate}.
A slash starts a regular expression when the code before it ends in an operator,
a punctuator or a keyword such as `return`, and a division otherwise.

Braces are counted so that the } which closes a `${` substitution resumes its
template literal.
@param {Object} state The scan state of [stripComments]{@link stripComments}.
@property {string} state.code The JavaScript source.
@property {number} state.i The index of the next character, advanced past the token.
@property {string} state.out The source without comments, extended by the token.
@property {number} state.depth The number of open braces in code.
@property {Array<number>} state.substitutions The brace depth at which each open `${` substitution closes.
*/
function codeStep(state) {
  const { code, i } = state;
  const c = code[i];
  const next = code[i + 1];
  if (c === '/' && next === '/') {
    const end = code.indexOf('\n', i);
    state.i = end < 0 ? code.length : end;
  } else if (c === '/' && next === '*') {
    const end = code.indexOf('*/', i + 2);
    state.i = end < 0 ? code.length : end + 2;
    state.out += ' ';
  } else if (c === "'" || c === '"') {
    copyLiteral(state, c);
  } else if (c === '/' && REGEX_PRECEDES.test(state.out.slice(-32))) {
    copyLiteral(state, '/');
  } else if (c === '`') {
    state.out += c;
    state.i++;
    copyTemplate(state);
  } else {
    state.out += c;
    state.i++;
    if (c === '{') state.depth++;
    // A } at the depth of the innermost ${ resumes its template literal.
    if (c === '}' && state.substitutions.at(-1) === --state.depth) {
      state.substitutions.pop();
      copyTemplate(state);
    }
  }
}

/**
@function copyLiteral
@description
Copies the string or regular expression literal which starts at `state.i`.

The literal ends at its unescaped closing character, or at the end of the line
for an unterminated literal. A closing slash inside a character class, eg.
`/[/]/`, does not end a regular expression.
@param {Object} state The scan state of [stripComments]{@link stripComments}.
@param {string} close The closing character: a quote or a slash.
@property {string} state.code The JavaScript source.
@property {number} state.i The index of the opening character, advanced past the literal.
@property {string} state.out The source without comments, extended by the literal.
*/
function copyLiteral(state, close) {
  const { code, i } = state;
  let j = i + 1;
  let inClass = false;
  while (j < code.length && code[j] !== '\n') {
    const c = code[j];
    j += c === '\\' ? 2 : 1;
    if (c === '\\') continue;
    if (close === '/' && (c === '[' || c === ']')) inClass = c === '[';
    else if (c === close && !inClass) break;
  }
  state.out += code.slice(i, j);
  state.i = j;
}

/**
@function copyTemplate
@description
Copies a template literal from `state.i` up to its closing backtick or its next
`${`.

A `${` opens a substitution: its brace depth is pushed onto
`state.substitutions`, and [codeStep]{@link codeStep} scans the substitution as
code until the matching } resumes the template literal.
@param {Object} state The scan state of [stripComments]{@link stripComments}.
@property {string} state.code The JavaScript source.
@property {number} state.i The index inside the template literal, advanced past the copied text.
@property {string} state.out The source without comments, extended by the copied text.
@property {number} state.depth The number of open braces in code, raised by a `${`.
@property {Array<number>} state.substitutions The brace depth at which each open `${` substitution closes.
*/
function copyTemplate(state) {
  const { code } = state;
  let j = state.i;
  while (j < code.length && code[j] !== '`' && !code.startsWith('${', j)) {
    j += code[j] === '\\' ? 2 : 1;
  }
  if (code[j] === '`') j++;
  else if (j < code.length) {
    j += 2;
    state.substitutions.push(state.depth++);
  }
  state.out += code.slice(state.i, j);
  state.i = j;
}

/**
@function readEnvironment
@description
Collects the `xyzEnv` and `process.env` names read by the XYZ API, its server
entry, and the auth and SAML apps.

Comments are removed by [stripComments]{@link stripComments} first, since they
describe variables without reading them. Platform and test runner names, and
the WALLET derived by processEnv, are ignored.
@param {string} root The repository directory.
@returns {Set<string>} The environment variable names.
*/
export function readEnvironment(root) {
  const names = new Set();
  const pattern =
    /\b(?:xyzEnv|process\.env)(?:\.([A-Z][A-Z0-9_]*)\b|\[['"`]([A-Z][A-Z0-9_]*)['"`]\])/g;
  for (const source of ENV_SOURCES) {
    for (const file of sourceFiles(resolve(root, source))) {
      // Comments describe variables; only code reads count.
      const code = stripComments(readFileSync(file, 'utf8'));
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

/**
Check one Markdown file of the bundle and report each failing check with
error. A file which does not parse is not checked further.
*/
function checkFile(
  file,
  label,
  context,
  { owners, requires, variables, warn, error },
) {
  const report = (failure) => error(failure.message);
  const attempt = (check) => {
    try {
      return check();
    } catch (failure) {
      report(failure);
    }
  };
  const text = readFileSync(file, 'utf8');
  const doc = attempt(() => splitDocument(text));
  if (!doc) return;
  const tokens = markdown.parse(stripFootnotes(doc.body), {});
  const name = basename(file);
  if (reserved(name))
    attempt(() => checkReserved(name, file, doc, context, warn));
  else if (
    attempt(() => checkMetadata(doc.metadata, file, context, warn, attempt))
  ) {
    if (Array.isArray(doc.metadata[VARIABLES]))
      variables.push(...doc.metadata[VARIABLES].filter(textValue));
    // Each workspace key is owned by exactly one concept.
    for (const key of checkKeys(doc.metadata, report)) {
      if (owners.has(key))
        error(`${key} is already owned by ${owners.get(key)}`);
      else owners.set(key, label);
    }
    for (const [key, target] of requirements(doc.metadata))
      requires.push({ label, key, target });
    checkBody(doc.metadata, tokens, text.split('\n').length, warn, report);
  }
  for (const target of linkTargets(tokens)) {
    attempt(() => checkTarget(target, file, context));
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
  const files = markdownFiles(context.bundle);
  if (!files.length) errors.push('Knowledge bundle contains no Markdown files');
  const variables = [];
  const owners = new Map();
  const requires = [];
  for (const file of files) {
    const label = posix(relative(context.root, file));
    const warn = (message) => warnings.push(`${label}: ${message}`);
    const error = (message) => errors.push(`${label}: ${message}`);
    checkFile(file, label, context, {
      owners,
      requires,
      variables,
      warn,
      error,
    });
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
