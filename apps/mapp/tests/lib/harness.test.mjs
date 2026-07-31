/**
## /tests/lib/harness

Guards the `lib` project's test harness itself.

If these fail, every other test in the project is suspect: either the mapp
namespace did not assemble, or the OpenLayers stub has drifted from the pinned
devDependency, or a network stub has been removed.

@module /tests/lib/harness
*/

import { describe, expect, it } from 'vitest';
import { OL_VERSION } from './stubs/ol.mjs';

describe('lib test harness', () => {
  it('assembles the mapp namespace', () => {
    expect(mapp).toBeDefined();

    // The property list the codi tests/lib/mapp.test.mjs suite asserted.
    for (const key of [
      'dictionaries',
      'dictionary',
      'hash',
      'hooks',
      'host',
      'language',
      'layer',
      'location',
      'Mapview',
      'plugins',
      'utils',
      'version',
    ]) {
      expect(mapp).toHaveProperty(key);
    }
  });

  it('assembles the ui namespace onto mapp', () => {
    expect(mapp.ui).toBe(globalThis.ui);

    for (const key of [
      'Dataview',
      'elements',
      'Gazetteer',
      'layers',
      'locations',
      'Tabview',
      'utils',
    ]) {
      expect(mapp.ui).toHaveProperty(key);
    }
  });

  it('reports a mapp version matching the package', async () => {
    // The workspace root package.json carries the version for the whole
    // monorepo; the mapp package itself declares none.
    const { version } = await import('../../../../package.json');

    // lib/mapp.mjs carries the version as a literal. A mismatch means the
    // library is reporting a release it is not part of.
    expect(mapp.version).toEqual(version.replace(/^v/, ''));
  });

  it('stubs OpenLayers at the version lib/mapp.mjs expects', async () => {
    expect(ol.util.VERSION).toEqual(OL_VERSION);

    // lib/mapp.mjs warns when the loaded version is below ol_current. Read the
    // literal back out of the source so the stub cannot drift silently.
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');

    const source = readFileSync(
      // Resolved from this module rather than the working directory, which
      // differs between a turbo run and a direct vitest invocation.
      //
      // `import.meta.dirname` rather than `new URL(..., import.meta.url)`:
      // happy-dom replaces the global URL with an implementation that ignores
      // a file: base and resolves against the document instead.
      join(import.meta.dirname, '../../lib/mapp.mjs'),
      'utf8',
    );
    const olCurrent = Number.parseFloat(
      source.match(/const ol_current = ([\d.]+)/)[1],
    );

    expect(Number.parseFloat(OL_VERSION)).toBeGreaterThanOrEqual(olCurrent);
  });

  it('refuses network access through esmImport', () => {
    expect(() => mapp.utils.esmImport('simple-statistics@7.8.8')).toThrow(
      /called in a test/,
    );
  });

  it('refuses network access through scriptElement', () => {
    expect(() => mapp.utils.scriptElement('https://cdn.example/ol.js')).toThrow(
      /called in a test/,
    );
  });

  it('provides a DOM', () => {
    const node = document.createElement('div');
    node.textContent = 'mapp';

    expect(node).toBeInstanceOf(HTMLElement);
    expect(node.textContent).toEqual('mapp');
  });
});
