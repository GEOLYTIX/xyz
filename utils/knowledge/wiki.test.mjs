import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  inventory,
  PORTAL,
  portalLinks,
  wikiPages,
  writeWiki,
} from './wiki.mjs';

const portal = 'https://example.org/xyz/';

const directories = [];

afterEach(() => {
  for (const directory of directories.splice(0))
    rmSync(directory, { recursive: true, force: true });
});

describe('knowledge wiki', () => {
  it('links concepts to the portal and other files to GitHub', () => {
    const markdown = portalLinks(
      '[R](../workspace/roles.md#x) [S](../workspace/workspace.schema.json) [A](../../AGENTS.md) [W](https://w.org) [F](#f)',
      'workflows/page.md',
      { portal },
    );
    expect(markdown).toBe(
      '[R](https://example.org/xyz/workspace/roles#x) [S](https://github.com/GEOLYTIX/xyz/blob/main/knowledge/workspace/workspace.schema.json) [A](https://github.com/GEOLYTIX/xyz/blob/main/AGENTS.md) [W](https://w.org) [F](#f)',
    );
  });

  it('reads every former Wiki page from the migration inventory', () => {
    const names = inventory(join(import.meta.dirname, '../../knowledge')).map(
      (row) => row.name,
    );
    expect(names).toContain('Home');
    expect(names).toContain('Workspace-Configuration');
    expect(names).toHaveLength(20);
  });

  it('creates Home, the OKF page and a stub per former page', () => {
    const pages = wikiPages({ portal: PORTAL });
    expect(Object.keys(pages)).toHaveLength(21);
    expect(pages.Home).toContain(`[knowledge portal](${PORTAL})`);
    expect(pages['Open-Knowledge-Format']).toContain(
      '## The Open Knowledge Format',
    );
    expect(pages['Open-Knowledge-Format']).not.toMatch(/\]\(\.\.?\//);
    expect(pages['Templates-[Workspace]']).toContain(
      `[Templates](${PORTAL}workspace/templates)`,
    );
  });

  it('replaces the Markdown pages of a Wiki checkout', () => {
    const directory = mkdtempSync(join(tmpdir(), 'okf-wiki-'));
    directories.push(directory);
    writeFileSync(join(directory, 'Old-Page.md'), 'old');
    writeFileSync(join(directory, 'image.png'), 'png');
    writeWiki(directory, { portal });
    expect(existsSync(join(directory, 'Old-Page.md'))).toBe(false);
    expect(existsSync(join(directory, 'image.png'))).toBe(true);
    expect(readFileSync(join(directory, 'Home.md'), 'utf8')).toContain(portal);
  });
});
