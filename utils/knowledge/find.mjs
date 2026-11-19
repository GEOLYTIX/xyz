/**
Look up knowledge concepts from frontmatter alone, so an agent finds the
concept for a workspace key, environment variable or source module without
reading bodies.

  pnpm knowledge:find layer.filter.default
  pnpm knowledge:find CORS_ORIGINS
  pnpm knowledge:find apps/xyz/mod/utils/sqlFilter.js
  pnpm knowledge:find filter        # title, description and tag words
*/
import { readdirSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { KEYS } from './concepts.mjs';
import { splitDocument } from './validate.mjs';

const VARIABLES = 'x-xyz-variables';
const posix = (path) => path.split(sep).join('/');

function conceptFiles(directory, files = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) conceptFiles(path, files);
    else if (
      entry.name.endsWith('.md') &&
      !['index.md', 'log.md'].includes(entry.name)
    )
      files.push(path);
  }
  return files;
}

/** Repository-relative paths of a concept's local resource and sources. */
function modules(metadata, file, root) {
  const values = [
    metadata.resource,
    ...(Array.isArray(metadata.sources)
      ? metadata.sources.map((source) => source?.resource)
      : []),
  ];
  const paths = values
    .filter((value) => typeof value === 'string' && /^\.\.?\//.test(value))
    .map((value) => posix(relative(root, resolve(dirname(file), value))));
  return [...new Set(paths)];
}

const variableMatch = (term, variable) =>
  variable.endsWith('*')
    ? term.startsWith(variable.slice(0, -1))
    : term === variable;

/** A key matches itself, its parents and its children. */
const keyMatch = (query, key) =>
  typeof key === 'string' &&
  (key === query || key.startsWith(`${query}.`) || query.startsWith(`${key}.`));

/** The reasons why a concept's metadata matches the query. */
function metadataMatches(metadata, file, root, query) {
  const keys = Array.isArray(metadata[KEYS]) ? metadata[KEYS] : [];
  const variables = Array.isArray(metadata[VARIABLES])
    ? metadata[VARIABLES]
    : [];
  return [
    ...keys
      .filter((entry) => keyMatch(query, entry?.key))
      .map((entry) => `key ${JSON.stringify(entry)}`),
    ...variables
      .filter((variable) => variableMatch(query, variable))
      .map((variable) => `variable ${variable}`),
    ...modules(metadata, file, root)
      .filter((module) => module === query || module.endsWith(`/${query}`))
      .map((module) => `module ${module}`),
  ];
}

/** Whether the title, description or tags contain the query. */
function textMatch(metadata, query) {
  const lower = query.toLowerCase();
  if (lower.length < 3) return false;
  return [metadata.title, metadata.description, ...(metadata.tags ?? [])]
    .filter((value) => typeof value === 'string')
    .join(' ')
    .toLowerCase()
    .includes(lower);
}

function readMetadata(file) {
  try {
    return splitDocument(readFileSync(file, 'utf8')).metadata ?? {};
  } catch {
    return {}; // knowledge:check reports parse errors.
  }
}

/** Find concepts matching a term; returns matches with the reason. */
export function findConcepts(root, term) {
  const query = term.trim();
  const results = [];
  for (const file of conceptFiles(resolve(root, 'knowledge'))) {
    const metadata = readMetadata(file);
    if (!metadata.type) continue;
    const matches = metadataMatches(metadata, file, root, query);
    if (!matches.length && textMatch(metadata, query)) matches.push('text');
    if (matches.length)
      results.push({
        path: posix(relative(root, file)),
        type: metadata.type,
        title: metadata.title,
        description: metadata.description,
        status: metadata.status,
        matches,
      });
  }
  // Exact metadata matches before text matches.
  return results.sort(
    (a, b) =>
      (a.matches[0] === 'text') - (b.matches[0] === 'text') ||
      a.path.localeCompare(b.path),
  );
}

const main = process.argv[1] && realpathSync(resolve(process.argv[1]));
if (main === realpathSync(fileURLToPath(import.meta.url))) {
  const term = process.argv.slice(2).join(' ');
  if (!term) {
    console.error('Usage: pnpm knowledge:find <key | VARIABLE | path | word>');
    process.exitCode = 2;
  } else {
    const root = fileURLToPath(new URL('../../', import.meta.url));
    const results = findConcepts(root, term);
    if (!results.length) console.log(`No concept for ${term}`);
    for (const result of results) {
      console.log(
        `${result.path} [${result.type}${result.status ? `, ${result.status}` : ''}] ${result.title ?? ''}`,
      );
      if (result.description) console.log(`  ${result.description}`);
      for (const match of result.matches)
        if (match !== 'text') console.log(`  ${match}`);
    }
  }
}
