/**
 * Helpers which render the knowledge bundle with VitePress: the sidebar from
 * the directory indexes, links out of the bundle to GitHub, and the OKF
 * frontmatter above each concept.
 *
 * The module has no VitePress import, so the knowledge tests can run it.
 * @module utils/knowledge/site/bundle
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, posix, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const repository = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../..',
);

export const bundle = resolve(repository, 'knowledge');

const external = /^([a-z][a-z0-9+.-]*:|\/\/)/i;

const listItem = /^\s*[-*] \[(?<text>[^\]]+)\]\((?<href>[^)\s]+)\)/;

/**
 * @function githubRef
 * @description Returns the Git ref which links to repository files use: the
 * `KNOWLEDGE_SITE_REF` environment variable, the current branch, or `minor`.
 * @returns {string} The ref.
 */
export function githubRef() {
  if (process.env.KNOWLEDGE_SITE_REF) return process.env.KNOWLEDGE_SITE_REF;
  try {
    const branch = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
      cwd: repository,
      encoding: 'utf8',
    }).trim();
    if (branch && branch !== 'HEAD') return branch;
  } catch {
    // Not a Git checkout, eg. an exported archive.
  }
  return 'minor';
}

/**
 * @function pageLink
 * @description Turns a bundle Markdown path into a VitePress page link.
 * @param {string} path Path relative to the bundle, eg. `workspace/index.md`.
 * @returns {string} The page link, eg. `/workspace/`.
 */
export function pageLink(path) {
  return `/${path.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')}`;
}

/**
 * @function sidebar
 * @description Builds the sidebar from the list items of the directory
 * indexes, starting at the root index. A link to a subdirectory index becomes
 * a collapsible group of that index's items.
 * @param {string} [root] The bundle directory.
 * @param {string} [path] The index path relative to the bundle.
 * @returns {Array<Object>} VitePress sidebar items.
 */
export function sidebar(root = bundle, path = 'index.md') {
  const directory = posix.dirname(path);
  const items = [];
  for (const line of readFileSync(resolve(root, path), 'utf8').split('\n')) {
    const match = line.match(listItem);
    if (!match || external.test(match.groups.href)) continue;
    const target = posix.normalize(posix.join(directory, match.groups.href));
    if (!target.endsWith('.md') || !existsSync(resolve(root, target))) continue;
    const item = { text: match.groups.text, link: pageLink(target) };
    if (posix.basename(target) === 'index.md' && target !== path) {
      item.items = sidebar(root, target);
      item.collapsed = true;
    }
    items.push(item);
  }
  return items;
}

/**
 * @function resolveHref
 * @description Resolves a relative link of a concept. Links to Markdown files
 * in the bundle stay site links. Links to other files, in or out of the
 * bundle, open the file on GitHub. A leading `/` is relative to the bundle.
 * @param {string} href The link target.
 * @param {string} page The concept path relative to the bundle.
 * @param {Object} options
 * @param {string} options.repo The GitHub repository URL.
 * @param {string} options.ref The Git ref of the links.
 * @param {string} [options.root] The bundle directory.
 * @returns {string} The link target to render.
 */
export function resolveHref(href, page, { repo, ref, root = bundle }) {
  if (!href || href.startsWith('#') || external.test(href)) return href;
  const [, path, hash = ''] = href.match(/^([^#?]*)(.*)$/);
  if (!path) return href;
  const file = path.startsWith('/')
    ? resolve(root, `.${path}`)
    : resolve(root, dirname(page), path);
  const inBundle = !relative(root, file).startsWith('..');
  if (inBundle && /\.md$/.test(path)) return href;
  const repoPath = relative(repository, file).split(sep).join('/');
  if (repoPath.startsWith('..')) return href;
  return `${repo}/blob/${ref}/${repoPath}${hash}`;
}

/**
 * @function metadataHref
 * @description Resolves a path field value of the frontmatter, eg. `resource`,
 * like a link. The metadata is rendered as HTML, which VitePress does not
 * rewrite, so links to concepts become site links here.
 * @param {string} href The path field value.
 * @param {string} page The concept path relative to the bundle.
 * @param {Object} options The `resolveHref` options, and the site `base`.
 * @returns {string} The link target to render.
 */
export function metadataHref(href, page, options) {
  const resolved = resolveHref(href, page, options);
  if (resolved !== href || external.test(href)) return resolved;
  if (!/^[^#?]*\.md([#?]|$)/.test(href)) return resolved;
  const [, path, hash] = href.match(/^([^#?]*)(.*)$/);
  const target = path.startsWith('/')
    ? path.slice(1)
    : posix.normalize(posix.join(posix.dirname(page), path));
  const base = (options.base ?? '/').replace(/\/$/, '');
  return `${base}${pageLink(target)}${hash}`;
}

const escape = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('{', '&#123;')
    .replaceAll('}', '&#125;');

const statusBadge = { draft: 'warning', deprecated: 'danger' };

function sourceItem(source, link) {
  const entry = typeof source === 'string' ? { resource: source } : source;
  if (!entry?.resource) return `<li>${escape(JSON.stringify(entry))}</li>`;
  const href = link(entry.resource);
  const label = entry.id ? `<code>${escape(entry.id)}</code> ` : '';
  const revision = entry['x-xyz-revision']
    ? ` (revision <code>${escape(entry['x-xyz-revision'])}</code>)`
    : '';
  return `<li>${label}<a href="${escape(href)}">${escape(entry.resource)}</a>${revision}</li>`;
}

/**
 * @function frontmatterHtml
 * @description Renders the OKF metadata of a concept as HTML: badges for
 * `type` and `status`, the tags, the description, and the `resource` and
 * `sources` links.
 * @param {Object} frontmatter The concept frontmatter.
 * @param {Function} link Resolves a path field value to a link target.
 * @returns {string} The HTML, empty for pages without a concept type.
 */
export function frontmatterHtml(frontmatter, link) {
  if (!frontmatter?.type) return '';
  const badges = [`<Badge type="info" text="${escape(frontmatter.type)}" />`];
  if (frontmatter.status) {
    const type = statusBadge[frontmatter.status] ?? 'tip';
    badges.push(
      `<Badge type="${type}" text="${escape(frontmatter.status)}" />`,
    );
  }
  for (const tag of frontmatter.tags ?? []) {
    badges.push(`<span class="okf-tag">${escape(tag)}</span>`);
  }
  const parts = [`<div class="okf-badges">${badges.join(' ')}</div>`];
  if (frontmatter.description) {
    parts.push(
      `<p class="okf-description" v-pre>${escape(frontmatter.description)}</p>`,
    );
  }
  const sources = [frontmatter.resource, ...(frontmatter.sources ?? [])]
    .filter(Boolean)
    .map((source) => sourceItem(source, link));
  if (sources.length) {
    parts.push(
      `<details class="okf-sources" v-pre><summary>Resource and sources</summary><ul>${sources.join('')}</ul></details>`,
    );
  }
  return `<div class="okf-meta">${parts.join('')}</div>\n`;
}
