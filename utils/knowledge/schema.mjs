/**
Generate a JSON Schema for workspaces from the x-xyz-keys of the knowledge
concepts, and validate workspaces against it.

The schema uses only type, properties, items, additionalProperties, $ref and
anyOf, so any JSON Schema validator can use it; validateWorkspace implements
that subset for the knowledge check without a dependency. Unknown keys are
allowed, as the XYZ API accepts them, but reported as undocumented.

  node utils/knowledge/schema.mjs   # writes knowledge/workspace/workspace.schema.json
*/
import {
  existsSync,
  readdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from 'node:fs';
import { relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { KEY_ROOTS, KEYS } from './concepts.mjs';
import { splitDocument } from './validate.mjs';

/** The generated schema, an asset of the knowledge bundle. */
export const SCHEMA_PATH = 'knowledge/workspace/workspace.schema.json';

const list = (value) =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

function conceptFiles(directory, files = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) conceptFiles(path, files);
    else if (entry.name.endsWith('.md')) files.push(path);
  }
  return files.sort();
}

/** Every x-xyz-keys entry with the concept which owns it. */
export function collectKeys(root) {
  const keys = [];
  for (const file of conceptFiles(resolve(root, 'knowledge'))) {
    const metadata = splitDocument(readFileSync(file, 'utf8')).metadata;
    if (!Array.isArray(metadata?.[KEYS])) continue;
    const concept = relative(root, file).split(sep).join('/');
    for (const entry of metadata[KEYS]) keys.push({ ...entry, concept });
  }
  return keys;
}

const newNode = () => ({ children: {} });

/** Split a key path into its root and segments, eg. categories[] into categories and []. */
function segments(key) {
  return key
    .split('.')
    .flatMap((part) =>
      part.endsWith('[]') ? [part.slice(0, -2), '[]'] : [part],
    );
}

/** Build a tree of nodes per root from the key paths. */
function keyTree(keys) {
  const roots = Object.fromEntries(KEY_ROOTS.map((root) => [root, newNode()]));
  for (const entry of keys) {
    const [root, ...parts] = segments(entry.key);
    let node = roots[root];
    for (const part of parts) {
      if (part === '*') node = node.map ??= newNode();
      else if (part === '[]') node = node.items ??= newNode();
      else node = node.children[part] ??= newNode();
    }
    node.entry = entry;
  }
  return roots;
}

const typeSchema = (type, ref) => {
  if (ref && type === 'object') return { $ref: `#/$defs/${ref}` };
  if (ref && type === 'array')
    return { type: 'array', items: { $ref: `#/$defs/${ref}` } };
  return { type };
};

/** Annotations which tell agents where a key is documented. */
function annotations(entry) {
  if (!entry) return {};
  const result = { 'x-xyz-concept': entry.concept };
  if (entry.description) result.description = entry.description;
  if (entry.enum) result.enum = entry.enum;
  if (entry.deprecated) result.deprecated = true;
  if (typeof entry.deprecated === 'string')
    result['x-xyz-deprecated'] = entry.deprecated;
  if (entry.default !== undefined) result.default = entry.default;
  if (entry.formats) result['x-xyz-formats'] = list(entry.formats);
  if (entry.requires) result['x-xyz-requires'] = list(entry.requires);
  return result;
}

/** The structural part of a node: properties, named entries and items. */
function structure(node) {
  const result = {};
  const names = Object.keys(node.children).sort();
  if (names.length)
    result.properties = Object.fromEntries(
      names.map((name) => [name, nodeSchema(node.children[name])]),
    );
  if (node.map) result.additionalProperties = nodeSchema(node.map);
  if (node.items) result.items = nodeSchema(node.items);
  return result;
}

function nodeSchema(node) {
  const types = list(node.entry?.type);
  const ref = node.entry?.ref;
  const inner = structure(node);
  if (!types.length) types.push(node.items ? 'array' : 'object');
  const branches = types.map((type) => {
    const branch = typeSchema(type, ref);
    if (type === 'object')
      Object.assign(
        branch,
        inner.properties && { properties: inner.properties },
      );
    if (type === 'object' && inner.additionalProperties)
      branch.additionalProperties = inner.additionalProperties;
    if (type === 'array' && inner.items) branch.items = inner.items;
    return branch;
  });
  const schema = branches.length === 1 ? branches[0] : { anyOf: branches };
  return { ...schema, ...annotations(node.entry) };
}

/** The JSON Schema of a workspace generated from the concepts. */
export function buildSchema(root) {
  const roots = keyTree(collectKeys(root));
  const $defs = {};
  for (const name of KEY_ROOTS.filter((name) => name !== 'workspace')) {
    $defs[name] = nodeSchema(roots[name]);
  }
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://github.com/GEOLYTIX/xyz/blob/main/knowledge/workspace/workspace.schema.json',
    title: 'XYZ workspace',
    description:
      'Generated from the x-xyz-keys of the knowledge concepts by pnpm knowledge:schema. Unknown keys are allowed but undocumented.',
    ...nodeSchema(roots.workspace),
    $defs,
  };
}

const jsonType = (value) =>
  value === null
    ? 'null'
    : Array.isArray(value)
      ? 'array'
      : Number.isInteger(value)
        ? 'integer'
        : typeof value;

const typeMatches = (type, value) =>
  type === jsonType(value) ||
  (type === 'number' && jsonType(value) === 'integer');

