/**
Collect the JSON workspace examples of the knowledge concepts and combine them
into one workspace which the testhost serves with the devdb. Each example
becomes a named locale keyed by its concept path, eg. `workspace__layer__filter`.

  node utils/knowledge/examples.mjs   # writes the combined workspace
*/
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import MarkdownIt from 'markdown-it';
import merge from '../../apps/xyz/mod/utils/merge.js';
import { examples } from './concepts.mjs';
import { splitDocument } from './validate.mjs';

const markdown = new MarkdownIt();

/** The combined workspace, gitignored, relative to the repository root. */
export const GENERATED = 'utils/knowledge/examples/workspace.generated.json';

/** Suffix of the locale twin without default filters. */
export const UNFILTERED = '__unfiltered';

/** Top-level workspace keys an example may use. */
const WORKSPACE_KEYS = new Set(['dbs', 'locale', 'locales', 'templates']);

function markdownFiles(directory, files = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) markdownFiles(path, files);
    else if (entry.name.endsWith('.md')) files.push(path);
  }
  return files.sort();
}

/** Every example of every concept, with a locale key derived from its path. */
export function collectExamples(root) {
  const bundle = resolve(root, 'knowledge');
  const result = [];
  for (const file of markdownFiles(bundle)) {
    const doc = splitDocument(readFileSync(file, 'utf8'));
    if (!doc.metadata?.type) continue;
    const id = relative(bundle, file)
      .replace(/\.md$/, '')
      .split(sep)
      .join('__')
      .replace(/[^\w]/g, '_');
    examples(markdown.parse(doc.body, {})).forEach((block, index) => {
      result.push({
        id: index ? `${id}_${index + 1}` : id,
        path: relative(root, file).split(sep).join('/'),
        workspace: JSON.parse(block.text),
      });
    });
  }
  return result;
}

/**
The locales of an example: its locale, or each of its named locales composed
with its locale as defaults, as the XYZ API composes workspace.locale defaults.
The defaults precede the template of a named locale, which precedes its own
properties. The template of a named locale must be defined by the example.
*/
export function exampleLocales(example) {
  const { locale, locales, templates = {} } = example.workspace;
  if (!locales) return [[example.id, locale]];
  return Object.entries(locales).map(([key, named]) => {
    const defaults = structuredClone(locale ?? {});
    if (!named.template)
      return [`${example.id}__${key}`, merge(defaults, named)];
    if (!Object.hasOwn(templates, named.template))
      throw new Error(
        `${example.path}: locale ${key} uses template ${named.template}, which the example does not define`,
      );
    const { template, ...own } = named;
    delete defaults.template;
    return [
      `${example.id}__${key}`,
      merge(defaults, structuredClone(templates[template]), own),
    ];
  });
}

/** Throw unless the example uses only the supported workspace keys. */
function checkExample(example) {
  const extra = Object.keys(example.workspace).filter(
    (key) => !WORKSPACE_KEYS.has(key),
  );
  if (extra.length)
    throw new Error(
      `${example.path}: examples may only use ${[...WORKSPACE_KEYS].join(', ')}, not ${extra.join(', ')}`,
    );
  if (!example.workspace.locale && !example.workspace.locales)
    throw new Error(`${example.path}: the example has no locale`);
}

/**
A twin without default filters shows whether each filter removes rows. An
explicit null default precedes a default inherited from locale.layer or the
layer template. Templates of a templates array precede the layer, so a layer
must not inherit a default filter from one.
*/
function unfiltered(locale, templates, path) {
  const twin = structuredClone(locale);
  for (const [key, layer] of Object.entries(twin.layers ?? {})) {
    if (!layer) continue;
    const filtering = [layer.templates ?? []]
      .flat()
      .filter((template) => templates[template]?.filter?.default);
    if (filtering.length)
      throw new Error(
        `${path}: layer ${key} inherits a default filter from the templates array entry ${filtering.join(', ')}, which the unfiltered twin cannot remove`,
      );
    layer.filter = { ...layer.filter, default: null };
  }
  return twin;
}

/** Combine the examples into one workspace with a locale for each. */
export function combineExamples(list) {
  const workspace = { dbs: 'DEVDB', locales: {}, templates: {} };
  for (const example of list) {
    checkExample(example);
    for (const [key, template] of Object.entries(
      example.workspace.templates ?? {},
    )) {
      if (Object.hasOwn(workspace.templates, key))
        throw new Error(`${example.path}: template ${key} is already defined`);
      workspace.templates[key] = template;
    }
    for (const [key, locale] of exampleLocales(example)) {
      workspace.locales[key] = { dbs: example.workspace.dbs, ...locale };
      workspace.locales[`${key}${UNFILTERED}`] = unfiltered(
        workspace.locales[key],
        workspace.templates,
        example.path,
      );
    }
  }
  return workspace;
}

/** Write the combined workspace and return its absolute path. */
export function writeExamples(root) {
  const path = resolve(root, GENERATED);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(
    path,
    `${JSON.stringify(combineExamples(collectExamples(root)), null, 2)}\n`,
  );
  return path;
}

const main = process.argv[1] && realpathSync(resolve(process.argv[1]));
if (main === realpathSync(fileURLToPath(import.meta.url))) {
  console.log(writeExamples(fileURLToPath(new URL('../../', import.meta.url))));
}
