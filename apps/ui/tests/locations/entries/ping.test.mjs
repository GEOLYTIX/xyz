import { describe, expect, it, vi } from 'vitest';
import { stubEntry } from './_helpers.mjs';

const { ping } = mapp.ui.locations.entries;

// A failed ping request is not handled by the ping entry, see https://github.com/GEOLYTIX/xyz/issues/3098. The rejection would be unhandled in a test, so the tests only use resolved ping requests.
describe('ui/locations/entries/ping', () => {
  it('pings the query and writes the response to the textarea', async () => {
    const xhr = vi.spyOn(mapp.utils, 'xhr').mockResolvedValue('done');

    const { entry } = stubEntry({
      query: 'status',
      queryparams: { field: 'status' },
      successCondition: 'done',
    });

    const textarea = ping(entry);

    expect(textarea).toBe(entry.textarea);
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea.classList).toContain('val');

    await vi.waitFor(() => expect(textarea.value).toBe('done'));

    const url = new URL(xhr.mock.calls[0][0].url);

    expect(url.searchParams.get('template')).toBe('status');
    expect(url.searchParams.get('field')).toBe('status');
  });

  it('returns the textarea without another ping', () => {
    const xhr = vi.spyOn(mapp.utils, 'xhr').mockResolvedValue('done');

    const { entry } = stubEntry({ query: 'status', successCondition: 'done' });

    const textarea = ping(entry);

    expect(ping(entry)).toBe(textarea);
    expect(xhr).toHaveBeenCalledTimes(1);
  });

  it('keeps a custom callback', async () => {
    vi.spyOn(mapp.utils, 'xhr').mockResolvedValue('done');

    const callback = vi.fn();

    const { entry } = stubEntry({
      query: 'status',
      successCondition: 'done',
      callback,
    });

    ping(entry);

    await vi.waitFor(() =>
      expect(callback).toHaveBeenCalledWith('done', entry),
    );

    expect(entry.textarea.value).toBe('');
  });

  it('stops the ping when the location is removed', async () => {
    vi.useFakeTimers();

    const xhr = vi.spyOn(mapp.utils, 'xhr').mockResolvedValue('pending');

    const { entry, location } = stubEntry({
      query: 'status',
      successCondition: 'done',
      interval: 1000,
    });

    ping(entry);

    await vi.advanceTimersByTimeAsync(1000);

    expect(xhr).toHaveBeenCalledTimes(2);
    expect(entry.textarea.value).toBe('pending');

    expect(location.removeCallbacks).toHaveLength(1);

    location.removeCallbacks[0]();

    expect(entry.callback).toBe(false);

    await vi.advanceTimersByTimeAsync(5000);

    // The pending request resolves the ping without another request.
    expect(xhr).toHaveBeenCalledTimes(3);

    vi.useRealTimers();
  });
});
