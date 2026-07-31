/**
## /tests/lib/utils/svgTemplates

@module /tests/lib/utils/svgTemplates
*/

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('utils/svgTemplates', () => {
  let templates;

  beforeEach(() => {
    // The utility reads and writes a module level cache on the shared mapp
    // global. Snapshot it so each test starts from a known state.
    templates = mapp.utils.svgSymbols.templates;
    mapp.utils.svgSymbols.templates = {};

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      text: () => Promise.resolve('<svg id="fetched"></svg>'),
    });
  });

  afterEach(() => {
    mapp.utils.svgSymbols.templates = templates;
  });

  it('fetches and stores a template that is not yet loaded', async () => {
    await mapp.utils.svgTemplates({ dot: 'https://cdn.example/dot.svg' });

    expect(fetch).toHaveBeenCalledWith('https://cdn.example/dot.svg');
    expect(mapp.utils.svgSymbols.templates.dot).toEqual(
      '<svg id="fetched"></svg>',
    );
  });

  it('does not overwrite a template that is already loaded', async () => {
    mapp.utils.svgSymbols.templates.dot = '<svg id="original"></svg>';

    await mapp.utils.svgTemplates({ dot: 'https://cdn.example/dot.svg' });

    expect(fetch).not.toHaveBeenCalled();
    expect(mapp.utils.svgSymbols.templates.dot).toEqual(
      '<svg id="original"></svg>',
    );
  });

  it('loads every template in one call', async () => {
    await mapp.utils.svgTemplates({
      dot: 'https://cdn.example/dot.svg',
      pin: 'https://cdn.example/pin.svg',
    });

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(Object.keys(mapp.utils.svgSymbols.templates)).toEqual([
      'dot',
      'pin',
    ]);
  });

  it.each([[undefined], [null], [{}]])(
    'returns without fetching for %o',
    async (templates) => {
      await mapp.utils.svgTemplates(templates);

      expect(fetch).not.toHaveBeenCalled();
    },
  );
});
