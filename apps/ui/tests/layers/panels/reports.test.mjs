import { describe, expect, it, vi } from 'vitest';
import { mapTarget } from '../../elements/_helpers.mjs';
import { groceryMapview, layersListview } from '../../helpers.mjs';

/**
Returns the retail_points layer of a grocery mapview with the reports config.
*/
async function reportsLayer(reports) {
  const mapview = await groceryMapview();

  const layer = mapview.layers.retail_points;

  layer.reports = reports;

  return layer;
}

describe('ui/layers/panels/reports', () => {
  it('creates a drawer with a link for each report', async () => {
    const { layer } = await layersListview((layers) => {
      layers.retail_points.reports = {
        store_report: { template: 'store_report', label: 'Store report' },
        website: { url: 'https://example.com' },
        // Flags are not reports.
        popout: false,
      };
    });

    const drawer = layer.view.querySelector('[data-id=reports-drawer]');

    expect(drawer.querySelector('.header h3').textContent).toBe('Reports');

    const links = [...drawer.querySelectorAll('.content a')];

    expect(links.map((a) => a.textContent.trim().replace(/\s+/g, ' '))).toEqual(
      ['description Store report', 'open_in_new website'],
    );

    const params = Object.fromEntries(new URL(links[0].href).searchParams);

    expect(params).toMatchObject({
      template: 'store_report',
      locale: 'grocery',
      layer: 'retail_points',
    });

    expect(links[1].getAttribute('href')).toBe('https://example.com');

    expect(layer.reports.website).toMatchObject({ key: 'website', layer });
  });

  it('creates a card for drawer false with the classList', async () => {
    const layer = await reportsLayer({
      drawer: false,
      report: { template: 'store_report' },
    });

    const card = mapp.ui.layers.panels.reports(layer);

    expect(card.classList).toContain('drawer');
    expect(card.classList).not.toContain('expandable');
    expect(card.querySelectorAll('a')).toHaveLength(1);
  });

  it('creates a button to show the reports in a dialog', async () => {
    const target = mapTarget();

    const layer = await reportsLayer({
      dialog: true,
      report: { template: 'store_report' },
    });

    const btn = mapp.ui.layers.panels.reports(layer);

    expect(layer.reports.dialog).toMatchObject({
      btn_label: 'Reports',
      title: 'Reports',
      icon: 'summarize',
    });

    btn.click();

    const dialog = target.querySelector('dialog');

    expect(dialog.querySelector('h1').textContent).toBe('Reports');
    expect(dialog.querySelectorAll('.content a')).toHaveLength(1);
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3145: every layer.reports property which is not a boolean is taken for a report. A dialog config object is passed to the reportLink element, which warns about a missing url.
  it.fails('doesn’t take the dialog config for a report', async () => {
    mapTarget();

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const layer = await reportsLayer({
      dialog: { title: 'Store reports' },
      report: { template: 'store_report' },
    });

    mapp.ui.layers.panels.reports(layer);

    expect(warn).not.toHaveBeenCalled();
    expect(layer.reports.dialog.key).toBeUndefined();
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3145: a classList string is taken for a report. The assignment of the key property to the string throws a TypeError.
  it.fails('adds the reports.classList to the drawer', async () => {
    const layer = await reportsLayer({
      classList: 'custom-reports',
      report: { template: 'store_report' },
    });

    const drawer = mapp.ui.layers.panels.reports(layer);

    expect(drawer.classList).toContain('custom-reports');
  });
});
