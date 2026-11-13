import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  featureProperties,
  featureStyle,
} from '../../lib/layer/featureStyle.mjs';

const svg = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';

/**
Returns a layer with a stub mapview at the zoom level.
*/
function layer(style, props = {}, zoom = 10) {
  return {
    key: 'test',
    style: { default: { fillColor: '#999999' }, ...style },
    mapview: {
      locations: {},
      Map: { getView: () => ({ getZoom: () => zoom }) },
    },
    ...props,
  };
}

function feature(properties) {
  return new ol.Feature({
    geometry: new ol.geom.Point([0, 0]),
    ...properties,
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('layer/featureStyle', () => {
  describe('featureProperties', () => {
    it('returns the properties', () => {
      expect(featureProperties({}, { id: 1 })).toEqual({ id: 1 });
    });

    it('returns null for features not in the featureSet', () => {
      const l = { featureSet: new Set([1]) };

      expect(featureProperties(l, { id: 1 })).toEqual({ id: 1 });
      expect(featureProperties(l, { id: 2 })).toBeNull();
    });

    it('ignores an empty featureSet', () => {
      expect(featureProperties({ featureSet: new Set() }, { id: 2 })).toEqual({
        id: 2,
      });
    });

    it('assigns the properties from the featuresObject', () => {
      const l = { featuresObject: { 1: { category: 'city' } } };

      expect(featureProperties(l, { id: 1 })).toEqual({
        id: 1,
        category: 'city',
      });

      expect(featureProperties(l, { id: 2 })).toBeNull();
    });

    it('assigns the properties from the featureLookup', () => {
      const l = { featureLookup: [{ id: 1, value: 10 }] };

      expect(featureProperties(l, { id: 1 })).toEqual({ id: 1, value: 10 });
      expect(featureProperties(l, { id: 2 })).toBeNull();
    });

    it('looks up features by the featureLookupId', () => {
      const l = {
        featureLookup: [{ code: 'a', value: 10 }],
        featureLookupId: 'code',
      };

      expect(featureProperties(l, { id: 'a' })).toEqual({
        id: 'a',
        code: 'a',
        value: 10,
      });
    });

    it('assigns nested properties with a warning', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      expect(
        featureProperties({}, { id: 1, properties: { name: 'nested' } }),
      ).toEqual({ id: 1, name: 'nested' });

      expect(warn).toHaveBeenCalledWith('Feature with properties.properties');
    });
  });

  describe('featureStyle', () => {
    it('returns the Openlayers styles for the default style', () => {
      const Style = featureStyle(layer());

      const f = feature({ id: 1 });

      const Styles = Style(f);

      expect(Styles).toHaveLength(1);
      expect(Styles[0].getFill()).toBeTruthy();
      expect(f.properties).toMatchObject({ id: 1 });
    });

    it('does not mutate the default style', () => {
      const l = layer({
        theme: { type: 'basic', style: { fillColor: '#f00' } },
      });

      const f = feature({ id: 1 });

      featureStyle(l)(f);

      expect(f.style.fillColor).toBe('#f00');
      expect(l.style.default.fillColor).toBe('#999999');
    });

    it('returns null for features which are not displayed', () => {
      const l = layer({}, { featureSet: new Set([2]) });

      expect(featureStyle(l)(feature({ id: 1 }))).toBeNull();
    });

    it('applies the theme style', () => {
      const l = layer({
        theme: {
          type: 'categorized',
          field: 'category',
          categories: [
            { value: 'city', style: { fillColor: '#4363d8' } },
            { value: 'hidden', style: null },
          ],
        },
      });

      const Style = featureStyle(l);

      const city = feature({ id: 1, category: 'city' });

      Style(city);

      expect(city.style.fillColor).toBe('#4363d8');

      expect(Style(feature({ id: 2, category: 'hidden' }))).toBeUndefined();
    });

    it('ignores an unknown theme type', () => {
      const f = feature({ id: 1 });

      featureStyle(layer({ theme: { type: 'unknown' } }))(f);

      expect(f.style).toEqual({ fillColor: '#999999' });
    });

    it('returns the cached Styles with style.cache', () => {
      const Style = featureStyle(layer({ cache: true }));

      const f = feature({ id: 1 });

      const Styles = Style(f);

      expect(Style(f)).toBe(Styles);
    });

    it('creates new Styles without style.cache', () => {
      const Style = featureStyle(layer());

      const f = feature({ id: 1 });

      expect(Style(f)).not.toBe(Style(f));
    });

    describe('cluster', () => {
      function clusterLayer(cluster) {
        return layer(
          {
            default: { icon: { url: svg } },
            cluster: { icon: { url: svg, scale: 2 }, ...cluster },
          },
          { cluster: { max_size: 10 } },
        );
      }

      it('does not apply the cluster style to a single feature', () => {
        const f = feature({ id: 1, count: 1 });

        featureStyle(clusterLayer())(f);

        expect(f.style.icon.scale).toBeUndefined();
      });

      it('applies the cluster style to cluster features', () => {
        const f = feature({ id: 1, count: 5 });

        featureStyle(clusterLayer())(f);

        expect(f.style.icon.scale).toBe(2);
        expect(f.style.clusterScale).toBeUndefined();
      });

      it('does not apply a cluster style without layer.style.cluster', () => {
        const l = layer({ default: { icon: { url: svg } } });

        const f = feature({ id: 1, count: 5 });

        featureStyle(l)(f);

        expect(f.style.icon).toEqual({ url: svg });
      });

      it('adds a fraction of the clusterScale by count', () => {
        const f = feature({ id: 1, count: 5 });

        featureStyle(clusterLayer({ clusterScale: 2 }))(f);

        expect(f.style.clusterScale).toBe(1 + (2 / 10) * 5);
      });

      it('adds a fraction of the clusterScale by size', () => {
        const f = feature({ id: 1, count: 5, size: 8 });

        featureStyle(clusterLayer({ clusterScale: 2 }))(f);

        expect(f.style.clusterScale).toBe(1 + (2 / 10) * 8);
      });

      it('applies a log clusterScale', () => {
        const f = feature({ id: 1, count: 5 });

        featureStyle(clusterLayer({ clusterScale: 2, logScale: true }))(f);

        expect(f.style.clusterScale).toBeCloseTo(
          (Math.log(2) / Math.log(10)) * Math.log(5),
        );
      });

      it('applies the zoomIn and zoomOut scales', () => {
        const f = feature({ id: 1, count: 5 });

        featureStyle(clusterLayer({ zoomInScale: 0.1, zoomOutScale: 5 }))(f);

        expect(f.style.zoomInScale).toBeCloseTo(1);
        expect(f.style.zoomOutScale).toBeCloseTo(0.5);
      });
    });

    describe('highlight', () => {
      const highlight = { fillColor: '#ff0000' };

      it('applies the highlight style to the highlighted feature', () => {
        const Style = featureStyle(layer({ highlight }, { highlight: 1 }));

        const f1 = feature({ id: 1 });
        const f2 = feature({ id: 2 });

        Style(f1);
        Style(f2);

        expect(f1.style.fillColor).toBe('#ff0000');
        expect(f2.style.fillColor).toBe('#999999');
      });

      it('matches the highlight with the feature id', () => {
        const f = feature({});
        f.setId('a');

        featureStyle(layer({ highlight }, { highlight: 'a' }))(f);

        expect(f.style.fillColor).toBe('#ff0000');
      });

      it('requires a layer.highlight', () => {
        const f = feature({ id: 1 });

        featureStyle(layer({ highlight }))(f);

        expect(f.style.fillColor).toBe('#999999');
      });
    });

    describe('label', () => {
      it('assigns the label text from the label field', () => {
        const f = feature({ id: 1, name: 'Paris' });

        featureStyle(layer({ label: { display: true, field: 'name' } }))(f);

        expect(f.style.label.text).toBe('Paris');
      });

      it('assigns the label property without a label field value', () => {
        const f = feature({ id: 1, label: 'Fallback' });

        featureStyle(layer({ label: { display: true, field: 'name' } }))(f);

        expect(f.style.label.text).toBe('Fallback');
      });

      it('assigns the cluster count as label text', () => {
        const f = feature({ id: 1, count: 3, name: 'Paris' });

        featureStyle(
          layer({ label: { display: true, field: 'name', count: true } }),
        )(f);

        expect(f.style.label.text).toBe(3);
      });

      it('removes a label which is not displayed', () => {
        const l = layer({
          default: { fillColor: '#999999', label: { text: 'x' } },
          label: { field: 'name' },
        });

        const f = feature({ id: 1, name: 'Paris' });

        featureStyle(l)(f);

        expect(f.style.label).toBeUndefined();
      });

      it.each([
        ['minZoom above', { minZoom: 11 }, false],
        ['minZoom below', { minZoom: 9 }, true],
        ['maxZoom below', { maxZoom: 9 }, false],
        ['maxZoom above', { maxZoom: 11 }, true],
      ])('the label with a %s the zoom', (_, zoom, displayed) => {
        const f = feature({ id: 1, name: 'Paris' });

        featureStyle(
          layer({ label: { display: true, field: 'name', ...zoom } }),
        )(f);

        expect(!!f.style.label).toBe(displayed);
      });
    });

    describe('selected', () => {
      it('applies the selected style to features in the mapview locations', () => {
        const selected = { fillColor: '#00ff00' };

        const l = layer({ selected });

        l.mapview.locations['test!1'] = {};

        const Style = featureStyle(l);

        const f1 = feature({ id: 1 });
        const f2 = feature({ id: 2 });

        Style(f1);
        Style(f2);

        expect(f1.style).toBe(selected);
        expect(f2.style.fillColor).toBe('#999999');
      });
    });

    describe('icon_scaling', () => {
      it('assigns the fieldScale by the max', () => {
        const f = feature({ id: 1, size: 5 });

        featureStyle(layer({ icon_scaling: { field: 'size', max: 10 } }))(f);

        expect(f.style.fieldScale).toBe(1.5);
      });

      it('assigns the fieldScale by the scaleFactor', () => {
        const f = feature({ id: 1, size: 5 });

        featureStyle(
          layer({ icon_scaling: { field: 'size', max: 10, scaleFactor: 5 } }),
        )(f);

        expect(f.style.fieldScale).toBe(2);
      });

      it('does not shrink icons for negative values', () => {
        const f = feature({ id: 1, size: -5 });

        featureStyle(layer({ icon_scaling: { field: 'size', max: 10 } }))(f);

        expect(f.style.fieldScale).toBe(1);
      });

      it('does not scale for non numeric values', () => {
        const f = feature({ id: 1, size: 'abc' });

        featureStyle(layer({ icon_scaling: { field: 'size', max: 10 } }))(f);

        expect(f.style.fieldScale).toBeUndefined();
      });

      const cluster = () => [
        new ol.Feature({ size: 2 }),
        new ol.Feature({ size: 4 }),
      ];

      it('does not scale cluster features without icon_scaling.cluster', () => {
        const f = feature({ id: 1, size: 5, features: cluster() });

        featureStyle(layer({ icon_scaling: { field: 'size', max: 10 } }))(f);

        expect(f.style.fieldScale).toBeUndefined();
      });

      it.each([
        ['sum', true, 1.6],
        ['avg', 'avg', 1.3],
      ])('scales cluster features by the %s', (_, cluster_, fieldScale) => {
        const f = feature({ id: 1, features: cluster() });

        featureStyle(
          layer({
            icon_scaling: { field: 'size', max: 10, cluster: cluster_ },
          }),
        )(f);

        expect(f.style.fieldScale).toBeCloseTo(fieldScale);
      });
    });
  });
});
