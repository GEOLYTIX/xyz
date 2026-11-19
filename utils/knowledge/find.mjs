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

/** Find concepts matching a term; returns matches with the reason. */
export function findConcepts(root, term) {
  const bundle = resolve(root, 'knowledge');
  const query = term.trim();
  const lower = query.toLowerCase();
  const results = [];
  for (const file of conceptFiles(bundle)) {
    let doc;
    try {
      doc = splitDocument(readFileSync(file, 'utf8'));
    } catch {
      continue; // knowledge:check reports parse errors.
    }
    const metadata = doc.metadata ?? {};
    if (!metadata.type) continue;
    const matches = [];
    for (const entry of Array.isArray(metadata[KEYS]) ? metadata[KEYS] : []) {
      // A key matches itself, its parents and its children.
      if (
        entry?.key === query ||
        entry?.key?.startsWith(`${query}.`) ||
        query.startsWith(`${entry?.key}.`)
      )
        matches.push(`key ${JSON.stringify(entry)}`);
    }
    for (const variable of metadata[VARIABLES] ?? []) {
      if (variableMatch(query, variable)) matches.push(`variable ${variable}`);
    }
    for (const module of modules(metadata, file, root)) {
      if (module === query || module.endsWith(`/${query}`))
        matches.push(`module ${module}`);
    }
    const words = [
      metadata.title,
      metadata.description,
      ...(metadata.tags ?? []),
    ]
      .filter((value) => typeof value === 'string')
      .join(' ')
      .toLowerCase();
    if (!matches.length && lower.length > 2 && words.includes(lower))
      matches.push('text');
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
