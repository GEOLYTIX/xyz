import { beforeEach, describe, expect, it, vi } from 'vitest';
import csvDownload from '../../lib/utils/csvDownload.mjs';

describe('utils/csvDownload', () => {
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

  /**
  Returns the blob which was passed to the URL.createObjectURL method.
  */
  function blob() {
    return createObjectURL.mock.calls[0][0];
  }

  it('is assigned to mapp.utils', () => {
    expect(mapp.utils.csvDownload).toBe(csvDownload);
  });

  it('warns and does not download if the data is not an array', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    csvDownload({ a: 1 });

    expect(warn).toHaveBeenCalledWith(
      'Array argument for csvDownload must be an array',
    );
    expect(createObjectURL).not.toHaveBeenCalled();
    expect(click).not.toHaveBeenCalled();
  });

  it('downloads the record values as comma separated rows', async () => {
    csvDownload([
      { id: 1, name: 'Paris' },
      { id: 2, name: 'Berlin' },
    ]);

    expect(blob().type).toBe('text/csv;charset=utf-8;');
    expect(await blob().text()).toBe('1,Paris\r\n2,Berlin');

    const anchor = click.mock.contexts[0];

    expect(anchor.download).toBe('file.csv');
    expect(anchor.href).toBe(createObjectURL.mock.results[0].value);
    expect(anchor.dataset.downloadurl).toBe(`csv:file.csv:${anchor.href}`);
    expect(anchor.style.display).toBe('none');
    expect(anchor.parentElement).toBe(document.body);
    expect(revokeObjectURL).toHaveBeenCalledWith(anchor.href);

    anchor.remove();
  });

  it('downloads the rows with the separator, join, title and type params', async () => {
    csvDownload(
      [
        { id: 1, name: 'Paris' },
        { id: 2, name: 'Berlin' },
      ],
      { separator: ';', join: '\n', title: 'cities', type: 'text/plain' },
    );

    expect(blob().type).toBe('text/plain');
    expect(await blob().text()).toBe('1;Paris\n2;Berlin');
    expect(click.mock.contexts[0].download).toBe('cities.csv');

    click.mock.contexts[0].remove();
  });

  it('downloads the record values of the fields in the order of the fields', async () => {
    csvDownload([{ id: 1, name: 'Paris', category: 'city' }], {
      fields: [{ field: 'category' }, { field: 'id' }],
    });

    expect(await blob().text()).toBe('city,1');

    click.mock.contexts[0].remove();
  });

  it('quotes a string field and escapes its quotes', async () => {
    csvDownload([{ name: 'The "Shard", London', size: 5 }], {
      fields: [
        { field: 'name', string: true },
        // A value which is not a string is not quoted.
        { field: 'size', string: true },
      ],
    });

    expect(await blob().text()).toBe('"The ""Shard"", London",5');

    click.mock.contexts[0].remove();
  });

  it('formats a number field with the toLocaleString formatter', async () => {
    csvDownload([{ sales: '1234567.891', margin: 0.256, text: 'none' }], {
      fields: [
        { field: 'sales', formatter: 'toLocaleString', locale: 'en-GB' },
        {
          field: 'margin',
          formatter: 'toLocaleString',
          locale: 'en-GB',
          options: { style: 'percent' },
        },
        // The value is not a number.
        { field: 'text', formatter: 'toLocaleString', locale: 'en-GB' },
      ],
    });

    expect(await blob().text()).toBe('"1,234,567.891","26%",');

    click.mock.contexts[0].remove();
  });

  it('has an empty value for a field without a field key', async () => {
    csvDownload([{ id: 1, name: 'Paris' }], {
      fields: [{ field: 'id' }, { title: 'Empty' }, { field: 'name' }],
    });

    expect(await blob().text()).toBe('1,,Paris');

    click.mock.contexts[0].remove();
  });

  it('adds a header row with the field titles or field keys', async () => {
    csvDownload([{ id: 1, name: 'Paris' }], {
      header: true,
      fields: [{ field: 'id', title: 'ID' }, { field: 'name' }],
    });

    expect(await blob().text()).toBe('ID,name\r\n1,Paris');

    click.mock.contexts[0].remove();
  });

  it('has no header row without fields', async () => {
    csvDownload([{ id: 1, name: 'Paris' }], { header: true });

    expect(await blob().text()).toBe('1,Paris');

    click.mock.contexts[0].remove();
  });
});