/** Validate a value; type errors and undocumented key paths are collected. */
function check(schema, value, path, context) {
  if (schema.$ref) {
    const def = context.defs[schema.$ref.split('/').pop()];
    const { $ref, ...rest } = schema;
    // Sibling properties extend the referenced definition.
    const properties = { ...def.properties, ...rest.properties };
    check({ ...def, ...rest, properties }, value, path, context);
    return;
  }
  if (schema.enum && value !== null && !schema.enum.includes(value)) {
    const values = schema.enum.map((option) => JSON.stringify(option));
    context.errors.push(
      `${path}: expected one of ${values.join(', ')}, got ${JSON.stringify(value)}`,
    );
    return;
  }
  if (schema.anyOf) {
    const branch = schema.anyOf.find((option) =>
      typeMatches(option.type ?? 'object', value),
    );
    if (!branch) {
      context.errors.push(
        `${path}: expected ${schema.anyOf.map((o) => o.type ?? 'object').join(' or ')}, got ${jsonType(value)}`,
      );
      return;
    }
    check(branch, value, path, context);
    return;
  }
  // A null value means an absent key.
  if (value === null) return;
  if (schema.type && !typeMatches(schema.type, value)) {
    context.errors.push(
      `${path}: expected ${schema.type}, got ${jsonType(value)}`,
    );
    return;
  }
  if (Array.isArray(value) && schema.items) {
    value.forEach((item, index) =>
      check(schema.items, item, `${path}[${index}]`, context),
    );
  }
  if (jsonType(value) !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    const childPath = path ? `${path}.${key}` : key;
    if (schema.properties?.[key]) {
      check(schema.properties[key], child, childPath, context);
    } else if (typeof schema.additionalProperties === 'object') {
      check(schema.additionalProperties, child, childPath, context);
    } else {
      context.undocumented.push(childPath);
    }
  }
}

/**
Validate a workspace, or a locale or layer with the def name, against the
schema. Returns type errors and undocumented key paths.
*/
export function validateWorkspace(schema, value, def) {
  const context = { defs: schema.$defs, errors: [], undocumented: [] };
  check(def ? { $ref: `#/$defs/${def}` } : schema, value, def ?? '', context);
  return context;
}

/**
Generalise a concrete path to a readable key pattern, eg.
locales.uk.layers.osm.infoj[2].field to locales.*.layers.*.infoj[].field.
*/
export const keyPattern = (path) =>
  path
    .replace(/\[\d+\]/g, '[]')
    .replace(
      /(^|\.)(locales|layers|templates|dataviews|themes|roles)\.[^.]+/g,
      '$1$2.*',
    );

/** Template contents are partial layers, locales or queries and not checked. */
const templateContent = (path) => /^templates\.[^.]+\./.test(path);

/** Workspaces of the repository tests, checked for undocumented keys. */
export const TEST_WORKSPACES = [
  'apps/mapp/tests/workspaces/_workspace.json',
  'apps/ui/tests/workspaces/_workspace.json',
  'packages/testhost/workspaces/testview.json',
  'public/workspace.json',
];

/** The def of a template from its content: a locale has layers, a layer a format. */
const templateDef = (template) =>
  template.layers ? 'locale' : template.format ? 'layer' : undefined;

/** Workspaces and their file templates as [label, value, def] for validation. */
function testObjects(root) {
  const objects = [];
  for (const file of TEST_WORKSPACES) {
    const path = resolve(root, file);
    if (!existsSync(path)) continue;
    const workspace = JSON.parse(readFileSync(path, 'utf8'));
    objects.push([file, workspace, undefined]);
    for (const template of Object.values(workspace.templates ?? {})) {
      const src = /^file:(.+\.json)$/.exec(template?.src ?? '')?.[1];
      const value =
        src && existsSync(resolve(root, src))
          ? JSON.parse(readFileSync(resolve(root, src), 'utf8'))
          : template;
      const def = templateDef(value);
      if (def) objects.push([src ?? file, value, def]);
    }
  }
  return objects;
}

/**
Validate the repository test workspaces. Returns type errors and the
undocumented key patterns with a file which uses each.
*/
export function checkTestWorkspaces(root, schema) {
  const errors = [];
  const undocumented = new Map();
  for (const [label, value, def] of testObjects(root)) {
    const result = validateWorkspace(schema, value, def);
    errors.push(...result.errors.map((error) => `${label}: ${error}`));
    for (const path of result.undocumented.filter((p) => !templateContent(p)))
      undocumented.set(keyPattern(path), label);
  }
  return { errors, undocumented };
}

/** Validate an example; undocumented keys outside templates are returned. */
export function checkExample(schema, workspace) {
  const result = validateWorkspace(schema, workspace);
  return {
    errors: result.errors,
    undocumented: result.undocumented.filter((path) => !templateContent(path)),
  };
}

/** Write the schema and return its path. */
export function writeSchema(root) {
  const path = resolve(root, SCHEMA_PATH);
  writeFileSync(path, `${JSON.stringify(buildSchema(root), null, 2)}\n`);
  return path;
}

/** Whether the committed schema matches the concepts. */
export function schemaCurrent(root) {
  const path = resolve(root, SCHEMA_PATH);
  if (!existsSync(path)) return false;
  return (
    readFileSync(path, 'utf8').replace(/\r\n/g, '\n') ===
    `${JSON.stringify(buildSchema(root), null, 2)}\n`
  );
}

const main = process.argv[1] && realpathSync(resolve(process.argv[1]));
if (main === realpathSync(fileURLToPath(import.meta.url))) {
  console.log(writeSchema(fileURLToPath(new URL('../../', import.meta.url))));
}
