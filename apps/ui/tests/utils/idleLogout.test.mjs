import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { idleLogout } = mapp.ui.utils;

// The idle duration in seconds.
const IDLE = 600;

let xhr;

/**
@function destroyRequests

@description
Returns the requests to destroy the cookie. The interface is locked with a destroy request.

@returns {Array} The xhr calls with a destroy cookie url.
*/
function destroyRequests() {
  return xhr.mock.calls.filter(([params]) => params.url.includes('destroy'));
}

beforeEach(() => {
  vi.useFakeTimers();

  // The cookie is renewed. The destroy request fails, a successful request would reload the test page.
  xhr = vi
    .spyOn(mapp.utils, 'xhr')
    .mockImplementation(async (params) =>
      params.url.includes('destroy') ? new Error('destroy') : {},
    );
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  window.onkeydown = null;
});

describe('ui/utils/idleLogout', () => {
  it('locks the interface after the idle duration', () => {
    idleLogout({ host: '', idle: IDLE });

    vi.advanceTimersByTime((IDLE - 1) * 1000);

    expect(destroyRequests()).toHaveLength(0);

    vi.advanceTimersByTime(1000);

    expect(destroyRequests()).toHaveLength(1);
  });

  it('resets the timer on the keydown of a non-character key', () => {
    idleLogout({ host: '', idle: IDLE });

    vi.advanceTimersByTime((IDLE - 100) * 1000);

    // The deprecated keypress event is not fired for an arrow key.
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));

    // The idle duration since the idleLogout call has passed.
    vi.advanceTimersByTime((IDLE - 1) * 1000);

    expect(destroyRequests()).toHaveLength(0);

    // The idle duration since the keydown has passed.
    vi.advanceTimersByTime(1000);

    expect(destroyRequests()).toHaveLength(1);
  });

  it('does not replace a window.onkeydown handler', () => {
    const onkeydown = vi.fn();

    window.onkeydown = onkeydown;

    idleLogout({ host: '', idle: IDLE });

    expect(window.onkeydown).toBe(onkeydown);

    vi.advanceTimersByTime((IDLE - 100) * 1000);

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));

    // Both the handler and the idleLogout listener are called.
    expect(onkeydown).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime((IDLE - 1) * 1000);

    expect(destroyRequests()).toHaveLength(0);
  });
});
