import { describe, expect, it } from 'vitest';
import { stubEntry } from './_helpers.mjs';

const { pills } = mapp.ui.locations.entries;

function pillValues(container) {
  return [...container.querySelectorAll('.pill')].map(
    (pill) => pill.dataset.value,
  );
}

describe('ui/locations/entries/pills', () => {
  it('returns a pill container with a pill for each value', () => {
    const { entry } = stubEntry({ value: ['a', 'b'] });

    const container = pills(entry);

    expect(container).toBe(entry.container);
    expect(container.classList).toContain('pill-container');
    expect(pillValues(container)).toEqual(['a', 'b']);
    expect(entry.pills).toEqual(new Set(['a', 'b']));
  });

  it('returns an empty container without a value', () => {
    const { entry } = stubEntry({ value: null });

    expect(pillValues(pills(entry))).toEqual([]);
  });

  it('keeps the pills of the entry', () => {
    const { entry } = stubEntry({ value: ['a'], pills: ['c'] });

    expect(pillValues(pills(entry))).toEqual(['c']);
  });
});
