/**
Check that a branch which changes the modules a concept describes also
changes the concept. Fails when a concept's `resource` changes without the
concept, and warns when a module in its `sources` changes without it.

  pnpm knowledge:changed --base origin/minor
  pnpm knowledge:changed --base origin/minor --warn-only

The changes are taken from the merge base of the branch with the base, so
commits merged in from the base do not count. `--warn-only` reports failures
as warnings, for changes which do not affect what a concept describes; CI
passes it when a pull request has the `knowledge-unaffected` label.
*/
import { execFileSync } from 'node:child_process';
import { readFileSync, realpathSync } from 'node:fs';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { conceptFiles } from './find.mjs';
import { splitDocument } from './validate.mjs';

const posix = (path) => path.split(sep).join('/');

/** A repository-relative path for a local path field, or undefined. */
function localPath(value, file, root) {
  if (typeof value !== 'string' || !/^(\.\.?\/|\/)/.test(value)) return;
  const path = decodeURIComponent(value.split(/[?#]/)[0]);
  const target = path.startsWith('/')
    ? resolve(root, 'knowledge', `.${path}`)
    : resolve(dirname(file), path);
  return posix(relative(root, target));
}

/** Each concept with the local paths of its resource and its sources. */
export function conceptLinks(root) {
  const concepts = [];
  for (const file of conceptFiles(resolve(root, 'knowledge')).sort()) {
    let metadata;
    try {
      metadata = splitDocument(readFileSync(file, 'utf8')).metadata;
    } catch {
      continue; // pnpm knowledge:check reports malformed concepts.
    }
    if (!metadata) continue;
    const sources = Array.isArray(metadata.sources) ? metadata.sources : [];
    concepts.push({
      concept: posix(relative(root, file)),
      resource: localPath(metadata.resource, file, root),
      sources: sources
        .map((source) => localPath(source?.resource, file, root))
        .filter(Boolean),
    });
  }
  return concepts;
}

/** A changed file is the linked path or inside a linked directory. */
const within = (file, path) => file === path || file.startsWith(`${path}/`);

/**
Compare changed repository paths with the concepts linking them. Returns
errors for changed resources and warnings for changed sources whose concept
did not change.
*/
export function freshness(concepts, changed) {
  const files = new Set(changed);
  const errors = [];
  const warnings = [];
  for (const { concept, resource, sources } of concepts) {
    if (files.has(concept)) continue;
    const resourceChanges = resource
      ? changed.filter((file) => within(file, resource))
      : [];
    for (const file of resourceChanges)
      errors.push(`${file} changed; review ${concept}, which describes it`);
    for (const file of changed) {
      if (resourceChanges.includes(file)) continue;
      if (sources.some((source) => within(file, source)))
        warnings.push(`${file} changed; ${concept} cites it in sources`);
    }
  }
  return { errors, warnings };
}

/** Files changed on the branch since its merge base with the base ref. */
export function changedFiles(root, base) {
  const output = execFileSync(
    'git',
    ['diff', '--name-only', '--no-renames', `${base}...HEAD`],
    { cwd: root, encoding: 'utf8' },
  );
  return output.split('\n').filter(Boolean);
}

/** Parse --base <ref> and --warn-only. */
export function parseArgs(args) {
  const options = { base: 'origin/minor', warnOnly: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--warn-only') options.warnOnly = true;
    else if (args[i] === '--base' && args[i + 1]) options.base = args[++i];
    else throw new Error(`Unknown argument ${args[i]}`);
  }
  return options;
}

const main = process.argv[1] && realpathSync(resolve(process.argv[1]));
if (main === realpathSync(fileURLToPath(import.meta.url))) {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const options = parseArgs(process.argv.slice(2));
  const changed = changedFiles(root, options.base);
  const { errors, warnings } = freshness(conceptLinks(root), changed);
  const failures = options.warnOnly ? [] : errors;
  for (const warning of options.warnOnly ? [...errors, ...warnings] : warnings)
    console.warn(`WARN ${warning}`);
  for (const error of failures) console.error(`ERROR ${error}`);
  console.log(
    `Knowledge freshness: ${changed.length} changed files against ${options.base}, ${failures.length} errors, ${warnings.length + errors.length - failures.length} warnings`,
  );
  if (failures.length)
    console.log(
      'Update the concepts, or label the pull request knowledge-unaffected when the change does not affect what they describe.',
    );
  process.exitCode = failures.length ? 1 : 0;
}
