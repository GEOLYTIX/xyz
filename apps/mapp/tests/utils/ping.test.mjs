import { describe, expect, it, vi } from 'vitest';
import ping from '../../lib/utils/ping.mjs';

/**
Stubs the mapp.utils.xhr method to resolve with the responses in order. The last response is repeated.
*/
function xhrResponses(...responses) {
  return vi
    .spyOn(mapp.utils, 'xhr')
    .mockImplementation(async () =>
      responses.length > 1 ? responses.shift() : responses[0],
    );
}

describe('utils/ping', () => {
  it('is assigned to mapp.utils', () => {
    expect(mapp.utils.ping).toBe(ping);
  });

  it('warns and does not request without a query', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const xhr = xhrResponses('ok');

    expect(ping({ queryparams: { table: 'table' } })).toBeUndefined();

    expect(warn).toHaveBeenCalledWith(
      'A query parameter must be defined for the ping utility.',
    );
    expect(xhr).not.toHaveBeenCalled();
  });

  it('requests the query template with the queryparams', async () => {
    const xhr = xhrResponses('ok');

    const params = {
      query: 'location_field_value',
      responseType: 'text',
      successCondition: 'ok',
      queryparams: {
        field: 'model_status',
        table: 'location_table',
      },
    };

    expect(await ping(params)).toBe('ok');

    expect(xhr).toHaveBeenCalledExactlyOnceWith(params);

    const url = new URL(params.url);

    expect(url.origin).toBe(mapp.host);
    expect(url.pathname).toBe('/api/query');
    expect(url.searchParams.get('template')).toBe('location_field_value');
    expect(url.searchParams.get('field')).toBe('model_status');
    expect(url.searchParams.get('table')).toBe('location_table');

    // The defaults are assigned to the params.
    expect(params.interval).toBe(4000);
    expect(params.host).toBe(mapp.host);
  });

  it('repeats the query at the interval until the response is the successCondition', async () => {
    const xhr = xhrResponses('pending', 'pending', 'ok');

    const callback = vi.fn();

    const params = {
      query: 'status',
      successCondition: 'ok',
      failCondition: 'failed',
      interval: 5,
      callback,
    };

    expect(await ping(params)).toBe('ok');

    expect(xhr).toHaveBeenCalledTimes(3);

    // The callback is called with each response and the params.
    expect(callback.mock.calls).toEqual([
      ['pending', params],
      ['pending', params],
      ['ok', params],
    ]);
  });

  it('resolves with the response which is the failCondition', async () => {
    const xhr = xhrResponses('pending', 'failed', 'ok');

    const response = await ping({
      query: 'status',
      successCondition: 'ok',
      failCondition: 'failed',
      interval: 5,
    });

    expect(response).toBe('failed');
    expect(xhr).toHaveBeenCalledTimes(2);
  });

  it('resolves with the first response if the callback is false', async () => {
    const xhr = xhrResponses('pending', 'ok');

    const response = await ping({
      query: 'status',
      successCondition: 'ok',
      interval: 5,
      callback: false,
    });

    expect(response).toBe('pending');
    expect(xhr).toHaveBeenCalledTimes(1);
  });

  it('rejects with an error response', async () => {
    const error = new Error('Network error');

    const xhr = xhrResponses('pending', error, 'ok');

    const callback = vi.fn();

    await expect(
      ping({ query: 'status', successCondition: 'ok', interval: 5, callback }),
    ).rejects.toBe(error);

    expect(xhr).toHaveBeenCalledTimes(2);

    // The callback is not called with the error.
    expect(callback).toHaveBeenCalledExactlyOnceWith(
      'pending',
      expect.any(Object),
    );
  });
});
