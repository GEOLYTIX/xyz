import { describe, it, assertEqual, assertNotEqual, assertTrue, assertFalse } from 'https://esm.sh/codi-test-framework@0.0.26';
import Style from './path/to/Style.js';

describe('Style - featureLookup', () => {
  it('should assign properties from featureLookup if feature exists', () => {
    const layer = {
      featureLookup: [
        { id: '1', name: 'Feature 1', color: 'red' },
        { id: '2', name: 'Feature 2', color: 'blue' },
      ],
    };
    const feature = {
      properties: {
        id: '1',
      },
      getGeometry: () => ({
        getType: () => 'Point',
      }),
    };

    const styleFunction = Style(layer);
    styleFunction(feature);

    assertEqual(feature.properties.name, 'Feature 1', 'Should assign properties from featureLookup');
    assertEqual(feature.properties.color, 'red', 'Should assign properties from featureLookup');
  });

  it('should not style features not found in featureLookup', () => {
    const layer = {
      featureLookup: [
        { id: '1', name: 'Feature 1', color: 'red' },
        { id: '2', name: 'Feature 2', color: 'blue' },
      ],
    };
    const feature = {
      properties: {
        id: '3',
      },
      getGeometry: () => ({
        getType: () => 'Point',
      }),
    };

    const styleFunction = Style(layer);
    const style = styleFunction(feature);

    assertEqual(style, undefined, 'Should not style features not found in featureLookup');
  });

  it('should use custom featureLookupId property for matching', () => {
    const layer = {
      featureLookup: [
        { customId: '1', name: 'Feature 1', color: 'red' },
        { customId: '2', name: 'Feature 2', color: 'blue' },
      ],
      featureLookupId: 'customId',
    };
    const feature = {
      properties: {
        id: '1',
      },
      getGeometry: () => ({
        getType: () => 'Point',
      }),
    };

    const styleFunction = Style(layer);
    styleFunction(feature);

    assertEqual(feature.properties.name, 'Feature 1', 'Should use custom featureLookupId for matching');
    assertEqual(feature.properties.color, 'red', 'Should use custom featureLookupId for matching');
  });

  it('should not modify feature properties if featureLookup is not an array', () => {
    const layer = {
      featureLookup: 'invalid',
    };
    const feature = {
      properties: {
        id: '1',
        name: 'Original Name',
      },
      getGeometry: () => ({
        getType: () => 'Point',
      }),
    };

    const styleFunction = Style(layer);
    styleFunction(feature);

    assertEqual(feature.properties.name, 'Original Name', 'Should not modify feature properties if featureLookup is not an array');
  });
});