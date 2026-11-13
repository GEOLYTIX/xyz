import { describe, expect, it, vi } from 'vitest';
import csvUpload from '../../lib/utils/csvUpload.mjs';

/**
Stubs the mapp.utils.xhr method. The requests are not sent to the testhost, because the test files of a run share the devdb tables.

Each request resolves with the number of the request.
*/
function stubXhr() {
  let requests = 0;

  return vi.spyOn(mapp.utils, 'xhr').mockImplementation(async () => ++requests);
}

/**
Returns the parsed request bodies of the mapp.utils.xhr calls.
*/
function bodies(xhr) {
  return xhr.mock.calls.map(([params]) => JSON.parse(params.body));
}

function csv(text) {
  return new File([text], 'upload.csv', { type: 'text/csv' });
}

describe('utils/csvUpload', () => {
  it('is assigned to mapp.utils', () => {
    expect(mapp.utils.csvUpload).toBe(csvUpload);
  });

  it.each([
    ['a query', undefined, 'A query must be supplied for the csv upload.'],
    [
      'fields',
      { query: 'insert' },
      'Fields are required to define the columns being inserted.',
    ],
    [
      'a layer for the sql_table_insert query',
      {
        query: 'sql_table_insert',
        fields: { name: 'text' },
        queryparams: { table: 'example.scratch' },
      },
      'A layer must be supplied for the insert query.',
    ],
    [
      'a table for the sql_table_insert query',
      {
        query: 'sql_table_insert',
        fields: { name: 'text' },
        queryparams: { layer: 'scratch' },
      },
      'A table must be supplied for the insert query.',
    ],
  ])('returns an error without %s', async (_, params, message) => {
    const xhr = stubXhr();

    const response = await csvUpload(csv('a'), params);

    expect(response).toBeInstanceOf(Error);
    expect(response.message).toContain(message);
    expect(xhr).not.toHaveBeenCalled();
  });

  it('posts the field values as arrays by field and type', async () => {
    const xhr = stubXhr();

    const responses = await csvUpload(
      csv('Paris,city,12,2.5\r\nBerlin,city,7,10\nGeolytix,office,3,1.25\n'),
      {
        query: 'sql_table_insert',
        queryparams: { layer: 'scratch', table: 'example.scratch' },
        fields: {
          name: 'text',
          category: 'varchar',
          size: 'int',
          score: 'numeric',
        },
      },
    );

    // The responses of the requests.
    expect(responses).toEqual([1]);

    expect(xhr).toHaveBeenCalledTimes(1);

    const [params] = xhr.mock.calls[0];

    expect(params.method).toBe('POST');

    const url = new URL(params.url);

    expect(url.origin).toBe(mapp.host);
    expect(url.pathname).toBe('/api/query');
    expect(url.searchParams.get('template')).toBe('sql_table_insert');
    expect(url.searchParams.get('layer')).toBe('scratch');
    expect(url.searchParams.get('table')).toBe('example.scratch');

    expect(bodies(xhr)).toEqual([
      {
        'name::text': ['Paris', 'Berlin', 'Geolytix'],
        'category::varchar': ['city', 'city', 'office'],
        'size::int': [12, 7, 3],
        'score::numeric': [2.5, 10, 1.25],
      },
    ]);
  });

  it('does not upload the header row', async () => {
    const xhr = stubXhr();

    await csvUpload(csv('name,size\nParis,12\nBerlin,7'), {
      query: 'insert',
      header: true,
      fields: { name: 'text', size: 'int' },
    });

    expect(bodies(xhr)).toEqual([
      { 'name::text': ['Paris', 'Berlin'], 'size::int': [12, 7] },
    ]);
  });

  it('splits a row on the commas which are not in double quotes', async () => {
    const xhr = stubXhr();

    await csvUpload(csv('"Smith, John" , city\n  Berlin  ,"a, b, c"'), {
      query: 'insert',
      fields: { name: 'text', category: 'text' },
    });

    // The quotes are removed and the values are trimmed.
    expect(bodies(xhr)).toEqual([
      {
        'name::text': ['Smith, John', 'Berlin'],
        'category::text': ['city', 'a, b, c'],
      },
    ]);
  });

  it('converts the values for the field type', async () => {
    const xhr = stubXhr();

    await csvUpload(
      csv("O'Brien,null,£1 200,-12.5%\nnull,It's,n/a,\nParis,city,-7.9,1e3"),
      {
        query: 'insert',
        fields: {
          name: 'text',
          category: 'varchar',
          size: 'int',
          score: 'numeric',
        },
      },
    );

    expect(bodies(xhr)).toEqual([
      {
        // Single quotes are doubled for the SQL string. A null string is null.
        'name::text': ["O''Brien", null, 'Paris'],
        'category::varchar': [null, "It''s", 'city'],
        // Other characters than digits, dot and minus are removed. A value which is not a number is null.
        'size::int': [1200, null, -7],
        'score::numeric': [-12.5, null, 13],
      },
    ]);
  });

  it('resolves with an error for a row with an inconsistent number of fields', async () => {
    const xhr = stubXhr();

    const responses = await csvUpload(csv('Paris,12\nBerlin,7,city'), {
      query: 'insert',
      fields: { name: 'text', size: 'int' },
    });

    expect(responses).toHaveLength(1);
    expect(responses[0]).toBeInstanceOf(Error);
    expect(responses[0].message).toBe(
      'Inconsistent number of fields. Expected 2, but got 3.',
    );
    expect(xhr).not.toHaveBeenCalled();
  });

  it('resolves with an error for a field type without a schema method', async () => {
    const xhr = stubXhr();

    const responses = await csvUpload(csv('Paris,12'), {
      query: 'insert',
      fields: { name: 'text', size: 'boolean' },
    });

    expect(responses).toHaveLength(1);
    expect(responses[0]).toBeInstanceOf(Error);
    expect(xhr).not.toHaveBeenCalled();
  });

  it.each([
    ['in order', false],
    ['at once if async', true],
  ])('posts the values in chunks %s', async (_, async) => {
    const xhr = stubXhr();

    const names = Array.from({ length: 20 }, (_, i) => `name ${i}`);

    const params = {
      query: 'insert',
      async,
      // A small chunk size in bytes for several requests.
      chunkSize: 100,
      fields: { name: 'text' },
    };

    const responses = await csvUpload(csv(names.join('\n')), params);

    expect(xhr.mock.calls.length).toBeGreaterThan(1);

    // The responses are in the order of the chunks.
    expect(responses).toEqual(xhr.mock.calls.map((_, i) => i + 1));

    // Every value is posted once, in the order of the rows.
    expect(bodies(xhr).flatMap((body) => body['name::text'])).toEqual(names);
  });

  it('assigns the default chunk size of 4MB', async () => {
    stubXhr();

    const params = { query: 'insert', fields: { name: 'text' } };

    await csvUpload(csv('Paris'), params);

    expect(params.chunkSize).toBe(4000000);
  });
});
