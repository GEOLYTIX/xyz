import { describe, expect, it } from 'vitest';
import { addLayers, createMapview, getLocale } from '../helpers.mjs';

/**
Creates a smoke mapview with an attribution. The osm layer has an attribution and isn't displayed.
*/
async function mapview(attribution) {
  const locale = await getLocale('smoke');

  const view = await createMapview(
    locale,
    { lat: 48, lng: 5, z: 4 },
    { attribution },
  );

  await addLayers(view);

  return view;
}

function links(view) {
  return [...view.attribution.linksTarget.querySelectorAll('a')].map((a) => [
    a.textContent.trim(),
    a.getAttribute('href'),
  ]);
}

describe('mapview attribution', () => {
  it('appends the attribution with the logo to the map target', async () => {
    const logo = mapp.utils.html.node`<img class="logo">`;

    const view = await mapview({ logo });

    expect(view.attribution.target).toBe(view.target);
    expect(view.attribution.node.parentElement).toBe(view.target);
    expect(view.attribution.node.classList).toContain('map-attribution');
    expect(view.attribution.node.querySelector('.logo')).toBe(logo);
  });

  it('lists the attribution links', async () => {
    const view = await mapview({ links: { XYZ: 'https://geolytix.com' } });

    expect(links(view)).toEqual([['XYZ', 'https://geolytix.com']]);
  });

  it('adds the attribution of displayed layers', async () => {
    const view = await mapview({ links: { XYZ: 'https://geolytix.com' } });

    // The osm layer is displayed without show(), which would request tiles.
    view.layers.osm.display = true;
    view.attribution.check();

    expect(links(view)).toEqual([
      ['XYZ', 'https://geolytix.com'],
      ['© OpenStreetMap', 'http://www.openstreetmap.org/copyright'],
    ]);

    // The layer hide() checks the attribution.
    view.layers.osm.hide();

    expect(links(view)).toEqual([['XYZ', 'https://geolytix.com']]);
  });

  it('does not change the attribution links of the mapview', async () => {
    const view = await mapview({});

    view.layers.osm.display = true;
    view.attribution.check();

    expect(view.attribution.links).toEqual({});
  });

  it('appends the attribution to a target element', async () => {
    const target = document.createElement('div');

    document.body.append(target);

    const view = await mapview({ target });

    expect(view.attribution.node.parentElement).toBe(target);

    target.remove();
  });

  it('has no attribution without an attribution object', async () => {
    const view = await mapview();

    expect(view.attribution).toBeUndefined();
    expect(view.target.querySelector('.map-attribution')).toBeNull();
  });
});
