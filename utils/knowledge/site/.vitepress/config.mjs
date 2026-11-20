/**
 * VitePress configuration of the knowledge portal prototype. It renders
 * `knowledge/` as the source directory; nothing here is part of the bundle.
 *
 * Run `pnpm knowledge:site:dev` or `pnpm knowledge:site:build`.
 * @module utils/knowledge/site/config
 */

import footnote from 'markdown-it-footnote';
import { defineConfig } from 'vitepress';
import {
  bundle,
  frontmatterHtml,
  githubRef,
  metadataHref,
  resolveHref,
  sidebar,
} from '../bundle.mjs';

const repo =
  process.env.KNOWLEDGE_SITE_REPO ?? 'https://github.com/GEOLYTIX/xyz';
const ref = githubRef();
const base = process.env.KNOWLEDGE_SITE_BASE ?? '/';
const options = { repo, ref, base };

/**
 * Rewrites relative links which leave the bundle, or point to a file which is
 * not a concept, to the file on GitHub.
 * @param {Object} md The markdown-it instance.
 */
function githubLinks(md) {
  const render =
    md.renderer.rules.link_open ??
    ((tokens, idx, opts, _env, self) => self.renderToken(tokens, idx, opts));
  md.renderer.rules.link_open = (tokens, idx, opts, env, self) => {
    const token = tokens[idx];
    const href = token.attrGet('href');
    const resolved = resolveHref(href, env.relativePath, options);
    if (resolved !== href) {
      token.attrSet('href', resolved);
      token.attrSet('target', '_blank');
      token.attrSet('rel', 'noreferrer');
    }
    return render(tokens, idx, opts, env, self);
  };
}

/**
 * Inserts the OKF metadata of a concept after its first heading.
 * @param {Object} md The markdown-it instance.
 */
function okfMetadata(md) {
  md.core.ruler.push('okf_metadata', (state) => {
    const html = frontmatterHtml(state.env.frontmatter, (href) =>
      metadataHref(href, state.env.relativePath, options),
    );
    if (!html) return;
    const heading = state.tokens.findIndex(
      (token) => token.type === 'heading_close' && token.tag === 'h1',
    );
    const token = new state.Token('html_block', '', 0);
    token.content = html;
    state.tokens.splice(heading + 1, 0, token);
  });
}

export default defineConfig({
  base,
  srcDir: bundle,
  title: 'XYZ/MAPP knowledge',
  description:
    'Architecture, environment, workspace configuration and documentation workflows for the XYZ API and MAPP library.',
  cleanUrls: true,
  lastUpdated: false,
  markdown: {
    config(md) {
      md.use(footnote);
      md.use(githubLinks);
      md.use(okfMetadata);
    },
  },
  themeConfig: {
    nav: [
      { text: 'About', link: '/about' },
      { text: 'Workspace', link: '/workspace/' },
      { text: 'Changes', link: '/log' },
    ],
    sidebar: [{ text: 'Knowledge', items: sidebar() }],
    search: { provider: 'local' },
    outline: [2, 3],
    editLink: {
      pattern: `${repo}/edit/${ref}/knowledge/:path`,
      text: 'Edit this concept on GitHub',
    },
    socialLinks: [{ icon: 'github', link: repo }],
    footer: {
      message: `Generated from <code>knowledge/</code> at <code>${ref}</code>. Concepts marked draft are not reviewed.`,
    },
  },
});
