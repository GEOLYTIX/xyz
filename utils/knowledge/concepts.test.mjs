import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { jsonPaths, LAYER_FORMATS } from './concepts.mjs';
import { findConcepts } from './find.mjs';
import { validateBundle } from './validate.mjs';

const roots = [];

afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

const EXAMPLE = '# Examples\n\n```json\n{ "locale": {} }\n```';

/** The root index lists every concept at the bundle root. */
const index = (files) =>
  `---\nokf_version: "0.3"\ntitle: Bundle\ndescription: Test bundle.\n---\n# Index\n\n${Object.keys(
    files,
  )
    .filter((path) => /^knowledge\/[^/]+\.md$/.test(path))
    .map((path) => `- [${path}](${path.slice('knowledge/'.length)})`)
    .join('\n')}`;

function fixture(files) {
  const root = mkdtempSync(join(tmpdir(), 'xyz-concepts-'));
  roots.push(root);
  for (const [path, content] of Object.entries({
    'knowledge/index.md': index(files),
    ...files,
  })) {
    const target = join(root, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
  return root;
}

const keyConcept = (keys, body = EXAMPLE) =>
  `---\ntype: Workspace Key\ntitle: K\ndescription: K\nx-xyz-keys:\n${keys}\n---\n${body}`;

describe('workspace keys:', () => {
  it('accepts key paths with named maps, arrays and type lists', () => {
    const root = fixture({
      'knowledge/a.md': keyConcept(
        '  - { key: layer.table, type: string }\n  - { key: layer.filter.default, type: [object, string], requires: [layer.table] }\n  - { key: locale.layers.*, type: object }\n  - { key: \"layer.infoj[]\", type: object, formats: [wkt] }',
      ),
    });
    expect(validateBundle(root)).toMatchObject({ errors: [], warnings: [] });
  });

  it('fails on malformed entries', () => {
    for (const [keys, message] of [
      ['  - layer.filter', /mappings with key and type/],
      ['  - { key: map.filter, type: object }', /invalid key path/],
      ['  - { key: layer..filter, type: object }', /invalid key path/],
      ['  - { key: layer.filter }', /type must be/],
      ['  - { key: layer.filter, type: map }', /type must be/],
      [
        '  - { key: layer.filter, type: object, requires: [table] }',
        /requires invalid key/,
      ],
      [
        '  - { key: layer.filter, type: object, formats: [wkt2] }',
        /unknown layer format wkt2/,
      ],
    ]) {
      const root = fixture({ 'knowledge/a.md': keyConcept(keys) });
      const { errors } = validateBundle(root);
      expect(errors, keys).toHaveLength(1);
      expect(errors[0], keys).toMatch(message);
    }
  });

  it('fails when a required key has no owner', () => {
    const root = fixture({
      'knowledge/a.md': keyConcept(
        '  - { key: layer.filter, type: object, requires: [layer.table] }',
      ),
    });
    expect(validateBundle(root).errors).toEqual([
      'knowledge/a.md: layer.filter requires layer.table, which no concept owns',
    ]);
  });

  it('lists the formats of the MAPP format registry', () => {
    const registry = readFileSync(
      new URL('../../apps/mapp/lib/layer/format/_format.mjs', import.meta.url),
      'utf8',
    );
    const body = registry.slice(registry.indexOf('export default {'));
    const keys = [...body.matchAll(/^\s+(\w+)[:,]/gm)].map((match) => match[1]);
    expect(keys.sort()).toEqual([...LAYER_FORMATS].sort());
  });

  it('fails when two concepts own the same key', () => {
    const keys = '  - { key: layer.filter, type: object }';
    const root = fixture({
      'knowledge/a.md': keyConcept(keys),
      'knowledge/b.md': keyConcept(keys),
    });
    const { errors } = validateBundle(root);
    expect(errors).toEqual([
      'knowledge/b.md: layer.filter is already owned by knowledge/a.md',
    ]);
  });
});

describe('concept bodies:', () => {
  it('fails on an example which is not JSON', () => {
    const root = fixture({
      'knowledge/a.md': keyConcept(
        '  - { key: layer.filter, type: object }',
        '# Examples\n\n```json\n{ broken\n```',
      ),
    });
    expect(validateBundle(root).errors[0]).toMatch(/is not JSON/);
  });

  it('ignores JSON blocks outside the Examples section', () => {
    const root = fixture({
      'knowledge/a.md': keyConcept(
        '  - { key: layer.filter, type: object }',
        '# Keys\n\n```json\n{ partial\n```\n\n# Examples\n\n```json\n{}\n```\n\n# After\n\n```json\n{ partial\n```',
      ),
    });
    expect(validateBundle(root).errors).toEqual([]);
  });

  it('warns on a missing example, Feature headings and size', () => {
    const root = fixture({
      'knowledge/a.md': keyConcept(
        '  - { key: layer.filter, type: object }',
        '# Layer filter',
      ),
      'knowledge/b.md': `---\ntype: Feature\ntitle: B\ndescription: B\n---\n## Behaviour\n\n## Flow\n${'\n'.repeat(150)}`,
    });
    const { warnings } = validateBundle(root);
    expect(warnings).toEqual([
      'knowledge/a.md: Workspace Key concept has no JSON example under Examples',
      expect.stringMatching(/b\.md: Concept has 1\d\d lines/),
      'knowledge/b.md: Feature concept is missing headings: Where to change, Tests, Pitfalls',
    ]);
  });

  it('does not read footnote definitions as links', () => {
    const root = fixture({
      'knowledge/a.md': keyConcept(
        '  - { key: layer.filter, type: object }',
        `Claim.[^src]\n\n${EXAMPLE}\n\n[^src]: missing.js`,
      ),
    });
    expect(validateBundle(root).errors).toEqual([]);
  });

  it('collects the object paths of an example', () => {
    expect([
      ...jsonPaths({ locale: { layers: { a: { infoj: [{ field: 'x' }] } } } }),
    ]).toEqual([
      'locale',
      'locale.layers',
      'locale.layers.a',
      'locale.layers.a.infoj',
      'locale.layers.a.infoj[].field',
    ]);
  });
});

describe('knowledge:find', () => {
  const root = () =>
    fixture({
      'apps/xyz/mod/filter.js': '// filter',
      'knowledge/a.md': `---\ntype: Workspace Key\ntitle: Layer filter\ndescription: Filters.\nresource: ../apps/xyz/mod/filter.js\nx-xyz-keys:\n  - { key: layer.filter, type: object }\n  - { key: layer.filter.default, type: object }\n---\n${EXAMPLE}`,
      'knowledge/b.md':
        '---\ntype: Environment Variable\ntitle: Databases\ndescription: Connections.\nx-xyz-variables: [DBS_*]\n---',
    });

  it('finds a key, its parent and children', () => {
    const base = root();
    for (const term of ['layer.filter', 'layer.filter.default.retailer']) {
      expect(findConcepts(base, term).map((result) => result.path)).toEqual([
        'knowledge/a.md',
      ]);
    }
    expect(findConcepts(base, 'layer.filter.default')[0].matches).toHaveLength(
      2,
    );
  });

  it('finds variable families, modules and words', () => {
    const base = root();
    expect(findConcepts(base, 'DBS_MAIN')[0].path).toBe('knowledge/b.md');
    expect(findConcepts(base, 'apps/xyz/mod/filter.js')[0].matches).toEqual([
      'module apps/xyz/mod/filter.js',
    ]);
    expect(findConcepts(base, 'connections')[0].matches).toEqual(['text']);
    expect(findConcepts(base, 'nothing')).toEqual([]);
  });
});
