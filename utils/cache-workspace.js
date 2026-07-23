#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

if (args.workspace) {
  process.env.WORKSPACE = args.workspace;
}

await import('../mod/utils/processEnv.js');

if (!globalThis.xyzEnv.WORKSPACE) {
  throw new Error('WORKSPACE must be provided by env or --workspace.');
}

const [{ default: workspaceCache }, { default: getSrc }] = await Promise.all([
  import('../mod/workspace/cache.js'),
  import('../mod/provider/getSrc.js'),
]);

const workspace = await workspaceCache(true);

if (workspace instanceof Error) {
  throw workspace;
}

const output = resolve(args.output || './workspace.generated.json');

/**
Map of src references against the key of their assembled template in workspace.templates{}. Source responses are stored once and are reused through the template key.
*/
const hoistedSrcKeys = new Map();

/**
Map of explicit nested reference keys against the set of src references using the key. A key referencing different sources is ambiguous and cannot share one assembled template.
*/
const keySrcs = new Map();

/**
Objects inspected by the hoistSources method to avoid infinite recursion.
*/
const inspectedObjects = new WeakSet();

// Inline the source body into every workspace template definition.
for (const def of Object.values(workspace.templates)) {
  await assembleSource(def);
}

// Collect the explicit keys of nested source references prior to hoisting.
await collectKeySrcs(workspace, new WeakSet(), new Set());

// Register the sources of assembled definitions for reuse by nested references.
for (const [key, def] of Object.entries(workspace.templates)) {
  if (def.srcLoaded && !hoistedSrcKeys.has(def.src)) {
    hoistedSrcKeys.set(def.src, key);
  }
}

await hoistSources(workspace);

