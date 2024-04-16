import { describe, it, assertEqual, assertNotEqual, assertTrue, assertFalse } from 'codi-test-framework';
import styleParser from '../../../lib/layer/styleParser.mjs';

describe('styleParser', () => {
  it('should assign default highlight style and zIndex', () => {
    const layer = {
      key: 'test-layer',
      style: {
        default: {}
      },
    };

    styleParser(layer);

    assertTrue(layer.style.highlight !== undefined, 'highlight style should be assigned');
    assertEqual(layer.style.highlight.zIndex, Infinity, 'zIndex should be set to Infinity');
  });

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
      { value: 10, style: { fillColor: "red" }, label: 10 }, 
      { value: 20, style: { fillColor: "green" }, label: 20 },
      { value: 30, style: { fillColor: "blue" }, label: 30 }
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

  it('should handle deprecated layer.style.hover and layer.style.hovers', () => {
    const layer = {
      key: 'test-layer',
      style: {
        default: {},
        hover: {
          method: 'customHoverMethod',
        },
        hovers: {
          hover1: {},
          hover2: {},
        },
      },
    };

    styleParser(layer);

    assertFalse(layer.style.hasOwnProperty('hover'), 'layer.style.hover should be deleted');
    assertTrue(layer.style.hasOwnProperty('hovers'), 'layer.style.hovers should be preserved');
  });

});
