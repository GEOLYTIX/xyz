import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { readEnvironment, splitDocument, validateBundle } from './validate.mjs';

const roots = [];

afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

const INDEX = "---\nokf_version: '0.2'\n---\n# Index";

function fixture(files) {
  const root = mkdtempSync(join(tmpdir(), 'xyz-knowledge-'));
  roots.push(root);
  for (const [path, content] of Object.entries({
    'knowledge/index.md': INDEX,
    ...files,
  })) {
    if (content === null) continue;
    const target = join(root, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
  return root;
}

describe('knowledge validator:', () => {
  it('accepts minimal concepts, arbitrary types and extension fields', () => {
    const root = fixture({
      'knowledge/a.md':
        '---\ntype: Future Type\ncustom: {value: true}\n---\n# A',
    });
    expect(validateBundle(root).errors).toEqual([]);
  });

  it('rejects missing, empty, numeric and malformed type/frontmatter', () => {
    for (const text of [
      '# No metadata',
      '---\ntype: ""\n---',
      '---\ntype: 4\n---',
      '---\ntype: [broken\n---',
      '---\ntype: Guide\ntype: Other\n---',
      '---\ntype: Guide',
      '---\n---',
    ]) {
      const root = fixture({ 'knowledge/a.md': text });
      expect(validateBundle(root).errors, text).toHaveLength(1);
    }
  });

  it('reports empty frontmatter as a missing type, not an unclosed block', () => {
    const root = fixture({ 'knowledge/a.md': '---\n---\n# A' });
    expect(validateBundle(root).errors[0]).toMatch(/requires a nonempty/);
  });

  it('parses BOM, CRLF, quoted colons and multiline YAML', () => {
    const doc = splitDocument(
      '﻿---\r\ntype: Guide\r\ntitle: "A: B"\r\ndescription: >\r\n  Two\r\n  lines\r\n---\r\nBody',
    );
    expect(doc.metadata.title).toBe('A: B');
    expect(doc.metadata.description).toBe('Two lines\n');
    expect(doc.body).toBe('Body');
  });

  it('resolves bundle-root and repository-relative paths and encoded spaces', () => {
    const root = fixture({
      'apps/source.js': '// implementation',
      'knowledge/folder/a.md':
        '---\ntype: Guide\nresource: ../../apps/source.js\nsources:\n  - resource: /other%20page.md\n---\n[Page](/other%20page.md#heading)',
      'knowledge/other page.md': '---\ntype: Guide\n---',
    });
    expect(validateBundle(root).errors).toEqual([]);
  });

  it('detects broken inline, image and reference links but ignores code fences', () => {
    for (const body of [
      '[bad](missing.md)',
      '![bad](missing.png)',
      '[bad][ref]\n\n[ref]: missing.md',
    ]) {
      const root = fixture({
        'knowledge/a.md': `---\ntype: Guide\n---\n${body}`,
      });
      expect(validateBundle(root).errors[0]).toMatch(/Missing local target/);
    }
    const root = fixture({
      'knowledge/a.md':
        '---\ntype: Guide\n---\n```md\n[example](missing.md)\n```\n[web](https://example.invalid/) [anchor](#heading)',
    });
    expect(validateBundle(root).errors).toEqual([]);
  });

  it('detects missing metadata resources and paths escaping the repository', () => {
    for (const [metadata, message] of [
      ['resource: ../missing.js', /Missing local target/],
      ['sources: [{resource: ../missing.js}]', /Missing local target/],
      ['resource: ../../outside.md', /escapes repository/],
    ]) {
      const root = fixture({
        'knowledge/a.md': `---\ntype: Guide\n${metadata}\n---`,
      });
      const { errors } = validateBundle(root);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatch(message);
    }
  });

  it('rejects path-like resources without a local prefix', () => {
    for (const metadata of [
      'resource: apps/missing.js',
      'sources: [{resource: apps/also-missing.js}]',
      'resource: README.md',
    ]) {
      const root = fixture({
        'knowledge/a.md': `---\ntype: Guide\n${metadata}\n---`,
      });
      const { errors } = validateBundle(root);
      expect(errors, metadata).toHaveLength(1);
      expect(errors[0]).toMatch(/needs a \.\/, \.\.\/ or \/ prefix/);
    }
  });

  it('optional quality failures warn while scope descriptions remain valid', () => {
    const root = fixture({
      'knowledge/a.md':
        '---\ntype: Guide\ntags: scalar\nstatus: custom\nstale_after: 2000-01-01T00:00:00Z\nsources: [{resource: all workspace requests}, {resource: "https://example.invalid/a"}]\n---',
    });
    const result = validateBundle(root, Date.parse('2026-11-16'));
    expect(result.errors).toEqual([]);
    for (const message of [
      'past stale_after',
      'tags should be an array',
      'status should be draft',
      'title is missing',
    ]) {
      expect(
        result.warnings.some((warning) => warning.includes(message)),
        message,
      ).toBe(true);
    }
  });

  it('reserved indexes and logs cannot masquerade as concepts', () => {
    for (const path of [
      'knowledge/index.md',
      'knowledge/sub/index.md',
      'knowledge/log.md',
    ]) {
      const root = fixture({ [path]: '---\ntype: Guide\n---' });
      expect(validateBundle(root).errors, path).toHaveLength(1);
    }
  });

  it('requires okf_version 0.2 on the root index', () => {
    for (const [index, message] of [
      ['# Index', /must declare okf_version/],
      ["---\nokf_version: '0.3'\n---\n# Index", /supports okf_version 0.2/],
    ]) {
      const root = fixture({ 'knowledge/index.md': index });
      const { errors } = validateBundle(root);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatch(message);
    }
  });

  it('log dates must be real dates in descending order', () => {
    for (const body of [
      '## Yesterday',
      '## 2026-02-30',
      '## 2026-01-01\n\n## 2026-02-01',
    ]) {
      const root = fixture({ 'knowledge/log.md': body });
      expect(validateBundle(root).errors, body).toHaveLength(1);
    }
    const root = fixture({
      'knowledge/log.md': '## 2026-11-16\n\n## 2026-10-01',
    });
    expect(validateBundle(root).errors).toEqual([]);
  });

  it('warns on missing indexes and on concepts or folders an index omits', () => {
    const root = fixture({
      'knowledge/index.md': `${INDEX}\n\n- [Listed](listed.md)`,
      'knowledge/listed.md': '---\ntype: Guide\ntitle: L\ndescription: L\n---',
      'knowledge/orphan.md': '---\ntype: Guide\ntitle: O\ndescription: O\n---',
      'knowledge/a/b/c.md': '---\ntype: Guide\ntitle: C\ndescription: C\n---',
    });
    const { errors, warnings } = validateBundle(root);
    expect(errors).toEqual([]);
    expect(warnings).toEqual(
      expect.arrayContaining([
        'knowledge: index does not list orphan.md',
        'knowledge: index does not list a',
        'knowledge/a: missing directory index',
        'knowledge/a/b: missing directory index',
      ]),
    );
    expect(warnings.join('\n')).not.toMatch(/listed\.md/);
  });

  it('missing and empty bundles fail instead of passing without validation', () => {
    const root = fixture({ 'knowledge/index.md': null });
    expect(validateBundle(root).errors).toHaveLength(1);
    mkdirSync(join(root, 'knowledge'));
    expect(validateBundle(root).errors).toHaveLength(1);
  });
});

describe('environment coverage:', () => {
  const code = [
    '/** xyzEnv.IN_BLOCK_COMMENT */',
    '// xyzEnv.IN_LINE_COMMENT',
    'const a = xyzEnv.DOCUMENTED;',
    "const b = xyzEnv['BRACKET_NAME'];",
    'const c = process.env.FAMILY_ONE || process.env.VERCEL_ENV;',
    'const d = xyzEnv.WALLET[key] ?? process.env.NODE_ENV;',
  ].join('\n');

  it('collects variables read in code and ignores comments and platform names', () => {
    const root = fixture({
      'apps/xyz/mod/a.js': code,
      'apps/xyz/tests/ignored.test.mjs': 'xyzEnv.TEST_ONLY',
    });
    expect([...readEnvironment(root)].sort()).toEqual([
      'BRACKET_NAME',
      'DOCUMENTED',
      'FAMILY_ONE',
    ]);
  });

  it('warns once for variables without a concept, honouring PREFIX_* entries', () => {
    const root = fixture({
      'apps/xyz/mod/a.js': code,
      'knowledge/index.md': `${INDEX}\n\n- [Env](env.md)`,
      'knowledge/env.md':
        '---\ntype: Environment Variable\ntitle: E\ndescription: E\nvariables: [DOCUMENTED, FAMILY_*]\n---',
    });
    const { errors, warnings, undocumented } = validateBundle(root);
    expect(errors).toEqual([]);
    expect(undocumented).toEqual(['BRACKET_NAME']);
    expect(warnings).toEqual([
      'knowledge/environment: 1 variables read in code have no concept: BRACKET_NAME',
    ]);
  });

  it('warns on malformed variables metadata', () => {
    const root = fixture({
      'knowledge/index.md': `${INDEX}\n\n- [Env](env.md)`,
      'knowledge/env.md':
        '---\ntype: Environment Variable\ntitle: E\ndescription: E\nvariables: lowercase\n---',
    });
    expect(validateBundle(root).warnings).toEqual([
      'knowledge/env.md: variables should be an array of NAME or PREFIX_* strings',
    ]);
  });
});
