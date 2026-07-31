/**
## /tests/lib/utils/gazetteer

The codi suite replaced the global XMLHttpRequest with a class of no-ops to stop
the search reaching the network. The request is issued through
`mapp.utils.xhr`, so spying on that is both narrower and closer to the
behaviour under test.

That suite also asserted `typeof dataset.onLoad === 'function'`. The module no
longer assigns an onLoad handler -- the response is handled in a `.then()` on
the xhr promise -- so the assertion has been stale for as long as the codi
tests have been out of CI. It is not carried over. The datasets carry an
`input` because the response handler reads `dataset.input.value` to check
whether the search box was cleared before the response arrived.

@module /tests/lib/utils/gazetteer
*/

import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
@function gazetteerConfig

@description
Two datasets against the same host, each resolving a different layer.

@returns {Object} A gazetteer configuration.
*/
const gazetteerConfig = () => ({
  datasets: [
    {
      input: { value: '' },
      label: 'Store Name',
      layer: 'layer_3',
      mapview: {
        host: 'localhost:3000',
        layers: {
          layer_3: { key: 'layer_3', qID: 'id' },
        },
        locale: { key: 'test' },
      },
      no_result: null,
      qterm: 'store',
      table: 'fake_table',
    },
    {
      input: { value: '' },
      label: 'Store Name Also',
      layer: 'layer_2',
      mapview: {
        host: 'localhost:3000',
        layers: {
          layer_2: { key: 'layer_2', qID: 'id' },
        },
        locale: { key: 'test' },
      },
      no_result: null,
      qterm: 'store',
      table: 'fake_table',
    },
  ],
  leading_wildcard: true,
  limit: 5,
});

describe('utils/gazetteer', () => {
  let xhr;

  beforeEach(() => {
    xhr = vi.spyOn(mapp.utils, 'xhr').mockResolvedValue([]);
  });

  it('builds a query url for every dataset', () => {
    const gazetteer = gazetteerConfig();

    mapp.utils.gazetteer.datasets('test', gazetteer);

    for (const dataset of gazetteer.datasets) {
      expect(dataset.url).toContain('localhost:3000/api/query?');
      expect(dataset.url).toContain('qterm=store');
      expect(dataset.url).toContain('table=fake_table');
    }
  });

  it('applies the leading wildcard to the search term', () => {
    const gazetteer = gazetteerConfig();

    mapp.utils.gazetteer.datasets('test', gazetteer);

    expect(gazetteer.datasets[0].url).toContain('term=*test*');
  });

  it('caches and debounces each dataset request', () => {
    const gazetteer = gazetteerConfig();

    mapp.utils.gazetteer.datasets('test', gazetteer);

    const [dataset] = gazetteer.datasets;

    expect(dataset.cache).toBe(true);

    // Debounced per layer and field, so two fields of one layer can be
    // searched concurrently.
    expect(dataset.debounce).toEqual('layer_3store');
  });

  it('requests each dataset', () => {
    mapp.utils.gazetteer.datasets('test', gazetteerConfig());

    expect(xhr).toHaveBeenCalledTimes(2);
  });

  it('merges the gazetteer config into each dataset', () => {
    const gazetteer = gazetteerConfig();

    mapp.utils.gazetteer.datasets('test', gazetteer);

    for (const dataset of gazetteer.datasets) {
      expect(dataset.limit).toEqual(5);
      expect(dataset.leading_wildcard).toBe(true);
    }
  });

  it('does not search without a qterm or datasets', () => {
    mapp.utils.gazetteer.datasets('test', {});

    expect(xhr).not.toHaveBeenCalled();
  });

  it('warns and skips a dataset whose layer is not on the mapview', () => {
    const warnings = [];
    vi.spyOn(console, 'warn').mockImplementation((message) =>
      warnings.push(message),
    );

    mapp.utils.gazetteer.datasets('test', {
      datasets: [
        {
          layer: 'missing_layer',
          mapview: { host: '', layers: {}, locale: { key: 'test' } },
          qterm: 'store',
        },
      ],
    });

    expect(warnings).toContain('No layer definition for gazetteer search.');
    expect(xhr).not.toHaveBeenCalled();
  });
});
