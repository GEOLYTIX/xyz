import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  bundle,
  frontmatterHtml,
  metadataHref,
  pageLink,
  resolveHref,
  sidebar,
} from './bundle.mjs';

const options = { repo: 'https://github.com/o/r', ref: 'main' };

describe('knowledge site', () => {
  it('turns bundle paths into page links', () => {
    expect(pageLink('index.md')).toBe('/');
    expect(pageLink('workspace/index.md')).toBe('/workspace/');
    expect(pageLink('workspace/roles.md')).toBe('/workspace/roles');
  });

  it('builds the sidebar from the directory indexes', () => {
    const root = mkdtempSync(join(tmpdir(), 'okf-site-'));
    mkdirSync(join(root, 'sub'));
    writeFileSync(
      join(root, 'index.md'),
      '- [A](a.md) - A.\n- [Sub](sub/index.md) - Sub.\n- [Web](https://x.org/b.md)\n- [Missing](missing.md)\n',
    );
    writeFileSync(join(root, 'a.md'), '');
    writeFileSync(join(root, 'sub/index.md'), '- [B](b.md) - B.\n');
    writeFileSync(join(root, 'sub/b.md'), '');
    expect(sidebar(root)).toEqual([
      { text: 'A', link: '/a' },
      {
        text: 'Sub',
        link: '/sub/',
        collapsed: true,
        items: [{ text: 'B', link: '/sub/b' }],
      },
    ]);
  });

  it('covers every concept of the bundle in the sidebar', () => {
    const links = new Set();
    const walk = (items) =>
      items.forEach((item) => {
        links.add(item.link);
        if (item.items) walk(item.items);
      });
    walk(sidebar());
    expect(links.has('/workspace/layer/filter')).toBe(true);
    expect(links.has('/environment/')).toBe(true);
  });

  it('links files outside the bundle to GitHub', () => {
    expect(resolveHref('../../apps/xyz/router.js', 'a/b.md', options)).toBe(
      'https://github.com/o/r/blob/main/apps/xyz/router.js',
    );
    expect(resolveHref('../AGENTS.md#x', 'about.md', options)).toBe(
      'https://github.com/o/r/blob/main/AGENTS.md#x',
    );
    expect(
      resolveHref('workspace.schema.json', 'workspace/index.md', options),
    ).toBe(
      'https://github.com/o/r/blob/main/knowledge/workspace/workspace.schema.json',
    );
    expect(resolveHref('/workspace/roles.md', 'a/b.md', options)).toBe(
      '/workspace/roles.md',
    );
    expect(resolveHref('roles.md#top', 'workspace/x.md', options)).toBe(
      'roles.md#top',
    );
    expect(resolveHref('#top', 'x.md', options)).toBe('#top');
    expect(resolveHref('https://x.org/a.md', 'x.md', options)).toBe(
      'https://x.org/a.md',
    );
  });

  it('links metadata paths to concepts as site pages', () => {
    expect(metadataHref('./decisions/okf.md', 'about.md', options)).toBe(
      '/decisions/okf',
    );
    expect(
      metadataHref('../roles.md#x', 'workspace/layer/a.md', {
        ...options,
        base: '/docs/',
      }),
    ).toBe('/docs/workspace/roles#x');
    expect(metadataHref('https://x.org/a.md', 'about.md', options)).toBe(
      'https://x.org/a.md',
    );
  });

  it('renders the OKF metadata of a concept', () => {
    const html = frontmatterHtml(
      {
        type: 'Guide',
        status: 'draft',
        tags: ['a'],
        description: 'Use {{ x }} <b>',
        resource: '../x.js',
        sources: [{ id: 'wiki', resource: 'https://w', 'x-xyz-revision': 'r' }],
      },
      (href) => `link:${href}`,
    );
    expect(html).toContain('<Badge type="info" text="Guide" />');
    expect(html).toContain('<Badge type="warning" text="draft" />');
    expect(html).toContain('<span class="okf-tag">a</span>');
    expect(html).toContain('Use &#123;&#123; x &#125;&#125; &lt;b&gt;');
    expect(html).toContain('<a href="link:../x.js">../x.js</a>');
    expect(html).toContain('<code>wiki</code> <a href="link:https://w">');
    expect(html).toContain('(revision <code>r</code>)');
    expect(frontmatterHtml({ title: 'Index' }, String)).toBe('');
  });

  it('renders the bundle directory', () => {
    expect(bundle.replaceAll('\\', '/')).toMatch(/\/knowledge$/);
  });
});
