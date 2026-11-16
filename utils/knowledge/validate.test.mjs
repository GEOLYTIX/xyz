import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { splitDocument, validateBundle } from './validate.mjs';

function fixture(t, files) {
  const root = mkdtempSync(join(tmpdir(), 'xyz-knowledge-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const [path, content] of Object.entries(files)) {
    const target = join(root, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
  return root;
}

test('accepts minimal concepts, arbitrary types and extension fields', (t) => {
  const root = fixture(t, {
    'knowledge/index.md': "---\nokf_version: '0.2'\n---\n# Index",
    'knowledge/a.md': '---\ntype: Future Type\ncustom: {value: true}\n---\n# A',
  });
  assert.deepEqual(validateBundle(root).errors, []);
});

test('rejects missing, empty, numeric and malformed type/frontmatter', (t) => {
  for (const text of [
    '# No metadata',
    '---\ntype: ""\n---',
    '---\ntype: 4\n---',
    '---\ntype: [broken\n---',
    '---\ntype: Guide\ntype: Other\n---',
    '---\ntype: Guide',
  ]) {
    const root = fixture(t, { 'knowledge/a.md': text });
    assert.equal(validateBundle(root).errors.length, 1, text);
  }
});

test('parses BOM, CRLF, quoted colons and multiline YAML', () => {
  const doc = splitDocument(
    '\uFEFF---\r\ntype: Guide\r\ntitle: "A: B"\r\ndescription: >\r\n  Two\r\n  lines\r\n---\r\nBody',
  );
  assert.equal(doc.metadata.title, 'A: B');
  assert.equal(doc.metadata.description, 'Two lines\n');
  assert.equal(doc.body, 'Body');
});

test('resolves bundle-root and repository-relative paths and encoded spaces', (t) => {
  const root = fixture(t, {
    'apps/source.js': '// implementation',
    'knowledge/folder/a.md':
      '---\ntype: Guide\nresource: ../../apps/source.js\nsources:\n  - resource: /other%20page.md\n---\n[Page](/other%20page.md#heading)',
    'knowledge/other page.md': '---\ntype: Guide\n---',
  });
  assert.deepEqual(validateBundle(root).errors, []);
});

test('detects broken inline, image and reference links but ignores code fences', (t) => {
  for (const body of [
    '[bad](missing.md)',
    '![bad](missing.png)',
    '[bad][ref]\n\n[ref]: missing.md',
  ]) {
    const root = fixture(t, {
      'knowledge/a.md': `---\ntype: Guide\n---\n${body}`,
    });
    assert.match(validateBundle(root).errors[0], /Missing local target/);
  }
  const root = fixture(t, {
    'knowledge/a.md':
      '---\ntype: Guide\n---\n```md\n[example](missing.md)\n```\n[web](https://example.invalid/) [anchor](#heading)',
  });
  assert.deepEqual(validateBundle(root).errors, []);
});

test('detects missing metadata resources and paths escaping the repository', (t) => {
  for (const metadata of [
    'resource: ../missing.js',
    'sources: [{resource: ../missing.js}]',
    'resource: ../../outside.md',
  ]) {
    const root = fixture(t, {
      'knowledge/a.md': `---\ntype: Guide\n${metadata}\n---`,
    });
    assert.equal(validateBundle(root).errors.length, 1);
  }
});

test('optional quality failures warn while scope descriptions remain valid', (t) => {
  const root = fixture(t, {
    'knowledge/a.md':
      '---\ntype: Guide\ntags: scalar\nstatus: custom\nstale_after: 2000-01-01T00:00:00Z\nsources: [{resource: all workspace requests}]\n---',
  });
  const result = validateBundle(root, Date.parse('2026-11-16'));
  assert.deepEqual(result.errors, []);
  assert.ok(
    result.warnings.some((warning) => warning.includes('past stale_after')),
  );
});

test('reserved indexes and logs cannot masquerade as concepts', (t) => {
  for (const path of [
    'knowledge/index.md',
    'knowledge/sub/index.md',
    'knowledge/log.md',
  ]) {
    const root = fixture(t, { [path]: '---\ntype: Guide\n---' });
    assert.equal(validateBundle(root).errors.length, 1);
  }
});

test('log dates must be real dates in descending order', (t) => {
  for (const body of [
    '## Yesterday',
    '## 2026-02-30',
    '## 2026-01-01\n\n## 2026-02-01',
  ]) {
    const root = fixture(t, { 'knowledge/log.md': body });
    assert.equal(validateBundle(root).errors.length, 1);
  }
  const root = fixture(t, {
    'knowledge/log.md': '## 2026-11-16\n\n## 2026-10-01',
  });
  assert.deepEqual(validateBundle(root).errors, []);
});

test('missing and empty bundles fail instead of passing without validation', (t) => {
  const root = fixture(t, {});
  assert.equal(validateBundle(root).errors.length, 1);
  mkdirSync(join(root, 'knowledge'));
  assert.equal(validateBundle(root).errors.length, 1);
});
