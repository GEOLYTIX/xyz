import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  changedFiles,
  conceptLinks,
  freshness,
  parseArgs,
} from './changed.mjs';

const roots = [];

afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

function write(root, files) {
  for (const [path, content] of Object.entries(files)) {
    const target = join(root, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
}

function fixture(files) {
  const root = mkdtempSync(join(tmpdir(), 'xyz-changed-'));
  roots.push(root);
  write(root, files);
  return root;
}

const BUNDLE = {
  'knowledge/index.md': '# Index',
  'knowledge/a.md':
    '---\ntype: Guide\nresource: ../apps/a.js\nsources:\n  - resource: ../apps/a.test.js\n  - resource: https://example.com/a\n---\n',
  'knowledge/dir/b.md':
    '---\ntype: Guide\nresource: /../apps/b\nsources:\n  - resource: ../../apps/a.js\n---\n',
  'knowledge/broken.md': '---\ntype: [\n---\n',
};

describe('knowledge freshness:', () => {
  it('collects the local resource and sources of each concept', () => {
    expect(conceptLinks(fixture(BUNDLE))).toEqual([
      {
        concept: 'knowledge/a.md',
        resource: 'apps/a.js',
        sources: ['apps/a.test.js'],
      },
      {
        concept: 'knowledge/dir/b.md',
        resource: 'apps/b',
        sources: ['apps/a.js'],
      },
    ]);
  });

  it('fails on a changed resource and warns on changed sources', () => {
    const concepts = conceptLinks(fixture(BUNDLE));
    expect(
      freshness(concepts, ['apps/a.js', 'apps/a.test.js', 'apps/b/c.js']),
    ).toEqual({
      errors: [
        'apps/a.js changed; review knowledge/a.md, which describes it',
        'apps/b/c.js changed; review knowledge/dir/b.md, which describes it',
      ],
      warnings: [
        'apps/a.test.js changed; knowledge/a.md cites it in sources',
        'apps/a.js changed; knowledge/dir/b.md cites it in sources',
      ],
    });
  });

  it('passes when the concept changed with its modules', () => {
    const concepts = conceptLinks(fixture(BUNDLE));
    expect(
      freshness(concepts, [
        'apps/a.js',
        'knowledge/a.md',
        'apps/bc.js',
        'knowledge/dir/b.md',
      ]),
    ).toEqual({ errors: [], warnings: [] });
  });

  it('reads the changes since the merge base with the base', () => {
    const root = fixture({ 'apps/a.js': '1' });
    const git = (...args) =>
      execFileSync('git', args, { cwd: root, encoding: 'utf8' });
    git('init', '-q', '-b', 'base');
    git('-c', 'user.name=t', '-c', 'user.email=t@t', 'add', '.');
    git('-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-qm', 'a');
    git('checkout', '-qb', 'branch');
    write(root, { 'apps/b.js': '1' });
    git('add', '.');
    git('-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-qm', 'b');
    git('checkout', '-q', 'base');
    write(root, { 'apps/a.js': '2' });
    git('-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-qam', 'c');
    git('checkout', '-q', 'branch');
    expect(changedFiles(root, 'base')).toEqual(['apps/b.js']);
  });

  it('parses the base and warn-only options', () => {
    expect(parseArgs([])).toEqual({ base: 'origin/minor', warnOnly: false });
    expect(parseArgs(['--base', 'origin/patch', '--warn-only'])).toEqual({
      base: 'origin/patch',
      warnOnly: true,
    });
    expect(() => parseArgs(['--bse'])).toThrow(/Unknown argument/);
  });
});
