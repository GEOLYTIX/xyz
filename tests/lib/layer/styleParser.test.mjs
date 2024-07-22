import { describe, it, assertEqual, assertNotEqual, assertTrue, assertFalse } from 'codi-test-framework';
import styleParser from '../../../lib/layer/styleParser.mjs';

describe('styleParser', () => {

  it('should parse theme styles', () => {
    const layer = {
      key: 'test-layer',
      style: {
        default: {},
        theme: {
          cat: {
            category1: {
              value: 'category1',
            },
            category2: {
              value: 'category2',
            },
          },
        },
      },
    };

    styleParser(layer);

    assertTrue(Array.isArray(layer.style.theme.categories), 'theme categories should be an array');
    assertEqual(layer.style.theme.categories.length, 2, 'theme categories should have 2 items');
  });

  it('should handle multiple themes', () => {
    const layer = {
      key: 'test-layer',
      style: {
        default: {},
        themes: {
          theme1: {
            title: 'Theme 1',
          },
          theme2: {
            title: 'Theme 2',
          },
        },
        theme: 'theme1',
      },
    };

    styleParser(layer);

    assertEqual(layer.style.theme.title, 'Theme 1', 'selected theme should match the specified theme');
  });

  it('should handle multiple hovers', () => {
    const layer = {
      key: 'test-layer',
      style: {
        default: {},
        hovers: {
          hover1: {
            method: 'customHoverMethod',
          }
        }
      },
    };

    styleParser(layer);

    assertEqual(layer.style.hover.method, 'customHoverMethod', 'selected hover should match the specified hover');
  });

  it('should handle multiple labels', () => {
    const layer = {
      key: 'test-layer',
      style: {
        default: {},
        labels: {
          label1: {
            field: 'label1Field',
          },
          label2: {
            field: 'label2Field',
          },
        }
      },
    };

    styleParser(layer);

    assertEqual(layer.style.label.field, 'label1Field', 'selected label should match the specified label');
  });

  it('should handle graduated theme with less_than breaks by default', () => {
    const layer = {
      key: 'test-layer',
      style: {
        default: {},
        theme: {
          type: 'graduated',
          field: 'value',
          categories: [
            { value: 10, style: { fillColor: 'red' } },
            { value: 20, style: { fillColor: 'green' } },
            { value: 30, style: { fillColor: 'blue' } },
          ],
        },
      },
    };

    const expected_categories = [
      { value: 10, style: { fillColor: 'red' }, label: 10 },
      { value: 20, style: { fillColor: 'green' }, label: 20 },
      { value: 30, style: { fillColor: 'blue' }, label: 30 }
    ];

    styleParser(layer);

    assertEqual(layer.style.theme.graduated_breaks, 'less_than', 'graduated_breaks should default to less_than');
    assertEqual(layer.style.theme.categories, expected_categories, 'categories should remain in the original order');
  });

  it('should handle graduated theme with greater_than breaks', () => {
    const layer = {
      key: 'test-layer',
      style: {
        default: {},
        theme: {
          type: 'graduated',
          field: 'value',
          graduated_breaks: 'greater_than',
          categories: [
            { value: 10, style: { fillColor: 'red' } },
            { value: 20, style: { fillColor: 'green' } },
            { value: 30, style: { fillColor: 'blue' } },
          ],
        },
      },
    };

    styleParser(layer);

    assertEqual(layer.style.theme.graduated_breaks, 'greater_than', 'graduated_breaks should be greater_than');
    assertEqual(layer.style.theme.categories[0].value, 30, 'categories should be reversed for greater_than breaks');
  });

  it('should handle deprecated layer.hover configuration', () => {
    const layer = {
      key: 'test-layer',
      default: {},
      hover: {
        method: 'customHoverMethod',
      },
      style: {}
    };

    styleParser(layer);

    assertEqual(layer.style.hover.method, 'customHoverMethod', 'hover configuration should be moved to layer.style.hover');
    assertFalse(layer.hasOwnProperty('hover'), 'layer.hover should be deleted');
  });

  it('should handle layer.style.hover and layers.style.hovers', () => {
    const layer = {
      key: 'test-layer',
      style: {
        hover: {
          method: 'customHoverMethod',
        },
        hovers: {
          hover1: {
            method: 'customHoverMethod1',
          },
          hover2: {
            method: 'customHoverMethod2',
          },
        }
      }
    };

    styleParser(layer);

    const expected = {
      'hovers': {
        'hover1': {
          'method': 'customHoverMethod1'
        },
        'hover2': {
          'method': 'customHoverMethod2'
        }
      },
      'highlight': { 'zIndex': null },
      'default': { 'strokeColor': '#333', 'fillColor': '#fff9' },
      'hover': { 'method': 'customHoverMethod1' }
    }

    assertTrue('hover' in layer.style);
    assertTrue('hovers' in layer.style);
    assertEqual(layer.style.hover.method, expected.hover.method);
  });

  it('should handle layer.style.label and layers.style.labels', () => {
    const layer = {
      key: 'test-layer',
      style: {
        label: {
          field: 'labelField',
        },
        labels: {
          label1: {
            field: 'label1Field',
          },
          label2: {
            field: 'label2Field',
          },
        }
      }
    };

    styleParser(layer);

    const expected = {
      style: {
        labels: {
          label1: {
            field: 'label1Field',
          },
          label2: {
            field: 'label2Field',
          },
        },
        'highlight': { 'zIndex': null },
        'default': { 'strokeColor': '#333', 'fillColor': '#fff9' },
        'label': {
          field: 'label1Field'
        }
      }
    }
    assertTrue('label' in layer.style);
    assertTrue('labels' in layer.style);
    assertEqual(layer.style.label.field, expected.style.label.field)
  });

  it('should remove keys that are not in the default icon object', () => {
    const layer = {
      format: 'wkt',
      key: 'test-layer',
      cluster: {},
      style: {
        default: {
          scale: 2,
          key_to_be_removed: 'remove me',
          icon: {
            type: 'dot',
            fillColor: '#000000',
          }
        }
      }
    };

    styleParser(layer);

    // Non-icon key should be removed 
    assertFalse('key_to_be_removed' in layer.style.default, 'There should be no other keys other than icon and scale in the default style');
  });

});