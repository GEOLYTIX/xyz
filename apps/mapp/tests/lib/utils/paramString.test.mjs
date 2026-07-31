/**
## /tests/lib/utils/paramString

@module /tests/lib/utils/paramString
*/

import { describe, expect, it } from 'vitest';

describe('utils/paramString', () => {
  it('returns an empty string without params', () => {
    expect(mapp.utils.paramString(null)).toEqual('');
  });

  // paramString emits params in object insertion order, so the key order here
  // is part of the assertion.
  it('urlencodes the params', () => {
    const params = {
      id: 1,
      name: 'test',
      age: '29 ',
      viewport: true,
      template: { in: { id: 1 } },
    };

    expect(mapp.utils.paramString(params)).toEqual(
      'id=1&name=test&age=29%20&viewport=true&template=%7B%22in%22%3A%7B%22id%22%3A1%7D%7D',
    );
  });

  it('excludes null, undefined and empty values', () => {
    const params = {
      age: '29 ',
      id: null,
      name: undefined,
      template: {},
      viewport: [],
    };

    expect(mapp.utils.paramString(params)).toEqual('age=29%20');
  });

  it('encodes ampersands and spaces', () => {
    const params = {
      region: 'Test & More',
      location: 'Place with Space',
    };

    expect(mapp.utils.paramString(params)).toEqual(
      'region=Test%20%26%20More&location=Place%20with%20Space',
    );
  });
});
