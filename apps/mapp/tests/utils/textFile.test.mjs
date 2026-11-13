import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import textFile from '../../lib/utils/textFile.mjs';

describe('utils/textFile', () => {
  let click;
  let createObjectURL;
  let revokeObjectURL;

  beforeEach(() => {
    click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});
    createObjectURL = vi.spyOn(URL, 'createObjectURL');
    revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('is assigned to mapp.utils', () => {
    expect(mapp.utils.textFile).toBe(textFile);
  });

  it('downloads the text as a file', async () => {
    textFile({ text: 'hello', filename: 'greeting.csv', type: 'text/csv' });

    const blob = createObjectURL.mock.calls[0][0];

    expect(blob.type).toBe('text/csv');
    expect(await blob.text()).toBe('hello');

    const anchor = click.mock.contexts[0];

    expect(anchor.download).toBe('greeting.csv');
    expect(anchor.href).toBe(createObjectURL.mock.results[0].value);
    expect(revokeObjectURL).toHaveBeenCalledWith(anchor.href);
  });

  it('assigns a default filename and type', () => {
    const params = { text: 'hello' };

    textFile(params);

    expect(params.filename).toBe('file.txt');
    expect(params.type).toBe('text');
    expect(click.mock.contexts[0].download).toBe('file.txt');
  });

  it.each([[{}], [{ text: 1 }], [{ text: null }]])(
    'does nothing without a text string %o',
    (params) => {
      textFile(params);

      expect(createObjectURL).not.toHaveBeenCalled();
      expect(click).not.toHaveBeenCalled();
    },
  );
});
