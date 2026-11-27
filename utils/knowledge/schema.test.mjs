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
  - { key: layer.featureFormat, type: string, examples: [wkt, geojson] }
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

const STRICT_KEYS = `${LOCALE_KEYS.slice(0, LOCALE_KEYS.lastIndexOf('---'))}  - { key: layer.template, type: string }
  - { key: layer.table, type: string, pattern: "^[a-z_.]+$", required: { when: { layer.format: [wkt, mvt] }, or: [layer.tables] } }
  - { key: layer.tables, type: object }
  - { key: layer.name, type: string, required: true }
  - { key: layer.opacity, type: number, minimum: 0, maximum: 1 }
  - { key: layer.zIndex, type: [integer, string], pattern: "^[0-9]+$", minimum: 0 }
  - { key: layer.params, type: object, open: true }
  - { key: layer.params.viewport, type: boolean }
  - { key: layer.queryparams, type: object }
---
`;

/** The layer keys; with requirements, the strict layer adds them to a partial layer. */
const layerKeys = (schema) =>
  schema.$defs['layer-partial'] ?? schema.$defs.layer;

function fixture(
  example = '{ "locale": { "layers": { "a": { "display": true } } } }',
  keys = LOCALE_KEYS,
) {
  const root = mkdtempSync(join(tmpdir(), 'xyz-schema-'));
  roots.push(root);
  const files = {
    'knowledge/index.md': INDEX,
    'knowledge/workspace/index.md': '# Workspace\n\n- [Locales](locales.md)',
    'knowledge/workspace/locales.md': `${keys}# Examples\n\n\`\`\`json\n${example}\n\`\`\``,
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
    expect(schema.properties.locale.anyOf[0].$ref).toBe('#/$defs/locale');
    expect(
      schema.$defs.locale.properties.layers.additionalProperties.$ref,
    ).toBe('#/$defs/layer');
    expect(schema.$defs.layer.properties.infoj.items.$ref).toBe(
      '#/$defs/entry',
    );
    expect(schema.$defs.layer.properties.srid.anyOf).toEqual([
      { type: 'string' },
      { type: 'integer' },
      { type: 'null' },
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
      type: ['string', 'null'],
      enum: ['wkt', 'mvt', null],
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

  it('lists examples without rejecting other values', () => {
    const schema = buildSchema(fixture());
    expect(schema.$defs.layer.properties.featureFormat).toMatchObject({
      examples: ['wkt', 'geojson'],
    });
    expect(schema.$defs.layer.properties.featureFormat.enum).toBeUndefined();
    expect(
      validateWorkspace(schema, { featureFormat: 'plugin' }, 'layer').errors,
    ).toEqual([]);
  });

  it('validates a locale or layer by its definition', () => {
    const schema = buildSchema(fixture());
    expect(
      validateWorkspace(schema, { display: true, srid: 1.5 }, 'layer').errors,
    ).toEqual(['layer.srid: expected string or integer, got number']);
  });

  it('accepts null as unset for optional keys and scalar map entries only', () => {
    const root = fixture(
      undefined,
      STRICT_KEYS.replace(
        '  - { key: layer.tables, type: object }',
        '  - { key: layer.tables, type: object }\n  - { key: layer.tables.*, type: string }',
      ),
    );
    for (const strict of [false, true]) {
      const schema = buildSchema(root, { strict });
      const layer = layerKeys(schema).properties;
      expect(layer.display.type).toEqual(['boolean', 'null']);
      expect(layer.srid.anyOf).toContainEqual({ type: 'null' });
      expect(layer.name.type).toBe('string');
      expect(layer.infoj.type).toEqual(['array', 'null']);
      expect(layer.style.properties.default.anyOf).toContainEqual({
        type: 'null',
      });
      const layers = schema.$defs.locale.properties.layers;
      expect(layers.additionalProperties.$ref).toBe(
        strict ? '#/$defs/layer-partial' : '#/$defs/layer',
      );
      const errors = (value) =>
        validateWorkspace(schema, value, 'layer').errors;
      // A zoom table hides the layer at zoom levels with a null table.
      expect(
        errors({
          name: 'a',
          format: null,
          display: null,
          srid: null,
          tables: { 5: null, 6: 'public.points' },
        }),
      ).toEqual([]);
      expect(errors({ name: 'a', display: 'yes' })).toEqual([
        'layer.display: expected boolean, got string',
      ]);
      expect(errors({ name: 'a', style: { default: null } })).toEqual([]);
      // A layer of a locale is not optional.
      expect(
        validateWorkspace(schema, { layers: { a: null } }, 'locale').errors,
      ).toEqual(['locale.layers.a: expected object, got null']);
    }
  });

  it('checks pattern, minimum and maximum in both schemas', () => {
    const root = fixture(undefined, STRICT_KEYS);
    const layer = { name: 'a', table: 'Bad-Table', opacity: 1.5, zIndex: 'x' };
    for (const strict of [false, true]) {
      const schema = buildSchema(root, { strict });
      expect(layerKeys(schema).properties.opacity).toMatchObject({
        minimum: 0,
        maximum: 1,
      });
      expect(validateWorkspace(schema, layer, 'layer').errors).toEqual([
        'layer.table: "Bad-Table" does not match ^[a-z_.]+$',
        'layer.opacity: 1.5 is greater than 1',
        'layer.zIndex: "x" does not match ^[0-9]+$',
      ]);
      expect(
        validateWorkspace(schema, { name: 'a', zIndex: -1 }, 'layer').errors,
      ).toEqual(['layer.zIndex: -1 is less than 0']);
    }
  });

  it('closes documented objects in the strict schema unless open', () => {
    const schema = buildSchema(fixture(undefined, STRICT_KEYS), {
      strict: true,
    });
    // Definitions are closed where they are referenced.
    expect(layerKeys(schema).unevaluatedProperties).toBeUndefined();
    expect(schema.$defs.locale.properties.layers.additionalProperties).toEqual(
      expect.objectContaining({
        $ref: '#/$defs/layer-partial',
        unevaluatedProperties: false,
      }),
    );
    const result = validateWorkspace(schema, {
      locale: {
        layers: {
          a: {
            name: 'a',
            colour: 'red',
            params: { viewport: true, custom: 1 },
            queryparams: { anything: true },
            infoj: [{ field: 'f', colour: 'red' }],
            style: { cluster: { fillColor: '#000', clusterScale: 1 } },
          },
        },
      },
    });
    expect(result.errors).toEqual([
      'locale.layers.a.colour: not allowed; no concept documents it',
      'locale.layers.a.infoj[0].colour: not allowed; no concept documents it',
    ]);
    // An open object and one without documented keys stay open in both
    // schemas, and their keys are not reported.
    expect(layerKeys(schema).properties.queryparams['x-xyz-open']).toBe(true);
    expect(result.undocumented).toEqual([]);
  });

  it('enforces requirements only in the strict schema', () => {
    const root = fixture(undefined, STRICT_KEYS);
    const open = buildSchema(root);
    const strict = buildSchema(root, { strict: true });
    expect(open.$defs.layer.allOf).toBeUndefined();
    expect(open.$defs.layer.properties.table['x-xyz-required']).toEqual({
      when: { 'layer.format': ['wkt', 'mvt'] },
      or: ['layer.tables'],
    });
    expect(strict.$defs.layer.allOf).toContainEqual({
      if: {
        properties: { format: { enum: ['wkt', 'mvt'] }, template: false },
        required: ['format'],
      },
      then: { anyOf: [{ required: ['table'] }, { required: ['tables'] }] },
    });
    const errors = (layer) => validateWorkspace(strict, layer, 'layer').errors;
    // A required key does not accept null.
    expect(errors({ format: 'wkt', name: null })).toEqual([
      'layer: missing name',
      'layer: missing table or tables (required when format is "wkt" or "mvt")',
      'layer.name: expected string, got null',
    ]);
    expect(errors({ format: 'wkt', name: 'a', tables: {} })).toEqual([]);
    expect(errors({ name: 'a' })).toEqual([]);
    // An object which merges a template may take the keys from it.
    expect(errors({ format: 'wkt', template: 'base' })).toEqual([]);
    expect(validateWorkspace(open, { format: 'wkt' }, 'layer').errors).toEqual(
      [],
    );
  });

  it('exempts layers from requirements where a locale.layer may supply them', () => {
    const root = fixture(
      undefined,
      STRICT_KEYS.replace(
        '  - { key: layer.template, type: string }',
        [
          '  - { key: layer.template, type: string }',
          '  - { key: workspace.locales.*, type: object, ref: locale }',
          '  - { key: locale.layer, type: object, ref: layer }',
          '  - { key: layer.roles.*, type: [boolean, object], ref: layer }',
        ].join('\n'),
      ),
    );
    const strict = buildSchema(root, { strict: true });
    // Merged values reference the layer keys without the requirements.
    expect(strict.$defs.layer).toMatchObject({
      $ref: '#/$defs/layer-partial',
    });
    expect(strict.$defs['layer-partial'].allOf).toBeUndefined();
    expect(strict.$defs.locale.properties.layer.anyOf[0].$ref).toBe(
      '#/$defs/layer-partial',
    );
    const errors = (workspace) => validateWorkspace(strict, workspace).errors;
    const layer = { format: 'wkt', table: 'points' };
    // locale.layer supplies the name; it is partial itself.
    expect(
      errors({ locale: { layer: { name: 'a' }, layers: { a: layer } } }),
    ).toEqual([]);
    // The workspace.locale is the default of every locale.
    expect(
      errors({
        locale: { layer: { name: 'a' } },
        locales: { uk: { layers: { a: layer } } },
      }),
    ).toEqual([]);
    // A roles entry is merged into the layer.
    expect(
      errors({
        locale: {
          layers: { a: { ...layer, name: 'a', roles: { admin: { srid: 1 } } } },
        },
      }),
    ).toEqual([]);
    // Without a locale.layer the layer is checked as composed; a type error
    // found by the requirements and by the partial layer is reported once.
    expect(
      errors({
        locales: { uk: { layers: { a: { ...layer, opacity: 2 } } } },
      }),
    ).toEqual([
      'locales.uk.layers.a.opacity: 2 is greater than 1',
      'locales.uk.layers.a: missing name',
    ]);
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
      'knowledge/workspace/workspace.strict.schema.json: out of date; run pnpm knowledge:schema',
    ]);
    writeSchema(root);
    expect(validateBundle(root).errors).toEqual([]);
  });

  it('checks examples against the strict schema', () => {
    const root = fixture(
      '{ "locale": { "layers": { "a": { "format": "wkt", "name": "a" } } } }',
      STRICT_KEYS,
    );
    writeSchema(root);
    expect(validateBundle(root).errors).toEqual([
      'knowledge/workspace/locales.md: example locale.layers.a: missing table or tables (required when format is "wkt" or "mvt")',
    ]);
  });

  it('accepts keys of open objects and objects without documented keys in examples', () => {
    const layer = (keys) =>
      `{ "locale": { "layers": { "a": { "name": "a", ${keys} } } } }`;
    const passes = fixture(
      layer('"params": { "custom": 1 }, "queryparams": { "foo": 1 }'),
      STRICT_KEYS,
    );
    writeSchema(passes);
    expect(validateBundle(passes).errors).toEqual([]);
    // The keys of a documented, closed object are still checked.
    const fails = fixture(layer('"style": { "colour": "red" }'), STRICT_KEYS);
    writeSchema(fails);
    expect(validateBundle(fails).errors).toEqual([
      'knowledge/workspace/locales.md: example locale.layers.a.style.colour: not allowed; no concept documents it',
    ]);
  });

  it('fails on examples with type errors or undocumented keys', () => {
    const root = fixture(
      '{ "locale": { "layers": { "a": { "display": 1, "colour": "red" } } } }',
    );
    writeSchema(root);
    expect(validateBundle(root).errors).toEqual([
      'knowledge/workspace/locales.md: example locale.layers.a.display: expected boolean, got integer',
      'knowledge/workspace/locales.md: example locale.layers.a.colour: not allowed; no concept documents it',
    ]);
  });
});
