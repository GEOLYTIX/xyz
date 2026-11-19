import { describe, expect, it, vi } from 'vitest';
import { LIDL, lidlLocation } from '../../helpers.mjs';
import { stubEntry } from './_helpers.mjs';

const { link, report } = mapp.ui.locations.entries;

describe('ui/locations/entries/link', () => {
  it('returns a link to the url in a val element', () => {
    const { entry } = stubEntry({
      url: 'https://example.com/',
      label: 'Example',
      link_class: 'outlined',
    });

    const node = link(entry);

    expect(node.classList).toContain('val');

    const anchor = node.querySelector('a');

    expect(anchor.href).toBe('https://example.com/');
    expect(anchor.target).toBe('_blank');
    expect(anchor.dataset.id).toBe('report-link');
    expect(anchor.classList).toContain('outlined');
    expect(anchor.classList).toContain('link-with-img');
    expect(anchor.textContent).toContain('Example');
    expect(anchor.textContent).toContain('open_in_new');
  });

  it('uses the title or the dictionary link as label', () => {
    const titled = stubEntry({ url: 'https://example.com/', title: 'Title' });

    expect(link(titled.entry).textContent).toContain('Title');

    const untitled = stubEntry({ url: 'https://example.com/' });

    expect(link(untitled.entry).textContent).toContain(mapp.dictionary.link);
  });

  it('links a report view of the location', async () => {
    const { location } = await lidlLocation();

    const entry = {
      location,
      report: { template: 'store_report', label: 'Store report' },
      params: { extra: 'a' },
    };

    const anchor = report(entry).querySelector('a');

    const url = new URL(anchor.href);

    expect(url.pathname).toBe(new URL(`${mapp.host}/view`).pathname);
    expect(url.searchParams.get('template')).toBe('store_report');
    expect(url.searchParams.get('locale')).toBe('grocery');
    expect(url.searchParams.get('layer')).toBe('retail_points');
    expect(url.searchParams.get('id')).toBe(String(LIDL));
    expect(url.searchParams.get('extra')).toBe('a');
    expect(anchor.textContent).toContain('Store report');
    expect(anchor.textContent).toContain('description');
  });

  it('warns and returns an empty val element without url or report', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { entry } = stubEntry({ data_id: 'missing' });

    const node = link(entry);

    expect(node.querySelector('a')).toBeNull();
    expect(warn).toHaveBeenCalledWith(
      'ReportLink missing is missing url or report definition.',
    );
  });
});
