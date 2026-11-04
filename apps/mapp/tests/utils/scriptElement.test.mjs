import { afterEach, describe, expect, it, vi } from 'vitest';
import scriptElement from '../../lib/utils/scriptElement.mjs';

// Scripts are loaded from blob URLs so that no network request is made.
const blobUrl = (code) =>
  URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));

describe('utils/scriptElement', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('is assigned to mapp.utils', () => {
    expect(mapp.utils.scriptElement).toBe(scriptElement);
  });

  it('appends a module script and resolves on load', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    const src = blobUrl('globalThis.scriptElementModule = true;');

    await scriptElement(src);

    const script = document.head.querySelector(`script[src="${src}"]`);

    expect(script.type).toBe('module');
    expect(globalThis.scriptElementModule).toBe(true);
    expect(log).toHaveBeenCalledWith(`${src} script loaded.`);
  });

  it('appends a classic script with the type argument', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});

    const src = blobUrl('globalThis.scriptElementClassic = 1;');

    await scriptElement(src, 'text/javascript');

    expect(document.head.querySelector(`script[src="${src}"]`).type).toBe(
      'text/javascript',
    );
    expect(globalThis.scriptElementClassic).toBe(1);
  });

  it('appends a script element once for the same src', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});

    const src = blobUrl(
      'globalThis.scriptElementCount = (globalThis.scriptElementCount ?? 0) + 1;',
    );

    await Promise.all([scriptElement(src), scriptElement(src)]);
    await scriptElement(src);

    expect(document.head.querySelectorAll(`script[src="${src}"]`)).toHaveLength(
      1,
    );
    expect(globalThis.scriptElementCount).toBe(1);
  });

  it('rejects with the error event of a script which fails to load', async () => {
    const src = blobUrl('');

    URL.revokeObjectURL(src);

    const event = await scriptElement(src).catch((e) => e);

    expect(event).toBeInstanceOf(Event);
    expect(event.type).toBe('error');
  });
});
