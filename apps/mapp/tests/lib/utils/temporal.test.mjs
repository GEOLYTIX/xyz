/**
## /tests/lib/utils/temporal

@module /tests/lib/utils/temporal
*/

import { describe, expect, it } from 'vitest';
import { mockConsole } from '../../scaffold.mjs';

const mockErrors = mockConsole('error');

describe('utils/temporal', () => {
  // dateString goes through Intl.DateTimeFormat, so without an explicit
  // timeZone the result follows the machine running the test. The codi version
  // expected 18:00, which only holds in a UTC+2 environment. Pinning the zone
  // makes the assertion hold everywhere.
  it('formats an epoch as an en-GB date string', () => {
    const date = mapp.utils.temporal.dateString({
      locale: 'en-GB',
      options: {
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        month: 'long',
        timeZone: 'UTC',
        year: 'numeric',
      },
      value: 1702483200,
    });

    expect(date).toEqual('13 December 2023 at 16:00');
  });

  it.each([
    ['2024-01-01 GMT', 1704067200],
    ['01/01/2024 GMT', 1704067200],
    ['January 1, 2024 GMT', 1704067200],
    ['2024.01.01 GMT', 1704067200],
    ['1 Jan 2024 GMT', 1704067200],
  ])('converts %s to a unix epoch', (input, expected) => {
    expect(mapp.utils.temporal.dateToUnixEpoch(input)).toEqual(expected);
  });

  it.each([
    ['not a date'],
    ['2024-13-01'],
    ['2024-01-32'],
    ['01/32/2024'],
    ['2024/13/01'],
    [{}],
    [[]],
    ['   '],
    ['Tomorrow'],
  ])('logs an error for the invalid date %o', (invalidDate) => {
    const before = mockErrors.length;

    mapp.utils.temporal.dateToUnixEpoch(invalidDate);

    expect(mockErrors.slice(before)).toEqual(['Invalid date string provided']);
  });

  it('formats an epoch as a datetime', () => {
    expect(mapp.utils.temporal.datetime(1704067200)).toEqual(
      '2024-01-01T00:00:00',
    );
  });

  it('formats an epoch as a date', () => {
    expect(mapp.utils.temporal.date(1704067200)).toEqual('2024-01-01');
  });
});
