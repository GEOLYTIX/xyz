import { describe, expect, it, vi } from 'vitest';
import plugins from '../../lib/plugins/_plugins.mjs';
import { link_button } from '../../lib/plugins/link_button.mjs';

/**
Returns a mapview stub with a mapButton element and a locale key.
*/
function mapview() {
  return { mapButton: document.createElement('div'), locale: { key: 'test' } };
}

describe('plugins/link_button', () => {
  it('is in the plugins collection', () => {
    expect(plugins.link_button).toBe(link_button);
  });

  it('does nothing without a mapButton', () => {
    expect(() =>
      link_button({ href: '/foo', icon_name: 'grid_view' }, { locale: {} }),
    ).not.toThrow();
  });

  it('does nothing without a link_button config', () => {
    const mv = mapview();

    link_button(undefined, mv);

    expect(mv.mapButton.children).toHaveLength(0);
  });

  it('adds a link from a link_button object', () => {
    const mv = mapview();

    link_button(
      {
        href: '/url/url',
        title: 'TITLE HERE',
        target: '_self',
        css_class: 'custom',
        css_style: 'color: blue;',
        icon_name: 'grid_view',
      },
      mv,
    );

    const link = mv.mapButton.querySelector('a');

    // The href is asserted, the link is never followed.
    expect(link.getAttribute('href')).toBe('/url/url');
    expect(link.title).toBe('TITLE HERE');
    expect(link.target).toBe('_self');

    const icon = link.querySelector('span');

    expect(icon.textContent).toBe('grid_view');
    expect(icon.className).toBe('notranslate material-symbols-outlined custom');
    expect(icon.style.color).toBe('blue');
  });

  it('adds a link for each object in a link_button array', () => {
    const mv = mapview();

    link_button(
      [
        { href: '/foo', icon_name: 'grid_view' },
        { href: '/bar', icon_name: 'map' },
      ],
      mv,
    );

    const hrefs = [...mv.mapButton.querySelectorAll('a')].map((a) =>
      a.getAttribute('href'),
    );

    expect(hrefs).toEqual(['/foo', '/bar']);
  });

  it('defaults the title from the dictionary', () => {
    const mv = mapview();

    link_button({ href: '/foo', icon_name: 'grid_view' }, mv);

    expect(mv.mapButton.querySelector('a').title).toBe(mapp.dictionary.link);
  });

  it('appends the locale key to the href', () => {
    const mv = mapview();

    link_button({ href: '/foo', icon_name: 'grid_view', locale: true }, mv);

    expect(mv.mapButton.querySelector('a').getAttribute('href')).toBe(
      '/foo?locale=test',
    );
  });

  it('warns and skips a link without a href', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const mv = mapview();

    link_button([{ icon_name: 'grid_view' }, null], mv);

    expect(warn).toHaveBeenCalledTimes(2);
    expect(mv.mapButton.children).toHaveLength(0);
  });

  it('warns and skips a link without an icon_name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const mv = mapview();

    link_button({ href: '/foo' }, mv);

    expect(warn).toHaveBeenCalledTimes(1);
    expect(mv.mapButton.children).toHaveLength(0);
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3115: the method returns early without an icon_name, so the open_in_new default for the icon_name is never assigned. The second example in the JSDoc renders nothing.
  it.fails('renders the second JSDoc example with the default icon', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    const mv = mapview();

    link_button({ href: '/foo', title: 'Foo', locale: true }, mv);

    expect(mv.mapButton.querySelector('a span').textContent).toBe(
      'open_in_new',
    );
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3115: the JSDoc documents _blank as the default link.target, but the default is never assigned. The link opens in the same tab.
  it.fails('opens the link in a new tab by default', () => {
    const mv = mapview();

    link_button({ href: '/foo', icon_name: 'grid_view' }, mv);

    expect(mv.mapButton.querySelector('a').target).toBe('_blank');
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3115: the locale is appended with a ? to a href which already has a query string.
  it.fails('appends the locale key to a href with a query string', () => {
    const mv = mapview();

    link_button(
      { href: '/foo?bar=1', icon_name: 'grid_view', locale: true },
      mv,
    );

    expect(mv.mapButton.querySelector('a').getAttribute('href')).toBe(
      '/foo?bar=1&locale=test',
    );
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3115: the locale is appended to the href of the link config. The locale is appended again if the plugin method is called again with the same config, eg. for a second mapview.
  it.fails('does not change the href of the link config', () => {
    const config = { href: '/foo', icon_name: 'grid_view', locale: true };

    link_button(config, mapview());

    const mv = mapview();

    link_button(config, mv);

    expect(config.href).toBe('/foo');
    expect(mv.mapButton.querySelector('a').getAttribute('href')).toBe(
      '/foo?locale=test',
    );
  });
});
