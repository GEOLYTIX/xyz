/**
The package test runs the packed @geolytix/mapp package in the browser, the way an application which installs the package uses it.

The package is installed into tests-package/node_modules with scripts/installPackage.mjs, from the tarball or from a registry. The test imports the package by its name, so the package.json `exports` are resolved like in an application.

The page is not an XYZ view. Openlayers is loaded as the `ol` global from the installed `ol` peer dependency before the package is imported, and the `mapp.host` is set to the testhost url after the import.
*/

import olUrl from 'ol/dist/ol.js?url';
import { beforeAll, describe, expect, inject, it, vi } from 'vitest';

let mapp;
let pkg;
let warn;

beforeAll(async () => {
  // The import warns if Openlayers is not loaded or below the current version.
  warn = vi.spyOn(console, 'warn');

  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = olUrl;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load ${olUrl}`));
    document.head.append(script);
  });

  ({ default: mapp } = await import('@geolytix/mapp'));
  ({ default: pkg } = await import('@geolytix/mapp/package.json'));

  await import('@geolytix/mapp/css');

  warn.mockRestore();
});

describe('@geolytix/mapp package', () => {
  it('exports the mapp global as default export', () => {
    expect(mapp).toBe(globalThis.mapp);
    expect(typeof mapp.Mapview).toBe('function');
  });

  it('has the package version without the prerelease suffix', () => {
    expect(mapp.version).toBe(pkg.version.split('-')[0]);
  });

  it('loads with the ol global of the peer dependency', () => {
    expect(ol.util.VERSION).toMatch(/^10\./);

    // The installed ol is the latest of the ^10.8.0 peer range, eg. v10.11.
    expect(warn).not.toHaveBeenCalledWith(expect.stringMatching(/^Openlayers/));
  });

  it('has no host outside of an XYZ view', () => {
    expect(mapp.host).toBe('');
  });

  it('applies the css export', () => {
    const element = document.createElement('div');
    element.className = 'ol-scale-line';
    document.body.append(element);

    expect(getComputedStyle(element).position).toBe('static');

    element.remove();
  });

  it('renders the layers of a locale from a remote XYZ host', async () => {
    mapp.host = inject('XYZ_HOST');

    const locale = await mapp.utils.xhr(
      `${mapp.host}/api/workspace/locale?locale=smoke&layers=true`,
    );

    expect(locale.key).toBe('smoke');

    const target = document.createElement('div');
    target.style.cssText = 'position:relative;width:800px;height:600px;';
    document.body.append(target);

    const mapview = await mapp.Mapview({
      target,
      locale,
      view: { lat: 48, lng: 5, z: 4 },
    });

    expect(mapview.host).toBe(mapp.host);

    await mapview.addLayer(mapview.locale.layers);
    await mapview.renderComplete;

    const ids = mapview.layers.locations.L.getSource()
      .getFeatures()
      .map((feature) => feature.get('id'))
      .sort();

    expect(ids).toEqual([1, 2, 3, 4]);

    clearTimeout(mapview.changeEndTimer);
    mapview.Map.setTarget(null);
    mapview.Map.dispose();
    target.remove();
  });
});
