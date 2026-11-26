/**
Generate JSON Schemas for workspaces from the x-xyz-keys of the knowledge
concepts, and validate workspaces against them.

The open schema checks the types and values of documented keys and allows
unknown keys, which the knowledge check reports as undocumented; it describes
the documented keys, not everything the XYZ API accepts. The strict schema is
the contract for generated workspaces: documented objects are closed with
unevaluatedProperties, and required keys are enforced with if/then.

An object stays open in both schemas, annotated x-xyz-open, when its key is
marked open or no concept documents its keys, eg. options passed on to a
library; the check does not report the keys of an open object.

Requirements describe the composed object, so they are skipped for objects
with a template or templates key, and for the layers of a locale whose
locale.layer, its own or the workspace.locale's, may supply them. Values
which are merged into other objects, eg. locale.layer and roles entries,
reference a partial definition without the requirements. Neither schema
resolves templates or merges; validating the composed workspace is a
follow-up. Optional keys accept null, which XYZ treats as unset because a
merge copies it over a template value; required keys and object or array map
entries, eg. a layer of a locale, do not.

Both use only type, enum, pattern, minimum, maximum, properties, items,
additionalProperties, unevaluatedProperties, required, $ref, anyOf, allOf and
if/then, so any JSON Schema 2020-12 validator can use them; validateWorkspace
implements that subset for the knowledge check without a dependency.

  node utils/knowledge/schema.mjs   # writes both schemas to knowledge/workspace
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
import {
  KEY_ROOTS,
  KEYS,
  keyEntries,
  keyName,
  requiredRule,
} from './concepts.mjs';
import { markdownFiles } from './files.mjs';
import { splitDocument } from './validate.mjs';

/** The generated schemas, assets of the knowledge bundle. */
export const SCHEMA_PATH = 'knowledge/workspace/workspace.schema.json';
export const STRICT_SCHEMA_PATH =
  'knowledge/workspace/workspace.strict.schema.json';

/** Keys which merge another object into theirs and exempt it from requirements. */
const TEMPLATE_KEYS = ['template', 'templates'];

/**
Keys whose value is merged with other objects before XYZ uses it, so it may
be partial: locale.layer under each layer, a layer over its locale.layer,
and a roles entry over its object. In the strict schema they reference the
partial definition of their root, which has no requirements of its own.
*/
const PARTIAL_KEYS = [
  'locale.layer',
  'locale.layers.*',
  'layer.roles.*',
  'locale.roles.*',
  'entry.roles.*',
];

/** The name of the partial definition of a root. */
const partialDef = (name) => `${name}-partial`;

/** Properties which must be absent: the keys which may supply a locale.layer. */
const noLayerDefaults = () =>
  Object.fromEntries(['layer', ...TEMPLATE_KEYS].map((name) => [name, false]));

const list = (value) =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

