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
        default:{},
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
      default:{},
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
});