import { afterEach, describe, expect, it } from 'vitest';
import {
  formatNumericValue,
  unformatStringValue,
} from '../../lib/utils/numericFormatter.mjs';

describe('utils/numericFormatter', () => {
  const language = mapp.language;

  afterEach(() => {
    mapp.language = language;
  });

  it('is assigned to mapp.utils', () => {
    expect(mapp.utils.formatNumericValue).toBe(formatNumericValue);
    expect(mapp.utils.unformatStringValue).toBe(unformatStringValue);
  });

  describe('formatNumericValue', () => {
    it.each([
      ['a float', { value: 1234.567 }, '1,234.57'],
      ['zero', { value: 0 }, '0'],
      ['a numeric string', { value: '42.5' }, '42.5'],
      ['an integer type', { value: 1234.567, type: 'integer' }, '1,235'],
      ['a round param', { value: 1.23456, round: 3 }, '1.235'],
      [
        'prefix and suffix',
        { value: 5, prefix: '£', suffix: ' per day' },
        '£5 per day',
      ],
      ['the newValue over the value', { value: 1, newValue: 2 }, '2'],
      [
        'a German locale',
        { value: 1234.5, formatterParams: { locale: 'de-DE' } },
        '1.234,5',
      ],
      [
        'formatter options',
        {
          value: 0.5,
          formatterParams: { locale: 'en-GB', options: { style: 'percent' } },
        },
        '50%',
      ],
      [
        'null formatterParams',
        { value: 1234.567, formatterParams: null },
        '1234.567',
      ],
      ['a value which is not a number', { value: 'abc', prefix: '#' }, '#'],
      ['a null value', { value: null }, ''],
    ])('formats %s', (_, params, expected) => {
      mapp.language = 'en-GB';

      expect(formatNumericValue(params)).toBe(expected);
      expect(params.stringValue).toBe(expected);
    });

    it('assigns the mapp.language as default locale', () => {
      mapp.language = 'de-DE';

      const params = { value: 1234.5 };

      expect(formatNumericValue(params)).toBe('1.234,5');
      expect(params.formatterParams.locale).toBe('de-DE');
    });

    it('appends the lastCharacter', () => {
      const params = {
        value: 1,
        lastCharacter: '.',
        formatterParams: { locale: 'en-GB' },
      };

      expect(formatNumericValue(params)).toBe('1.');
    });

    // https://github.com/GEOLYTIX/xyz/issues/3038: params.round || … treated round: 0 as unset and formatted 2 fraction digits.
    it('formats a round param of 0 without fraction digits', () => {
      expect(
        formatNumericValue({
          value: 1.6,
          round: 0,
          formatterParams: { locale: 'en-GB' },
        }),
      ).toBe('2');
    });
  });

  describe('unformatStringValue', () => {
    it.each([
      ['an empty string', { stringValue: '' }, null],
      ['undefined', {}, null],
      ['a number string without a locale', { stringValue: '12.5' }, 12.5],
      [
        'an empty string after removing the prefix',
        { stringValue: '£', prefix: '£' },
        null,
      ],
      [
        'prefix and suffix',
        {
          stringValue: '£1,234.5 per day',
          prefix: '£',
          suffix: ' per day',
          formatterParams: { locale: 'en-GB' },
        },
        1234.5,
      ],
      [
        'a German locale',
        { stringValue: '1.234,5', formatterParams: { locale: 'de-DE' } },
        1234.5,
      ],
      [
        'a negative value',
        { stringValue: '-1,000', formatterParams: { locale: 'en-GB' } },
        -1000,
      ],
    ])('unformats %s', (_, params, expected) => {
      expect(unformatStringValue(params)).toBe(expected);
    });

    it.each([
      ['a trailing decimal separator', '12.', '.'],
      ['a trailing 0 fraction', '12.0', '.0'],
    ])('preserves %s as lastCharacter', (_, stringValue, lastCharacter) => {
      const params = { stringValue, formatterParams: { locale: 'en-GB' } };

      expect(unformatStringValue(params)).toBe(12);
      expect(params.lastCharacter).toBe(lastCharacter);
    });

    it('deletes a previous lastCharacter', () => {
      const params = {
        stringValue: '12.5',
        lastCharacter: '.',
        formatterParams: { locale: 'en-GB' },
      };

      unformatStringValue(params);

      expect(params.lastCharacter).toBeUndefined();
    });

    it('round trips a formatted value', () => {
      const params = {
        value: 9876.54,
        prefix: '$',
        formatterParams: { locale: 'de-DE' },
      };

      formatNumericValue(params);

      expect(unformatStringValue(params)).toBe(9876.54);
    });
  });
});