/**
Every valid x-xyz-keys entry with the concept which owns it. A concept which
does not parse, and a malformed entry, are skipped; knowledge:check reports
them, so one malformed concept does not stop the schema checks of the others.
*/
export function collectKeys(root) {
  const keys = [];
  for (const file of markdownFiles(resolve(root, 'knowledge'))) {
    let metadata;
    try {
      metadata = splitDocument(readFileSync(file, 'utf8')).metadata;
    } catch {
      continue;
    }
    const concept = relative(root, file).split(sep).join('/');
    for (const entry of keyEntries(metadata, () => {}))
      keys.push({ ...entry, concept });
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

/** Annotations which tell agents where a key is documented, and value constraints. */
function annotations(entry) {
  if (!entry) return {};
  const result = { 'x-xyz-concept': entry.concept };
  if (entry.description) result.description = entry.description;
  if (entry.enum) result.enum = entry.enum;
  if (entry.examples) result.examples = entry.examples;
  for (const field of ['pattern', 'minimum', 'maximum'])
    if (entry[field] !== undefined) result[field] = entry[field];
  if (entry.deprecated) result.deprecated = true;
  if (typeof entry.deprecated === 'string')
    result['x-xyz-deprecated'] = entry.deprecated;
  if (entry.default !== undefined) result.default = entry.default;
  if (entry.formats) result['x-xyz-formats'] = list(entry.formats);
  if (entry.requires) result['x-xyz-requires'] = list(entry.requires);
  if (entry.required) result['x-xyz-required'] = entry.required;
  if (entry.open) result['x-xyz-open'] = true;
  return result;
}

/**
The if/then rules of the required children of an object node. The condition
names the sibling values of `when` and excludes objects which merge a
template.
*/
function requiredRules(node) {
  const exempt = TEMPLATE_KEYS.filter((name) => node.children[name]);
  const rules = [];
  for (const [name, child] of Object.entries(node.children).sort()) {
    const rule = child.entry && requiredRule(child.entry);
    if (!rule) continue;
    const properties = Object.fromEntries([
      ...Object.entries(rule.when).map(([key, values]) => [
        keyName(key),
        { enum: list(values) },
      ]),
      ...exempt.map((key) => [key, false]),
    ]);
    const condition = { properties };
    if (Object.keys(rule.when).length)
      condition.required = Object.keys(rule.when).map(keyName);
    const names = [name, ...rule.or.map(keyName)];
    const then =
      names.length === 1
        ? { required: names }
        : { anyOf: names.map((option) => ({ required: [option] })) };
    rules.push({ if: condition, then });
  }
  return rules;
}

const SCALARS = new Set(['string', 'number', 'integer', 'boolean']);

/** An optional key, which accepts null as unset. */
const nullableKey = (node) => !requiredRule(node.entry ?? {});

/** A map entry with scalar values, eg. a zoom table, which accepts null. */
const nullableEntry = (node) =>
  !node.entry?.ref && list(node.entry?.type).some((type) => SCALARS.has(type));

/** The structural part of a node: properties, named entries and items. */
function structure(node, { strict, partials }) {
  const options = { strict, partials };
  const result = {};
  const names = Object.keys(node.children).sort();
  if (names.length)
    result.properties = Object.fromEntries(
      names.map((name) => [
        name,
        nodeSchema(node.children[name], {
          ...options,
          nullable: nullableKey(node.children[name]),
        }),
      ]),
    );
  if (node.map)
    result.additionalProperties = nodeSchema(node.map, {
      ...options,
      nullable: nullableEntry(node.map),
    });
  if (node.items) result.items = nodeSchema(node.items, options);
  return result;
}

/** Add the strict rules to an object branch: requirements and closure. */
function strictRules(branch, node, options) {
  const rules = options.partial ? [] : requiredRules(node);
  if (rules.length) branch.allOf = rules;
  const documented = branch.properties || branch.$ref;
  // A definition is closed where it is referenced, so that sibling
  // properties of the reference stay evaluated.
  if (documented && !node.entry?.open && !options.definition)
    branch.unevaluatedProperties = false;
}

function nodeSchema(node, options = {}) {
  const types = list(node.entry?.type);
  const ref =
    node.entry?.ref &&
    options.partials?.has(node.entry.ref) &&
    PARTIAL_KEYS.includes(node.entry.key)
      ? partialDef(node.entry.ref)
      : node.entry?.ref;
  const inner = structure(node, options);
  if (!types.length) types.push(node.items ? 'array' : 'object');
  // No concept documents the keys of the object, eg. library options.
  const opaque =
    types.includes('object') &&
    !ref &&
    !Object.keys(node.children).length &&
    !node.map;
  const branches = types.map((type) => {
    const branch = typeSchema(type, ref);
    if (type === 'object')
      Object.assign(
        branch,
        inner.properties && { properties: inner.properties },
      );
    if (type === 'object' && inner.additionalProperties)
      branch.additionalProperties = inner.additionalProperties;
    if (type === 'object' && options.strict) strictRules(branch, node, options);
    if (type === 'array' && inner.items) branch.items = inner.items;
    if (type === 'array' && ref && options.strict && !node.entry?.open)
      branch.items.unevaluatedProperties = false;
    return branch;
  });
  const schema = branches.length === 1 ? branches[0] : { anyOf: branches };
  const result = {
    ...(options.nullable ? allowNull(schema) : schema),
    ...annotations(node.entry),
  };
  if (opaque) result['x-xyz-open'] = true;
  if (options.nullable && result.enum) result.enum = [...result.enum, null];
  return result;
}

/** A schema which also accepts null; a reference becomes a branch of anyOf. */
function allowNull(schema) {
  if (schema.anyOf) return { anyOf: [...schema.anyOf, { type: 'null' }] };
  if (schema.$ref) return { anyOf: [schema, { type: 'null' }] };
  return { ...schema, type: [schema.type, 'null'] };
}

const SCHEMA_URL = 'https://github.com/GEOLYTIX/xyz/blob/main/';

/**
The JSON Schema of a workspace generated from the concepts; strict closes
documented objects and enforces required keys.
*/
export function buildSchema(root, { strict = false } = {}) {
  const roots = keyTree(collectKeys(root));
  const names = KEY_ROOTS.filter((name) => name !== 'workspace');
  // Only a root with requirements of its own needs a partial definition.
  const partials = new Set(
    strict ? names.filter((name) => requiredRules(roots[name]).length) : [],
  );
  const options = { strict, partials, definition: true };
  const $defs = {};
  for (const name of names) {
    if (!partials.has(name)) {
      $defs[name] = nodeSchema(roots[name], options);
      continue;
    }
    // The definition adds its requirements to the partial one.
    $defs[partialDef(name)] = {
      ...nodeSchema(roots[name], { ...options, partial: true }),
      description: `The keys of a ${name} without its requirements, for a value which is merged with others.`,
    };
    $defs[name] = {
      $ref: `#/$defs/${partialDef(name)}`,
      allOf: requiredRules(roots[name]),
    };
  }
  const workspace = nodeSchema(roots.workspace, { strict, partials });
  if (partials.has('layer')) {
    $defs['locale-layers'] = localeLayers();
    workspace.allOf = [...(workspace.allOf ?? []), workspaceLayers()];
  }
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: `${SCHEMA_URL}${strict ? STRICT_SCHEMA_PATH : SCHEMA_PATH}`,
    title: strict ? 'XYZ workspace (strict)' : 'XYZ workspace',
    description: strict
      ? 'Generated from the x-xyz-keys of the knowledge concepts by pnpm knowledge:schema, for generating workspaces. Documented objects are closed and required keys are enforced; an object with a template or templates key is exempt from requirements.'
      : 'Generated from the x-xyz-keys of the knowledge concepts by pnpm knowledge:schema. Unknown keys are allowed but undocumented.',
    ...workspace,
    $defs,
  };
}

/**
The requirements of the layers of a locale without a locale.layer or
template which may supply their keys; its layers reference the partial
layer otherwise.
*/
const localeLayers = () => ({
  description:
    'Applies the layer requirements to the layers of a locale without a locale.layer, template or templates.',
  allOf: [
    {
      if: { properties: noLayerDefaults() },
      then: {
        properties: {
          layers: { additionalProperties: { $ref: '#/$defs/layer' } },
        },
      },
    },
  ],
});

/**
Every locale is merged into workspace.locale, so its locale.layer is the
default for the layers of every locale.
*/
const workspaceLayers = () => ({
  if: { properties: { locale: { properties: noLayerDefaults() } } },
  then: {
    properties: {
      locale: { $ref: '#/$defs/locale-layers' },
      locales: { additionalProperties: { $ref: '#/$defs/locale-layers' } },
    },
  },
});

const jsonType = (value) =>
  value === null
    ? 'null'
    : Array.isArray(value)
      ? 'array'
      : Number.isInteger(value)
        ? 'integer'
        : typeof value;

const typeMatches = (types, value) =>
  list(types).some(
    (type) =>
      type === jsonType(value) ||
      (type === 'number' && jsonType(value) === 'integer'),
  );

const present = (value, name) =>
  Object.hasOwn(value, name) && value[name] !== null;

/**
Whether a value meets an if condition: required keys, enum, absent (false)
and nested properties. Like JSON Schema, a condition holds for a value which
is not an object.
*/
function conditionMet(condition, value) {
  if (jsonType(value) !== 'object') return true;
  if (!(condition.required ?? []).every((name) => present(value, name)))
    return false;
  return Object.entries(condition.properties ?? {}).every(([name, rule]) =>
    rule === false
      ? !Object.hasOwn(value, name)
      : !present(value, name) ||
        (rule.enum
          ? rule.enum.includes(value[name])
          : conditionMet(rule, value[name])),
  );
}

/** Describe the when condition of a requirement for an error message. */
const conditionText = (condition) =>
  (condition.required ?? [])
    .map(
      (name) =>
        `${name} is ${condition.properties[name].enum.map((v) => JSON.stringify(v)).join(' or ')}`,
    )
    .join(' and ');

/** The expected types of an error message; null is implied for optional keys. */
const typeNames = (types) =>
  list(types)
    .filter((type) => type !== 'null')
    .join(' or ');

/** Whether the then of a rule names required keys, rather than a schema. */
const requirement = (rule) => rule.then.required || rule.then.anyOf;

/** Check the if/then requirements of an object. */
function checkRequirements(rules, value, path, context) {
  for (const rule of rules.filter(requirement)) {
    if (!conditionMet(rule.if, value)) continue;
    const options = rule.then.anyOf ?? [rule.then];
    const names = options.flatMap((option) => option.required);
    if (names.some((name) => present(value, name))) continue;
    const when = conditionText(rule.if);
    context.errors.push(
      `${path || 'workspace'}: missing ${names.join(' or ')}${when ? ` (required when ${when})` : ''}`,
    );
  }
}

/**
Apply the if/then rules whose then is a schema, eg. the layer requirements of
a locale, after the keys of the object. Its undocumented keys are reported by
the schema it extends.
*/
function checkRuleSchemas(rules, value, path, context) {
  for (const rule of rules.filter((rule) => !requirement(rule))) {
    if (conditionMet(rule.if, value))
      check(rule.then, value, path, { ...context, undocumented: [] });
  }
}

/** Check pattern, minimum and maximum of a scalar. */
function checkValue(schema, value, path, context) {
  const fail = (message) => context.errors.push(`${path}: ${message}`);
  if (
    schema.pattern &&
    typeof value === 'string' &&
    !new RegExp(schema.pattern, 'u').test(value)
  )
    fail(`${JSON.stringify(value)} does not match ${schema.pattern}`);
  if (typeof value !== 'number') return;
  if (schema.minimum !== undefined && value < schema.minimum)
    fail(`${value} is less than ${schema.minimum}`);
  if (schema.maximum !== undefined && value > schema.maximum)
    fail(`${value} is greater than ${schema.maximum}`);
}

/** Merge a reference with its definition; sibling properties and rules extend it. */
function resolveRef(schema, context) {
  const def = context.defs[schema.$ref.split('/').pop()];
  const { $ref, ...rest } = schema;
  const merged = {
    ...def,
    ...rest,
    properties: { ...def.properties, ...rest.properties },
  };
  const allOf = [...(def.allOf ?? []), ...(rest.allOf ?? [])];
  if (allOf.length) merged.allOf = allOf;
  return merged;
}

/** Validate a value; type errors and undocumented key paths are collected. */
function check(schema, value, path, context) {
  if (schema.$ref) {
    check(resolveRef(schema, context), value, path, context);
    return;
  }
  if (schema.enum && !schema.enum.includes(value)) {
    const values = schema.enum
      .filter((option) => option !== null)
      .map((option) => JSON.stringify(option));
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
        `${path}: expected ${typeNames(schema.anyOf.map((o) => o.type ?? 'object'))}, got ${jsonType(value)}`,
      );
      return;
    }
    // Value constraints of a key with several types sit beside anyOf.
    checkValue(schema, value, path, context);
    const open = schema['x-xyz-open'] && { 'x-xyz-open': true };
    check({ ...branch, ...open }, value, path, context);
    return;
  }
  if (schema.type && !typeMatches(schema.type, value)) {
    context.errors.push(
      `${path}: expected ${typeNames(schema.type)}, got ${jsonType(value)}`,
    );
    return;
  }
  checkValue(schema, value, path, context);
  if (Array.isArray(value) && schema.items) {
    value.forEach((item, index) =>
      check(schema.items, item, `${path}[${index}]`, context),
    );
  }
  if (jsonType(value) !== 'object') return;
  checkRequirements(schema.allOf ?? [], value, path, context);
  checkProperties(schema, value, path, context);
  checkRuleSchemas(schema.allOf ?? [], value, path, context);
}

