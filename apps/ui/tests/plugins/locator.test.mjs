import { describe, expect, it, vi } from 'vitest';
import plugins from '../../lib/plugins/_plugins.mjs';
import { locator } from '../../lib/plugins/locator.mjs';

/**
Returns a mapview stub with a mapButton element and a locate method.
*/
function mapview() {
  return {
    mapButton: document.createElement('div'),
    locale: { key: 'test' },
    locate: () => {},
  };
}

describe('plugins/locator', () => {
  it('is in the plugins collection', () => {
    expect(plugins.locator).toBe(locator);
  });

  it('does nothing without a mapButton', () => {
    expect(() => locator({}, {})).not.toThrow();
  });

  it('adds a button which toggles the mapview locate method', () => {
    const mv = mapview();

    const locate = vi.spyOn(mv, 'locate');

    locator({}, mv);

    const btn = mv.mapButton.querySelector('[data-id=locator]');

    expect(btn.title).toBe(mapp.dictionary.toolbar_current_location);

    btn.click();

    expect(btn.classList.contains('active')).toBe(true);
    expect(locate).toHaveBeenCalledTimes(1);

    btn.click();

    expect(btn.classList.contains('active')).toBe(false);
    expect(locate).toHaveBeenCalledTimes(2);
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3112: the click handler toggles the active class of the event target. A click on the icon span toggles the class on the span instead of the button.
  it.fails('toggles the button active class from a click on the icon', () => {
    const mv = mapview();

    vi.spyOn(mv, 'locate');

    locator({}, mv);

    const btn = mv.mapButton.querySelector('[data-id=locator]');

    btn.querySelector('span').click();

    expect(btn.classList.contains('active')).toBe(true);
  });
});
