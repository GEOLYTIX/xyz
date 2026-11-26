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
import { LAYER_FORMATS } from './concepts.mjs';
import { findConcepts } from './find.mjs';
import { splitDocument, validateBundle } from './validate.mjs';

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
      ['  - { key: layer.format, type: string, enum: [] }', /enum must be/],
      [
        '  - { key: layer.format, type: string, enum: [wkt, 1] }',
        /enum value 1 does not match/,
      ],
      ['  - { key: layer.format, type: string, description: "" }', /text/],
      [
        '  - { key: layer.format, type: string, examples: [wkt, 1] }',
        /examples value 1 does not match/,
      ],
      [
        '  - { key: layer.format, type: string, enum: [wkt], examples: [mvt] }',
        /both enum and examples/,
      ],
      [
        '  - { key: layer.format, type: string, deprecated: 1 }',
        /deprecated must be/,
      ],
      [
        '  - { key: layer.z, type: number, pattern: "^a" }',
        /needs type string/,
      ],
      [
        '  - { key: layer.f, type: string, pattern: "(" }',
        /regular expression/,
      ],
      ['  - { key: layer.z, type: string, minimum: 0 }', /needs type number/],
      ['  - { key: layer.z, type: number, minimum: "0" }', /must be a number/],
      [
        '  - { key: layer.z, type: number, minimum: 2, maximum: 1 }',
        /minimum exceeds maximum/,
      ],
      ['  - { key: layer.z, type: object, open: 1 }', /open must be true/],
      ['  - { key: layer.z, type: string, open: true }', /open needs type/],
      ['  - { key: layer.z, type: string, required: [a] }', /required must be/],
      [
        '  - { key: layer.z, type: string, required: { when: [a] } }',
        /required.when must map/,
      ],
      [
        '  - { key: layer.z, type: string, required: { or: [locale.z] } }',
        /locale.z, which is not a sibling/,
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

  it('fails when a required rule names a key without an owner', () => {
    const root = fixture({
      'knowledge/a.md': keyConcept(
        '  - { key: layer.table, type: string, required: { when: { layer.format: wkt }, or: [layer.tables] } }',
      ),
    });
    expect(validateBundle(root).errors).toEqual([
      'knowledge/a.md: layer.table requires layer.format, which no concept owns',
      'knowledge/a.md: layer.table requires layer.tables, which no concept owns',
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

  it('lists the registry formats as examples of layer.format, which plugins extend', () => {
    const concept = readFileSync(
      new URL('../../knowledge/workspace/layer/formats.md', import.meta.url),
      'utf8',
    );
    const entry = splitDocument(concept).metadata['x-xyz-keys'].find(
      (key) => key.key === 'layer.format',
    );
    expect(entry.enum).toBeUndefined();
    expect(entry.examples).toEqual(LAYER_FORMATS);
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

  it('finds a module by a bundle-root resource path', () => {
    const base = fixture({
      'apps/x.js': '// x',
      'knowledge/dir/c.md': '---\ntype: Guide\nresource: /../apps/x.js\n---',
    });
    expect(findConcepts(base, 'apps/x.js')).toMatchObject([
      { path: 'knowledge/dir/c.md', matches: ['module apps/x.js'] },
    ]);
  });
});