/** Check the keys of an object; unknown keys are undocumented, or errors where closed. */
function checkProperties(schema, value, path, context) {
  for (const [key, child] of Object.entries(value)) {
    const childPath = path ? `${path}.${key}` : key;
    if (schema.properties?.[key]) {
      check(schema.properties[key], child, childPath, context);
    } else if (typeof schema.additionalProperties === 'object') {
      check(schema.additionalProperties, child, childPath, context);
    } else if (schema.unevaluatedProperties === false) {
      context.errors.push(`${childPath}: not allowed; no concept documents it`);
    } else if (!schema['x-xyz-open']) {
      // Keys of an open object are passed on, eg. to a library, by design.
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
  // A definition validated on its own is closed like a reference to it.
  const closed = schema.unevaluatedProperties === false && {
    unevaluatedProperties: false,
  };
  const target = def ? { $ref: `#/$defs/${def}`, ...closed } : schema;
  check(target, value, def ?? '', context);
  // A value checked by a rule and by its schema reports an error once.
  context.errors = [...new Set(context.errors)];
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

/** The schema files and their content as [path, text]. */
const schemaFiles = (root) =>
  [
    [SCHEMA_PATH, buildSchema(root)],
    [STRICT_SCHEMA_PATH, buildSchema(root, { strict: true })],
  ].map(([path, schema]) => [path, `${JSON.stringify(schema, null, 2)}\n`]);

/** Write both schemas and return their paths. */
export function writeSchema(root) {
  return schemaFiles(root).map(([path, text]) => {
    writeFileSync(resolve(root, path), text);
    return path;
  });
}

/** The committed schemas which are missing or differ from the concepts. */
export function staleSchemas(root) {
  return schemaFiles(root)
    .filter(([path, text]) => {
      const file = resolve(root, path);
      return (
        !existsSync(file) ||
        readFileSync(file, 'utf8').replace(/\r\n/g, '\n') !== text
      );
    })
    .map(([path]) => path);
}

const main = process.argv[1] && realpathSync(resolve(process.argv[1]));
if (main === realpathSync(fileURLToPath(import.meta.url))) {
  console.log(
    writeSchema(fileURLToPath(new URL('../../', import.meta.url))).join('\n'),
  );
}
