import { describe, it, assertTrue, assertFalse } from 'codi-test-framework';
import featureFilter from '../../lib/layer/featureFilter.mjs';

describe('featureFilter module', () => {
  it('should return true if a filter catches the feature', () => {
    const filters = {
      type: {
        ni: ['residential', 'commercial']
      }
    };

    const feature = {
      properties: {
        type: 'residential'
      }
    };

    const result = featureFilter(filters, feature);
    assertTrue(result, 'Expected the feature to be caught by the filter');
  });

  it('should return false if no filter catches the feature', () => {
    const filters = {
      type: {
        ni: ['industrial', 'agricultural']
      }
    };

    const feature = {
      properties: {
        type: 'residential'
      }
    };

    const result = featureFilter(filters, feature);
    assertFalse(result, 'Expected the feature to not be caught by any filter');
  });

  it('should handle multiple filters', () => {
    const filters = {
      type: {
        ni: ['residential', 'commercial']
      },
      status: {
        ni: ['active']
      }
    };

    const feature1 = {
      properties: {
        type: 'residential',
        status: 'active'
      }
    };

    const feature2 = {
      properties: {
        type: 'none'
      }
    };

    const result1 = featureFilter(filters, feature1);
    assertTrue(result1, 'Expected feature1 to be caught by the filters');

    const result2 = featureFilter(filters, feature2);
    assertFalse(result2, 'Expected feature2 to not be caught by the filters');
  });

  it('should return false if the filter type is not supported', () => {
    const filters = {
      type: {
        unsupported: ['residential', 'commercial']
      }
    };

    const feature = {
      properties: {
        type: 'residential'
      }
    };

    const result = featureFilter(filters, feature);
    assertFalse(result, 'Expected the feature to not be caught by the unsupported filter type');
  });
});