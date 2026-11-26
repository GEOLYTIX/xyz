import { describe, expect, it } from 'vitest';
import merge from '../../apps/xyz/mod/utils/merge.js';
import { combineExamples, exampleLocales, UNFILTERED } from './examples.mjs';

const path = 'knowledge/test.md';

/** The layer as getLayer composes it: locale.layer, then the layer template, then the layer. */
function composedLayer(workspace, locale, key) {
  const layer = merge(
    structuredClone(locale.layer ?? {}),
    structuredClone(locale.layers[key]),
  );
  if (!layer.template) return layer;
  const { template, ...own } = layer;
  return merge(structuredClone(workspace.templates[template]), own);
}

describe('knowledge examples', () => {
  describe('exampleLocales', () => {
    it('returns the locale of an example without named locales', () => {
      const locale = { name: 'Single' };
      expect(exampleLocales({ id: 'x', path, workspace: { locale } })).toEqual([
        ['x', locale],
      ]);
    });

    it('merges the defaults into a named locale without a template', () => {
      const [[key, locale]] = exampleLocales({
        id: 'x',
        path,
        workspace: {
          locale: { name: 'Default', srid: '3857' },
          locales: { a: { name: 'A' } },
        },
      });
      expect(key).toBe('x__a');
      expect(locale).toEqual({ name: 'A', srid: '3857' });
    });

    it('lets the template of a named locale precede the defaults', () => {
      const [[, locale]] = exampleLocales({
        id: 'x',
        path,
        workspace: {
          locale: { name: 'Default', srid: '3857', template: 'other' },
          locales: { a: { template: 'tpl', label: 'Own' } },
          templates: { tpl: { name: 'Template', label: 'Template' } },
        },
      });
      expect(locale).toEqual({ name: 'Template', srid: '3857', label: 'Own' });
    });

    it('throws when the template of a named locale is not in the example', () => {
      expect(() =>
        exampleLocales({
          id: 'x',
          path,
          workspace: { locales: { a: { template: 'missing' } } },
        }),
      ).toThrow(/locale a uses template missing/);
    });
  });

  describe('combineExamples', () => {
    const filter = { default: { size: { gt: 1 } } };

    it('removes a filter declared on the layer from the twin', () => {
      const workspace = combineExamples([
        { id: 'x', path, workspace: { locale: { layers: { l: { filter } } } } },
      ]);
      expect(workspace.locales.x.layers.l.filter).toEqual(filter);
      expect(workspace.locales[`x${UNFILTERED}`].layers.l.filter.default).toBe(
        null,
      );
    });

    it('removes a filter inherited from locale.layer from the twin', () => {
      const workspace = combineExamples([
        {
          id: 'x',
          path,
          workspace: { locale: { layer: { filter }, layers: { l: {} } } },
        },
      ]);
      const twin = workspace.locales[`x${UNFILTERED}`];
      expect(twin.layer.filter).toEqual(filter);
      expect(composedLayer(workspace, twin, 'l').filter.default).toBe(null);
      expect(composedLayer(workspace, workspace.locales.x, 'l').filter).toEqual(
        filter,
      );
    });

    it('removes a filter inherited from the layer template from the twin', () => {
      const workspace = combineExamples([
        {
          id: 'x',
          path,
          workspace: {
            locale: { layers: { l: { template: 'layer_tpl' } } },
            templates: { layer_tpl: { filter } },
          },
        },
      ]);
      const twin = workspace.locales[`x${UNFILTERED}`];
      expect(composedLayer(workspace, twin, 'l').filter.default).toBe(null);
      expect(composedLayer(workspace, workspace.locales.x, 'l').filter).toEqual(
        filter,
      );
    });

    it('throws for a default filter from a templates array entry', () => {
      expect(() =>
        combineExamples([
          {
            id: 'x',
            path,
            workspace: {
              locale: { layers: { l: { templates: ['layer_tpl'] } } },
              templates: { layer_tpl: { filter } },
            },
          },
        ]),
      ).toThrow(/layer l inherits a default filter/);
    });
  });
});
