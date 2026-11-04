import { afterEach, describe, expect, it, vi } from 'vitest';
import { temporal } from '../../lib/utils/temporal.mjs';

// 2024-03-15T12:30:45Z
const timestamp = 1710505845;

describe('utils/temporal', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('is assigned to mapp.utils', () => {
    expect(mapp.utils.temporal).toBe(temporal);
  });

  describe('date', () => {
    it('formats a timestamp as ISO date', () => {
      expect(temporal.date(timestamp)).toBe('2024-03-15');
    });

    it.each([[undefined], [null], [0]])('returns undefined for %s', (value) => {
      expect(temporal.date(value)).toBeUndefined();
    });
  });

  describe('datetime', () => {
    it('formats a timestamp as ISO datetime without milliseconds', () => {
      expect(temporal.datetime(timestamp)).toBe('2024-03-15T12:30:45');
    });

    it('returns undefined without a timestamp', () => {
      expect(temporal.datetime()).toBeUndefined();
    });
  });

  describe('dateString', () => {
    it.each([
      [
        'the en-GB locale',
        { value: timestamp, locale: 'en-GB', options: { timeZone: 'UTC' } },
        '15/03/2024',
      ],
      [
        'the en-US locale',
        { value: timestamp, locale: 'en-US', options: { timeZone: 'UTC' } },
        '3/15/2024',
      ],
      [
        'a string timestamp',
        {
          value: `${timestamp}`,
          locale: 'en-GB',
          options: { timeZone: 'UTC' },
        },
        '15/03/2024',
      ],
      [
        'the newValue over the value',
        {
          value: 0,
          newValue: timestamp,
          locale: 'en-GB',
          options: { timeZone: 'UTC' },
        },
        '15/03/2024',
      ],
      [
        'date and time options',
        {
          value: timestamp,
          locale: 'en-GB',
          options: {
            timeZone: 'UTC',
            dateStyle: 'medium',
            timeStyle: 'short',
          },
        },
        '15 Mar 2024, 12:30',
      ],
    ])('formats with %s', (_, params, expected) => {
      expect(temporal.dateString(params)).toBe(expected);
    });

    it('assigns the navigator language as default locale', () => {
      const params = { value: timestamp };

      temporal.dateString(params);

      expect(params.locale).toBe(navigator.language);
    });

    // BUG: An invalid timestamp logs an error but Intl format(undefined) returns the current date.
    it.fails('does not format an invalid timestamp as the current date', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      vi.useFakeTimers({ now: new Date('2030-01-01T00:00:00Z') });

      expect(
        temporal.dateString({
          value: 'abc',
          locale: 'en-GB',
          options: { timeZone: 'UTC' },
        }),
      ).not.toBe('01/01/2030');
    });

    it('logs an error for an invalid timestamp', () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});

      temporal.dateString({ value: 'abc', locale: 'en-GB' });

      expect(error).toHaveBeenCalledWith(
        'unixTimestamp must be integer for Date conversion',
      );
    });
  });

  describe('dateToUnixEpoch', () => {
    it.each([
      ['an ISO datetime', '2024-03-15T12:30:45Z', timestamp],
      ['the epoch', '1970-01-01T00:00:00Z', 0],
      ['a datetime with milliseconds', '2024-03-15T12:30:45.999Z', timestamp],
    ])('converts %s', (_, dateStr, expected) => {
      expect(temporal.dateToUnixEpoch(dateStr)).toBe(expected);
    });

    it('converts the current date without a date string', () => {
      vi.useFakeTimers({ now: new Date('2024-03-15T12:30:45Z') });

      expect(temporal.dateToUnixEpoch()).toBe(timestamp);
    });

    it('logs an error and returns undefined for an invalid date string', () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(temporal.dateToUnixEpoch('not a date')).toBeUndefined();
      expect(error).toHaveBeenCalledWith('Invalid date string provided');
    });

    it('round trips with datetime', () => {
      expect(temporal.dateToUnixEpoch(`${temporal.datetime(timestamp)}Z`)).toBe(
        timestamp,
      );
    });
  });
});
