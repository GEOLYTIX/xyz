import { describe, expect, it, vi } from 'vitest';
import { lidlLocation } from '../../helpers.mjs';

const { entries } = mapp.ui.locations;

describe('ui/locations/entries', () => {
  it.each([
    ['datetime', 'date'],
    ['html', 'textarea'],
    ['integer', 'numeric'],
    ['report', 'link'],
    ['documents', 'images'],
    ['image', 'images'],
  ])('assigns the %s type to the %s method', (type, method) => {
    expect(entries[type]).toBe(entries[method]);
  });

  it('warns for the deprecated defaults type', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(entries.defaults({})).toBeUndefined();
    expect(warn).toHaveBeenCalledWith(
      'The type:defaults entry method has been deprecated.',
    );
  });

  it.each(['mvt_clone', 'vector_layer'])(
    'warns and creates a layer entry for the legacy %s type',
    async (type) => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const { location, mapview } = await lidlLocation();

      const entry = {
        type,
        layer: 'retail_points',
        label: 'Clone',
        location,
      };

      const panel = entries[type](entry);

      expect(warn).toHaveBeenCalledWith(
        `The type:${type} entry method has been deprecated in favour of the type:layer entry method.`,
      );
      expect(entry.type).toBe('layer');
      expect(entry.qID).toBe('id');
      expect(entry.name).toBe('Clone');
      expect(panel.classList).toContain('entry-layer');

      await vi.waitFor(() => expect(entry.display_toggle).toBeDefined());

      expect(mapview.layers[entry.key]).toBe(entry);
    },
  );
});