await mkdir(dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(workspace, null, 2)}\n`);

console.log(`Generated workspace: ${output}`);

/**
@function assembleSource
@async

@description
Assembles the source response into the object which references the source through its src property.

The response is assembled like the getTemplate method does. An object response is assigned into the object. A string response is assigned as template property.

The srcLoaded flag prevents the src from being read when the object is requested from the cached workspace.

Module templates are not assembled as their render method cannot be serialized. The module source is read from the src at runtime.

@param {Object} obj Object with a src property.
*/
async function assembleSource(obj) {
  if (typeof obj?.src !== 'string' || obj.module || obj.srcLoaded) return;

  const response = await getSrc(obj.src);

  if (response instanceof Error) {
    throw new Error(`${obj.src}: ${response.message}`);
  }

  if (typeof response === 'object') {
    Object.assign(obj, response);
  } else if (typeof response === 'string') {
    obj.template = response;
  }

  obj.srcLoaded = true;
}

/**
@function collectKeySrcs
@async

@description
Recursively collects the explicit keys of source references in the workspace and in fetched source responses.

@param {Object} value
@param {WeakSet} inspected Inspected objects to avoid infinite recursion.
@param {Set} collectedSrcs Inspected src references to avoid infinite recursion through cloned responses.
*/
async function collectKeySrcs(value, inspected, collectedSrcs) {
  if (!value || typeof value !== 'object' || inspected.has(value)) return;
  inspected.add(value);

  if (typeof value.src === 'string' && !value.module) {
    if (typeof value.key === 'string') {
      const srcs = keySrcs.get(value.key) || new Set();
      srcs.add(value.src);
      keySrcs.set(value.key, srcs);
    }

    if (!collectedSrcs.has(value.src)) {
      collectedSrcs.add(value.src);

      const response = await getSrc(value.src);

      if (response instanceof Error) {
        throw new Error(`${value.src}: ${response.message}`);
      }

      await collectKeySrcs(response, inspected, collectedSrcs);
    }
  }

  for (const item of Object.values(value)) {
    await collectKeySrcs(item, inspected, collectedSrcs);
  }
}

/**
@function hoistSources
@async

@description
Recursively hoists nested source references into the workspace.templates{} object.

A src only reference is replaced with the key of the assembled template. A keyed reference retains its object while the assembled template is stored against the key. References which cannot share an assembled template are assembled in place.

@param {Object} value
*/
async function hoistSources(value) {
  if (!value || typeof value !== 'object' || inspectedObjects.has(value)) {
    return;
  }
  inspectedObjects.add(value);

  const entries = Array.isArray(value)
    ? value.map((item, index) => [index, item])
    : Object.entries(value);

  for (const [key, item] of entries) {
    if (
      item &&
      typeof item === 'object' &&
      typeof item.src === 'string' &&
      !item.module &&
      !item.srcLoaded
    ) {
      value[key] = await hoistSrcObject(item);
    }

    await hoistSources(value[key]);
  }
}

/**
@function hoistSrcObject
@async

@description
Hoists a nested source reference into the workspace.templates{} object.

A keyed reference stores the assembled template against its explicit key. The runtime resolves the reference from the workspace.templates{} object through the key. A key referencing different sources in the workspace is ambiguous and the source is assembled in place instead.

A reference with properties other than the src cannot be replaced and is assembled in place.

A src only reference is replaced with the key of the assembled template.

@param {Object} obj Object with a src property.
@returns {Promise<Object|String>} The reference object or the key of the assembled template.
*/
async function hoistSrcObject(obj) {
  if (typeof obj.key === 'string') {
    if (canHoist(obj.key, obj.src)) {
      await ensureTemplate(obj.key, obj.src);
    } else {
      // The key is ambiguous. The source is assembled in place to preserve the runtime template registration.
      await assembleSource(obj);
    }

    return obj;
  }

  const extraProps = Object.keys(obj).filter((prop) => prop !== 'src');

  if (extraProps.length) {
    // The reference object cannot be replaced with a template key string.
    await assembleSource(obj);
    return obj;
  }

  return await srcKey(obj.src);
}

/**
@function canHoist

@description
Checks whether a keyed source reference can share an assembled template in the workspace.templates{} object.

@param {String} key Explicit key of the source reference.
@param {String} src Source reference.
@returns {Boolean}
*/
function canHoist(key, src) {
  // The key references different sources in the workspace.
  if (keySrcs.get(key)?.size > 1) return false;

  const def = workspace.templates[key];

  // A workspace template definition with a different source owns the key.
  if (def && def.src !== src) return false;

  return true;
}

/**
@function ensureTemplate
@async

@description
Ensures an assembled template for the source is stored against the key in the workspace.templates{} object.

@param {String} key Template key.
@param {String} src Source reference.
*/
async function ensureTemplate(key, src) {
  if (!Object.hasOwn(workspace.templates, key)) {
    const template = { _type: 'template', src };

    await assembleSource(template);

    workspace.templates[key] = template;

    // Sources nested in the assembled template must be hoisted.
    await hoistSources(template);
  }

  if (!hoistedSrcKeys.has(src)) hoistedSrcKeys.set(src, key);
}

/**
@function srcKey
@async

@description
Resolves the template key for a src only reference. The key of an already assembled template for the source is reused.

A new key is derived from the src filename. The derived key must only contain characters whitelisted by the getTemplate method. A hash suffix is appended should the derived key be owned by a different source.

@param {String} src Source reference.
@returns {Promise<String>} The key of the assembled template.
*/
async function srcKey(src) {
  if (hoistedSrcKeys.has(src)) return hoistedSrcKeys.get(src);

  let key = src
    .match(/([^\/]+$)/)[0]
    .replace(/\.[^.]*$/, '')
    .replace(/[^a-zA-Z0-9 :_-]/g, '_');

  if (Object.hasOwn(workspace.templates, key) || keySrcs.has(key)) {
    // The derived key is owned by a different source.
    key += `_${createHash('sha256').update(src).digest('hex').slice(0, 4)}`;
  }

  await ensureTemplate(key, src);

  return key;
}

function parseArgs(argv) {
  const args = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '--') continue;

    if (arg === '--help' || arg === '-h') {
      args.help = true;
      continue;
    }

    if (arg === '--workspace') {
      args.workspace = argv[++i];
      continue;
    }

    if (arg.startsWith('--workspace=')) {
      args.workspace = arg.slice('--workspace='.length);
      continue;
    }

    if (arg === '--output') {
      args.output = argv[++i];
      continue;
    }

    if (arg.startsWith('--output=')) {
      args.output = arg.slice('--output='.length);
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function printHelp() {
  console.log(`Usage: node ./utils/cache-workspace.js [options]

Options:
  --workspace=<ref>  Workspace source ref. Defaults to WORKSPACE env.
  --output=<path>    Output JSON path. Defaults to workspace.generated.json.
  --help             Show this help.

Examples:
  node ./utils/cache-workspace.js --workspace=file:./workspace.json --output=./workspace.cached.json
  WORKSPACE=file:./workspace.json node ./utils/cache-workspace.js --output=./workspace.cached.json`);
}
