import { describe, expect, it, vi } from 'vitest';

const { reportLink } = mapp.ui.elements;

describe('ui/elements/reportLink', () => {
  it('creates a link for a url', () => {
    const link = reportLink({ url: 'https://example.com/report' });

    expect(link.tagName).toBe('A');
    expect(link.dataset.id).toBe('report-link');
    expect(link.getAttribute('href')).toBe('https://example.com/report');
    expect(link.target).toBe('_blank');
    expect(link.classList).toContain('link-with-img');

    const [icon, label] = link.querySelectorAll('span');

    expect(icon.textContent).toBe('open_in_new');
    expect(icon.classList).toContain('material-symbols-outlined');
    expect(label.textContent).toBe(mapp.dictionary.link);
  });

  it('assigns the label, icon and target params', () => {
    const link = reportLink({
      data_id: 'custom-link',
      url: 'https://example.com',
      title: 'Example',
      icon: 'star',
      target: '_self',
      link_class: 'custom',
    });

    expect(link.dataset.id).toBe('custom-link');
    expect(link.target).toBe('_self');
    expect(link.classList).toContain('custom');
    expect(link.querySelector('span').textContent).toBe('star');
    expect(link.querySelectorAll('span')[1].textContent).toBe('Example');
  });

  it('creates a view link for a location report', () => {
    const location = {
      id: 7,
      layer: { key: 'retail_points', mapview: { locale: { key: 'grocery' } } },
    };

    const link = reportLink({
      location,
      report: { template: 'store_report', label: 'Store report' },
      params: { extra: 'value' },
    });

    const url = new URL(link.href);

    expect(`${url.origin}${url.pathname}`).toBe(
      new URL(`${mapp.host}/view`, globalThis.location.href).href,
    );

    expect(Object.fromEntries(url.searchParams)).toMatchObject({
      template: 'store_report',
      locale: 'grocery',
      layer: 'retail_points',
      id: '7',
      extra: 'value',
    });

    expect(link.querySelector('span').textContent).toBe('description');
    expect(link.querySelectorAll('span')[1].textContent).toBe('Store report');
  });

  it('creates a view link for a layer report', () => {
    const link = reportLink({
      layer: { key: 'retail_points', mapview: { locale: { key: 'grocery' } } },
      report: { template: 'layer_report' },
    });

    const params = Object.fromEntries(new URL(link.href).searchParams);

    expect(params).toMatchObject({
      template: 'layer_report',
      locale: 'grocery',
      layer: 'retail_points',
    });
    expect(params.id).toBeUndefined();
  });

  it('warns and returns undefined without a url or report', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(reportLink({ data_id: 'empty' })).toBeUndefined();

    expect(warn).toHaveBeenCalledWith(
      'ReportLink empty is missing url or report definition.',
    );
  });

  it('opens the report in a dialog with an iframe', () => {
    const params = {
      report: { template: 'store_report', label: 'Report', dialog: true },
    };

    const link = reportLink(params);

    expect(link.querySelector('span').textContent).toBe('description');

    link.click();

    // The dialog is modal without a target.
    const dialog = document.querySelector('dialog.modal');

    try {
      expect(dialog.querySelector('header h2').textContent).toBe(' Report');
      expect(dialog.querySelector('iframe').getAttribute('src')).toBe(
        params.href,
      );
    } finally {
      dialog.remove();
    }
  });

  it('doesn’t open a dialog on mobile', () => {
    vi.spyOn(mapp.utils, 'mobile').mockReturnValue(true);

    const report = reportLink({
      report: { template: 'store_report', dialog: true },
    });

    expect(report.onclick).toBeNull();
  });
});
