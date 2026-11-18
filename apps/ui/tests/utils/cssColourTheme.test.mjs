import { afterEach, describe, expect, it } from 'vitest';
import * as cssColour from '../../lib/utils/cssColourTheme.mjs';

const { setTheme, themes } = mapp.ui.utils.cssColour;

const root = document.documentElement;

afterEach(() => {
  // Removes the properties of the current theme.
  setTheme({});
});

describe('ui/utils/cssColourTheme', () => {
  it('is assigned to mapp.ui.utils.cssColour', () => {
    expect(mapp.ui.utils.cssColour.setTheme).toBe(cssColour.setTheme);
    expect(mapp.ui.utils.cssColour.themes).toBe(cssColour.themes);
  });

  it('sets the colour properties of a theme on the root', () => {
    setTheme(themes.dark);

    for (const [key, value] of Object.entries(themes.dark)) {
      expect(root.style.getPropertyValue(`--color-${key}`)).toBe(value);
    }

    // The computed property of the root is the theme colour.
    expect(getComputedStyle(root).getPropertyValue('--color-base').trim()).toBe(
      '#222222',
    );
  });

  it('removes the properties of the previous theme', () => {
    setTheme(themes.dark);

    setTheme({ primary: '#ff0000' });

    expect(root.style.getPropertyValue('--color-primary')).toBe('#ff0000');
    expect(root.style.getPropertyValue('--color-base')).toBe('');
    expect(root.style.getPropertyValue('--color-font')).toBe('');
  });
});
