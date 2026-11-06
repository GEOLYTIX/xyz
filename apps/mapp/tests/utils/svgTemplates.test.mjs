import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { svgTemplates } from '../../lib/utils/svgTemplates.mjs';

const validSvg =
  '<svg xmlns="http://www.w3.org/2000/svg"><circle r="5"/></svg>';

/**
Stubs fetch with responses by src.
*/
function stubFetch(responses) {
  const fetch = vi.fn(async (src) => {
    const response = responses[src];

    if (response instanceof Error) throw response;

    return new Response(response.body, { status: response.status ?? 200 });
  });

  vi.stubGlobal('fetch', fetch);

  return fetch;
}

describe('utils/svgTemplates', () => {
  const namespace = mapp.utils.svgSymbols;

  let warn;

  beforeEach(() => {
    // The svgSymbols module namespace is not extensible. The tests assign a plain object copy, see the BUG below.
    mapp.utils.svgSymbols = { ...namespace };
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    mapp.utils.svgSymbols = namespace;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('is assigned to mapp.utils', () => {
    expect(mapp.utils.svgTemplates).toBe(svgTemplates);
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3047: mapp.utils.svgSymbols is the svgSymbols module namespace. Assigning svgSymbols.templates throws a TypeError in the unbundled library.
  it.fails(
    'assigns the templates to the mapp.utils.svgSymbols module',
    async () => {
      mapp.utils.svgSymbols = namespace;

      stubFetch({ '/pin.svg': { body: validSvg } });

      await svgTemplates({ pin: '/pin.svg' });

      expect(mapp.utils.svgSymbols.templates).toEqual({ pin: validSvg });
    },
  );

  it.each([
    ['undefined', undefined],
    ['an empty object', {}],
  ])('does nothing for %s', async (_, templates) => {
    const fetch = stubFetch({});

    await svgTemplates(templates);

    expect(fetch).not.toHaveBeenCalled();
    expect(mapp.utils.svgSymbols.templates).toBeUndefined();
  });

  it('loads valid svg templates', async () => {
    stubFetch({ '/pin.svg': { body: validSvg } });

    await svgTemplates({ pin: '/pin.svg' });

    expect(mapp.utils.svgSymbols.templates).toEqual({ pin: validSvg });
    expect(warn).not.toHaveBeenCalled();
  });

  it('loads data:image templates', async () => {
    vi.unstubAllGlobals();

    await svgTemplates({
      inline: `data:image/svg+xml,${encodeURIComponent(validSvg)}`,
    });

    expect(mapp.utils.svgSymbols.templates.inline).toBe(validSvg);
  });

  it('does not fetch templates which are already loaded', async () => {
    mapp.utils.svgSymbols.templates = { pin: 'loaded' };

    const fetch = stubFetch({ '/other.svg': { body: validSvg } });

    await svgTemplates({ pin: '/pin.svg', other: '/other.svg' });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/other.svg');
    expect(mapp.utils.svgSymbols.templates.pin).toBe('loaded');
  });

  it.each([
    [
      'an error response',
      { status: 404, body: 'Not found' },
      'SVG template fetch failed [404]: /bad.svg',
    ],
    [
      'an html document',
      { body: '<!doctype html><html><body>404</body></html>' },
      'SVG template is not a valid svg document: /bad.svg',
    ],
    [
      'an xml document which is not svg',
      { body: '<root/>' },
      'SVG template is not a valid svg document: /bad.svg',
    ],
  ])('warns and skips %s', async (_, response, message) => {
    stubFetch({ '/bad.svg': response, '/pin.svg': { body: validSvg } });

    await svgTemplates({ bad: '/bad.svg', pin: '/pin.svg' });

    expect(warn).toHaveBeenCalledWith(message);
    expect(mapp.utils.svgSymbols.templates).toEqual({ pin: validSvg });
  });

  it('warns and skips a failed fetch', async () => {
    const error = new TypeError('Failed to fetch');

    stubFetch({ '/bad.svg': error });

    await svgTemplates({ bad: '/bad.svg' });

    expect(warn).toHaveBeenCalledWith(
      'SVG template fetch failed: /bad.svg',
      error,
    );
    expect(mapp.utils.svgSymbols.templates).toEqual({});
  });
});
