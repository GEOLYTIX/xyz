/**
XYZ concept rules beyond OKF: workspace key metadata, executable examples,
Feature headings and the concept size budget. See
knowledge/workflows/authoring.md.
*/

/** XYZ extension key listing the workspace keys a concept owns. */
export const KEYS = 'x-xyz-keys';

/** Roots of a workspace key path; they match the JSDoc typedef names. */
export const KEY_ROOTS = [
  'workspace',
  'locale',
  'layer',
  'style',
  'theme',
  'entry',
  'dataview',
  'filter',
];

/** Segments are names, `*` for a named map, with `[]` for an array. */
const KEY_PATH = new RegExp(
  `^(?:${KEY_ROOTS.join('|')})(?:\\[\\])?(?:\\.(?:\\*|[A-Za-z_$][\\w$-]*)(?:\\[\\])?)*$`,
);

export const KEY_TYPES = [
  'string',
  'number',
  'integer',
  'boolean',
  'object',
  'array',
];

/**
Values of layer.format, the keys of the MAPP format registry
(apps/mapp/lib/layer/format/_format.mjs). A test keeps them in sync.
*/
export const LAYER_FORMATS = [
  'cluster',
  'geojson',
  'googleMapTiles',
  'mapboxStyle',
  'maplibre',
  'mvt',
  'tiles',
  'vector',
  'wkt',
];

/** Lines per concept file before the checker warns. */
export const LINE_BUDGET = 150;

/** Fixed headings of a Feature concept. */
export const FEATURE_HEADINGS = [
  'Behaviour',
  'Flow',
  'Where to change',
  'Tests',
  'Pitfalls',
];

const list = (value) =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

/**
Validate the x-xyz-keys entries of a concept and return the key paths.
Malformed entries throw: agents generate workspaces from them.
*/
export function checkKeys(metadata) {
  const entries = metadata[KEYS];
  if (entries === undefined) return [];
  if (!Array.isArray(entries)) throw new Error(`${KEYS} must be an array`);
  return entries.map(checkEntry);
}

/** Throw on a malformed x-xyz-keys entry; return its key path. */
function checkEntry(entry) {
  if (entry === null || typeof entry !== 'object' || Array.isArray(entry))
    throw new Error(`${KEYS} entries must be mappings with key and type`);
  if (typeof entry.key !== 'string' || !KEY_PATH.test(entry.key))
    throw new Error(`${KEYS}: invalid key path ${JSON.stringify(entry.key)}`);
  const types = list(entry.type);
  if (!types.length || !types.every((type) => KEY_TYPES.includes(type)))
    throw new Error(
      `${KEYS}: ${entry.key} type must be one or more of ${KEY_TYPES.join(', ')}`,
    );
  for (const field of ['formats', 'requires']) {
    if (!list(entry[field]).every((value) => typeof value === 'string'))
      throw new Error(`${KEYS}: ${entry.key} ${field} must be strings`);
  }
  const format = list(entry.formats).find(
    (value) => !LAYER_FORMATS.includes(value),
  );
  if (format)
    throw new Error(`${KEYS}: ${entry.key} has unknown layer format ${format}`);
  if (entry.ref !== undefined && !KEY_ROOTS.includes(entry.ref))
    throw new Error(
      `${KEYS}: ${entry.key} ref must be one of ${KEY_ROOTS.join(', ')}`,
    );
  const invalid = list(entry.requires).find((key) => !KEY_PATH.test(key));
  if (invalid)
    throw new Error(`${KEYS}: ${entry.key} requires invalid key ${invalid}`);
  return entry.key;
}

/** The keys each entry requires, as [key, required key] pairs. */
export const requirements = (metadata) =>
  (metadata[KEYS] ?? []).flatMap((entry) =>
    list(entry.requires).map((target) => [entry.key, target]),
  );

/** Text of the inline children of a heading token. */
const headingText = (tokens, index) => tokens[index + 1]?.content.trim() ?? '';

/** Headings of a parsed body, with their level. */
export function headings(tokens) {
  const result = [];
  tokens.forEach((token, index) => {
    if (token.type === 'heading_open')
      result.push({
        level: Number(token.tag.slice(1)),
        text: headingText(tokens, index),
        index,
      });
  });
  return result;
}

/**
The JSON code blocks in the `Examples` section, at any heading level. The
section ends at the next heading of the same or a higher level.
*/
export function examples(tokens) {
  const blocks = [];
  let level;
  tokens.forEach((token, index) => {
    if (token.type === 'heading_open') {
      const current = Number(token.tag.slice(1));
      if (level !== undefined && current <= level) level = undefined;
      if (headingText(tokens, index) === 'Examples') level = current;
    }
    if (
      level !== undefined &&
      token.type === 'fence' &&
      /^json\b/.test(token.info)
    )
      blocks.push({ text: token.content, line: (token.map?.[0] ?? 0) + 1 });
  });
  return blocks;
}

/** Collect the dotted object paths of a parsed JSON value. */
export function jsonPaths(value, prefix = '', paths = new Set()) {
  if (Array.isArray(value)) {
    for (const item of value) jsonPaths(item, `${prefix}[]`, paths);
  } else if (value !== null && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      const path = prefix ? `${prefix}.${key}` : key;
      paths.add(path);
      jsonPaths(child, path, paths);
    }
  }
  return paths;
}

/**
Check the concept rules which depend on the body. Examples must parse; a
Workspace Key concept without an example and a Feature without its headings
warn.
*/
export function checkBody(metadata, tokens, lines, warn) {
  if (lines > LINE_BUDGET)
    warn(`Concept has ${lines} lines; split it below ${LINE_BUDGET}`);
  const blocks = examples(tokens);
  for (const block of blocks) {
    try {
      JSON.parse(block.text);
    } catch (error) {
      throw new Error(
        `Example at line ${block.line} is not JSON: ${error.message}`,
      );
    }
  }
  if (metadata.type === 'Workspace Key' && !blocks.length)
    warn('Workspace Key concept has no JSON example under Examples');
  if (metadata.type === 'Feature') {
    const texts = new Set(headings(tokens).map((heading) => heading.text));
    const missing = FEATURE_HEADINGS.filter((heading) => !texts.has(heading));
    if (missing.length)
      warn(`Feature concept is missing headings: ${missing.join(', ')}`);
  }
  return blocks;
}
