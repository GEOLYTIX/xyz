/**
Generate the GitHub Wiki stubs which point to the knowledge portal. The Wiki is
not documentation any more: it keeps a Home page, an Open Knowledge Format page
from knowledge/about.md, and one stub per former Wiki page, so that old links
lead to the portal. The stubs come from the table in
knowledge/workflows/wiki-migration.md.

Every Markdown page in the Wiki checkout is replaced. Review the diff in the
checkout, then commit and push it.

  git clone https://github.com/GEOLYTIX/xyz.wiki.git ../xyz.wiki
  pnpm knowledge:wiki ../xyz.wiki
*/
import {
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundle, metadataHref } from './site/bundle.mjs';
import { splitDocument } from './validate.mjs';

export const PORTAL = 'https://geolytix.github.io/xyz/';

const REPO = 'https://github.com/GEOLYTIX/xyz';

const INVENTORY = 'workflows/wiki-migration.md';

const OKF_PAGE = 'Open-Knowledge-Format';

const markdownLink = /\]\(([^)\s]+)\)/g;

/**
@function portalLinks
@description
Rewrites the relative links of a bundle page: concepts link to the portal,
other files to GitHub.
@param {string} markdown The Markdown of the page.
@param {string} page The page path relative to the bundle.
@param {Object} options
@param {string} options.portal The portal URL.
@param {string} [options.root] The bundle directory.
@returns {string} The Markdown with absolute links.
*/
export function portalLinks(markdown, page, { portal, root = bundle }) {
  const options = { repo: REPO, ref: 'main', base: portal, root };
  return markdown.replace(
    markdownLink,
    (_link, href) => `](${metadataHref(href, page, options)})`,
  );
}

/**
@function inventory
@description
Reads the first table of the migration inventory: the former Wiki page names
and the Markdown of their destinations.
@param {string} root The bundle directory.
@returns {Array<Object>} The `{ name, destination }` rows.
*/
export function inventory(root) {
  const { body } = splitDocument(
    readFileSync(resolve(root, INVENTORY), 'utf8'),
  );
  const table = body.split(/\n\s*\n/).find((block) => block.startsWith('|'));
  return table
    .split('\n')
    .slice(2)
    .map((row) => row.split('|').map((cell) => cell.trim()))
    .map(([, name, destination]) => ({ name, destination }));
}

/**
@function wikiPages
@description
Creates the Wiki pages: Home, the Open Knowledge Format page and one stub per
former page in the migration inventory.
@param {Object} options
@param {string} options.portal The portal URL.
@param {string} [options.root] The bundle directory.
@returns {Object} Markdown by Wiki page name.
*/
export function wikiPages({ portal, root = bundle }) {
  const about = splitDocument(
    readFileSync(resolve(root, 'about.md'), 'utf8'),
  ).body.replace(/^# .*\n+/, '');

  const pages = {
    Home: `# XYZ/MAPP documentation

The documentation of XYZ and MAPP is the [knowledge portal](${portal}). The
portal is built from the [knowledge bundle](${REPO}/tree/main/knowledge) in the
repository, which is reviewed and released with the code.

This Wiki is generated and not edited by hand. Former Wiki pages point to their
replacement in the portal. [Open Knowledge Format](${OKF_PAGE}) explains how the
bundle is written.
`,
    [OKF_PAGE]: `> Generated from [knowledge/about.md](${REPO}/blob/main/knowledge/about.md). Read it in the [knowledge portal](${portal}about).

${portalLinks(about, 'about.md', { portal, root })}`,
  };

  for (const { name, destination } of inventory(root)) {
    if (pages[name]) continue;
    pages[name] = `# ${name.replaceAll('-', ' ')}

This page moved to the [knowledge portal](${portal}):
${portalLinks(destination, INVENTORY, { portal, root })}.
`;
  }
  return pages;
}

/**
@function writeWiki
@description
Replaces the Markdown pages of a Wiki checkout with the generated pages.
@param {string} directory The Wiki checkout.
@param {Object} options The `wikiPages` options.
@returns {Array<string>} The names of the written pages.
*/
export function writeWiki(directory, options) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith('.md'))
      rmSync(resolve(directory, entry.name));
  }
  const pages = wikiPages(options);
  for (const [name, markdown] of Object.entries(pages)) {
    writeFileSync(resolve(directory, `${name}.md`), markdown);
  }
  return Object.keys(pages);
}

const main = process.argv[1] && realpathSync(resolve(process.argv[1]));
if (main === realpathSync(fileURLToPath(import.meta.url))) {
  const [directory, portal = PORTAL] = process.argv.slice(2);
  if (!directory) {
    console.error('Usage: pnpm knowledge:wiki <wiki checkout> [portal URL]');
    process.exitCode = 2;
  } else {
    const names = writeWiki(resolve(directory), {
      portal: portal.replace(/\/?$/, '/'),
    });
    console.log(`Wrote ${names.length} Wiki pages to ${directory}`);
  }
}
