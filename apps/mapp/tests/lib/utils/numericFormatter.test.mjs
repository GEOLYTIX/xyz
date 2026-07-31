/**
## /tests/lib/utils/numericFormatter

`formatNumericValue` mutates the params object it is given: it stores the
`localeString`, the resolved `formatterParams.options` and the `stringValue`
that `unformatStringValue` later reads back.

Each test therefore builds its own params object. The codi suite shared one
object across every assertion, which made each test depend on the ones before
it.

@module /tests/lib/utils/numericFormatter
*/

import { describe, expect, it } from 'vitest';

/**
@function params

@description
Builds a fresh params object for the given locale.

@param {string} locale The formatter locale.

@returns {Object} Params for formatNumericValue.
*/
const params = (locale) => ({
  formatterParams: { locale },
  prefix: '$',
  value: 654321.987,
});

describe('utils/numericFormatter', () => {
  it.each([
    ['en-UK', '$654,321.99'],
    ['DE', '$654.321,99'],

    // Intl groups Polish thousands with a non breaking space, not a plain one.
    ['PL', '$654\u00A0321,99'],
    ['RUB', '$654,321.99'],
  ])('formats a value for the %s locale', (locale, expected) => {
    expect(mapp.utils.formatNumericValue(params(locale))).toEqual(expected);
  });

  it.each([['en-UK'], ['DE'], ['PL'], ['RUB']])(
    'unformats a %s locale string back to its numeric value',
    (locale) => {
      const formatted = params(locale);

      mapp.utils.formatNumericValue(formatted);

      expect(mapp.utils.unformatStringValue(formatted)).toEqual(654321.99);
    },
  );

  it('returns null when there is no string value to unformat', () => {
    expect(mapp.utils.unformatStringValue({})).toBeNull();
  });

  it('formats an integer type without fraction digits', () => {
    const formatted = {
      formatterParams: { locale: 'en-GB' },
      type: 'integer',
      value: 654321.987,
    };

    expect(mapp.utils.formatNumericValue(formatted)).toEqual('654,322');
  });

  it('returns the raw number when formatterParams are null', () => {
    const formatted = {
      formatterParams: null,
      value: 654321.987,
    };

    expect(mapp.utils.formatNumericValue(formatted)).toEqual('654321.987');
  });
});
