/**
Check that a branch which changes the modules a concept describes also
changes the concept. Fails when a concept's `resource` changes without the
concept, and warns when a module in its `sources` changes without it.

  pnpm knowledge:changed --base origin/minor
  pnpm knowledge:changed --base origin/minor --warn-only

It also compares the concepts at the merge base with the concepts on the
branch. Deleting a concept, or its `resource`, must hand each module it
described to another concept: a module which still exists and no concept
describes any more fails. A changed module which a concept cited and no
concept cites any more warns.

A concept whose frontmatter does not parse fails on the branch and warns at
the merge base: the modules it links cannot be compared.

The changes are taken from the merge base of the branch with the base, so
commits merged in from the base do not count. `--warn-only` reports failures
as warnings, for changes which do not affect what a concept describes, or
modules which no longer need a concept; CI passes it when a pull request has
the `knowledge-unaffected` label.
*/
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { conceptFiles, localPath, posix, reserved } from './files.mjs';
import { splitDocument } from './validate.mjs';

/** Whether a repository path is a concept file, not an index or a log. */
const isConcept = (path) =>
  path.startsWith('knowledge/') &&
  path.endsWith('.md') &&
  !reserved(path.split('/').pop());

/** The concept files of the working tree with their text. */
function readConcepts(root) {
  return conceptFiles(resolve(root, 'knowledge')).map((file) => ({
    path: posix(relative(root, file)),
    text: readFileSync(file, 'utf8'),
  }));
}

/** The concept files of a commit with their text, read in one git call. */
export function commitConcepts(root, commit) {
  const git = (args, input) =>
    execFileSync('git', args, { cwd: root, input, maxBuffer: 1 << 28 });
  const paths = git([
    'ls-tree',
    '-r',
    '-z',
    '--name-only',
    commit,
    '--',
    'knowledge',
  ])
    .toString('utf8')
    .split('\0')
    .filter(isConcept);
  if (!paths.length) return [];
  const output = git(
    ['cat-file', '--batch'],
    paths.map((path) => `${commit}:${path}\n`).join(''),
  );
  // Each object is "<oid> blob <size>\n<content>\n"; size counts bytes.
  const concepts = [];
  let offset = 0;
  for (const path of paths) {
    const end = output.indexOf(10, offset);
    const size = Number(output.toString('utf8', offset, end).split(' ')[2]);
    concepts.push({
      path,
      text: output.toString('utf8', end + 1, end + 1 + size),
    });
    offset = end + 1 + size + 1;
  }
  return concepts;
}

/**
Each concept with the local paths of its resource and its sources. Reads the
concepts of the working tree, or the given concept files, eg. of a commit.
Concepts without parseable frontmatter are pushed to malformed as
{ concept, error }; their links are unknown.
*/
export function conceptLinks(
  root,
  documents = readConcepts(root),
  malformed = [],
) {
  const concepts = [];
  const sorted = [...documents].sort((a, b) =>
    a.path < b.path ? -1 : a.path > b.path ? 1 : 0,
  );
  for (const { path, text } of sorted) {
    const file = resolve(root, path);
    let metadata;
    try {
      metadata = splitDocument(text).metadata;
    } catch (error) {
      malformed.push({ concept: path, error: error.message });
      continue;
    }
    if (!metadata) {
      malformed.push({ concept: path, error: 'Concept has no frontmatter' });
      continue;
    }
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

/**
Compare the concepts at the merge base with the concepts on the branch.
Returns errors for modules which a concept described, still exist and no
concept describes now, and warnings for changed modules which a concept cited
and no concept cites now. A module deleted on the branch needs no concept.
*/
export function lostCoverage(before, after, changed, exists) {
  const described = after.map(({ resource }) => resource).filter(Boolean);
  const cited = after.flatMap(({ resource, sources }) =>
    [resource, ...sources].filter(Boolean),
  );
  const errors = new Set();
  const warnings = new Set();
  for (const { concept, resource, sources } of before) {
    if (
      resource &&
      exists(resource) &&
      !described.some((path) => within(resource, path))
    )
      errors.add(
        `${resource} lost its concept; ${concept} described it at the merge base and no concept describes it now`,
      );
    for (const source of sources) {
      if (
        changed.some((file) => within(file, source)) &&
        exists(source) &&
        !cited.some((path) => within(source, path))
      )
        warnings.add(
          `${source} changed and lost its citation; ${concept} cited it at the merge base and no concept cites it now`,
        );
    }
  }
  return { errors: [...errors], warnings: [...warnings] };
}

/** Messages for concepts whose links could not be read. */
export const malformedReport = (malformed, where) =>
  malformed.map(
    ({ concept, error }) =>
      `${concept} is malformed ${where}, so the modules it links were not compared: ${error}`,
  );

/** The merge base of HEAD with the base ref. */
export function mergeBase(root, base) {
  return execFileSync('git', ['merge-base', base, 'HEAD'], {
    cwd: root,
    encoding: 'utf8',
  }).trim();
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
  const broken = [];
  const brokenBefore = [];
  const after = conceptLinks(root, undefined, broken);
  const before = conceptLinks(
    root,
    commitConcepts(root, mergeBase(root, options.base)),
    brokenBefore,
  );
  const fresh = freshness(after, changed);
  // A concept malformed on the branch is reported once, not as lost coverage.
  const comparable = before.filter(
    ({ concept }) => !broken.some((entry) => entry.concept === concept),
  );
  const lost = lostCoverage(comparable, after, changed, (path) =>
    existsSync(resolve(root, path)),
  );
  const errors = [
    ...malformedReport(broken, 'on the branch'),
    ...fresh.errors,
    ...lost.errors,
  ];
  const warnings = [
    ...malformedReport(brokenBefore, 'at the merge base'),
    ...fresh.warnings,
    ...lost.warnings,
  ];
  const failures = options.warnOnly ? [] : errors;
  for (const warning of options.warnOnly ? [...errors, ...warnings] : warnings)
    console.warn(`WARN ${warning}`);
  for (const error of failures) console.error(`ERROR ${error}`);
  console.log(
    `Knowledge freshness: ${changed.length} changed files against ${options.base}, ${failures.length} errors, ${warnings.length + errors.length - failures.length} warnings`,
  );
  if (failures.length)
    console.log(
      'Update the concepts, or label the pull request knowledge-unaffected when the change does not affect what they describe or a module no longer needs a concept.',
    );
  process.exitCode = failures.length ? 1 : 0;
}
