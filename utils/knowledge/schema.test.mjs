import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  buildSchema,
  keyPattern,
  validateWorkspace,
  writeSchema,
} from './schema.mjs';
import { validateBundle } from './validate.mjs';

const roots = [];

afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

const INDEX =
  '---\nokf_version: "0.3"\ntitle: Bundle\ndescription: Test bundle.\n---\n# Index\n\n- [Workspace](workspace/index.md)';

const LOCALE_KEYS = `---
type: Workspace Key
title: Locales
description: Locales.
x-xyz-keys:
  - { key: workspace.locale, type: object, ref: locale }
  - { key: locale.layers.*, type: object, ref: layer }
  - { key: layer.display, type: boolean }
  - { key: layer.format, type: string, enum: [wkt, mvt], description: The format. }
  - { key: layer.hover, type: object, deprecated: layer.style.hover }
  - { key: layer.srid, type: [string, integer] }
  - { key: layer.style, type: object }
  - { key: layer.style.default, type: object, ref: style }
  - { key: layer.style.cluster, type: object, ref: style }
  - { key: layer.style.cluster.clusterScale, type: number }
  - { key: layer.infoj, type: array, ref: entry }
  - { key: entry.field, type: string }
  - { key: style.fillColor, type: string }
---
`;

function fixture(
  example = '{ "locale": { "layers": { "a": { "display": true } } } }',
) {
  const root = mkdtempSync(join(tmpdir(), 'xyz-schema-'));
  roots.push(root);
  const files = {
    'knowledge/index.md': INDEX,
    'knowledge/workspace/index.md': '# Workspace\n\n- [Locales](locales.md)',
    'knowledge/workspace/locales.md': `${LOCALE_KEYS}# Examples\n\n\`\`\`json\n${example}\n\`\`\``,
  };
  for (const [path, content] of Object.entries(files)) {
    const target = join(root, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
  return root;
}

describe('workspace schema:', () => {
  it('links key groups with ref and keeps type unions', () => {
    const schema = buildSchema(fixture());
    expect(schema.properties.locale.$ref).toBe('#/$defs/locale');
    expect(
      schema.$defs.locale.properties.layers.additionalProperties.$ref,
    ).toBe('#/$defs/layer');
    expect(schema.$defs.layer.properties.infoj.items.$ref).toBe(
      '#/$defs/entry',
    );
    expect(schema.$defs.layer.properties.srid.anyOf).toEqual([
      { type: 'string' },
      { type: 'integer' },
    ]);
    expect(schema.$defs.layer.properties.display['x-xyz-concept']).toBe(
      'knowledge/workspace/locales.md',
    );
  });

  it('reports type errors and undocumented keys', () => {
    const schema = buildSchema(fixture());
    const result = validateWorkspace(schema, {
      locale: {
        layers: {
          a: {
            display: 'yes',
            srid: 4326,
            infoj: [{ field: 'name', colour: 'red' }],
            style: {
              default: { fillColor: '#fff' },
              cluster: { fillColor: '#000', clusterScale: 1 },
            },
            plugin_key: true,
          },
        },
      },
    });
    expect(result.errors).toEqual([
      'locale.layers.a.display: expected boolean, got string',
    ]);
    expect(result.undocumented).toEqual([
      'locale.layers.a.infoj[0].colour',
      'locale.layers.a.plugin_key',
    ]);
  });

  it('carries descriptions, enums and deprecations and checks enum values', () => {
    const schema = buildSchema(fixture());
    expect(schema.$defs.layer.properties.format).toMatchObject({
      type: 'string',
      enum: ['wkt', 'mvt'],
      description: 'The format.',
    });
    expect(schema.$defs.layer.properties.hover).toMatchObject({
      deprecated: true,
      'x-xyz-deprecated': 'layer.style.hover',
    });
    expect(
      validateWorkspace(schema, { format: 'wkt2' }, 'layer').errors,
    ).toEqual(['layer.format: expected one of "wkt", "mvt", got "wkt2"']);
    expect(
      validateWorkspace(schema, { format: 'mvt' }, 'layer').errors,
    ).toEqual([]);
  });

  it('validates a locale or layer by its definition and ignores null', () => {
    const schema = buildSchema(fixture());
    expect(
      validateWorkspace(schema, { display: null, srid: 1.5 }, 'layer').errors,
    ).toEqual(['layer.srid: expected string or integer, got number']);
  });

  it('generalises concrete paths', () => {
    expect(keyPattern('locales.uk.layers.osm.infoj[2].field')).toBe(
      'locales.*.layers.*.infoj[].field',
    );
  });
});

describe('knowledge check with a workspace schema:', () => {
  it('fails on a missing or stale schema', () => {
    const root = fixture();
    expect(validateBundle(root).errors).toEqual([
      'knowledge/workspace/workspace.schema.json: out of date; run pnpm knowledge:schema',
    ]);
    writeSchema(root);
    expect(validateBundle(root).errors).toEqual([]);
  });

  it('fails on examples with type errors or undocumented keys', () => {
    const root = fixture(
      '{ "locale": { "layers": { "a": { "display": 1, "colour": "red" } } } }',
    );
    writeSchema(root);
    expect(validateBundle(root).errors).toEqual([
      'knowledge/workspace/locales.md: example locale.layers.a.display: expected boolean, got integer',
      'knowledge/workspace/locales.md: example uses undocumented key locale.layers.a.colour',
    ]);
  });
});
