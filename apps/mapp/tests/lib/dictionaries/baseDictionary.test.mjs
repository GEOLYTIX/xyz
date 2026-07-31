/**
## /tests/lib/dictionaries/baseDictionary

English is the base dictionary. A key present in a translation but absent from
English is a key nothing looks up: the dictionary proxy resolves against the
active language first, then English, then returns the key itself. Extra keys in
a translation are therefore harmless at runtime, but they are dead weight and
they usually mean English lost a string that the translations kept.

The codi version of this test iterated `mapp.dictionaries`, which only ever
holds `en` -- the module ships `export const dictionaries = { en }` and other
languages are fetched on demand by `mapp.utils.loadDictionary`. The loop had
nothing to iterate, so the test asserted nothing.

Reading the files from disk gives the check something real to compare, and it
immediately turns up drift in 9 of the 10 translations. That drift predates this
test, so it is captured in `known-orphans.json` as a baseline rather than
failing the build. The assertion is a subset check: existing drift passes, new
drift fails.

**`known-orphans.json` should shrink to empty.** `fail_tabulator_load` and
`fail_chartjs_load` appear in eight translations and in no English dictionary
and no source file -- they are dead. The 54 Polish entries are keys the Polish
dictionary carries ahead of, or instead of, English.

@module /tests/lib/dictionaries/baseDictionary
*/

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import knownOrphans from './known-orphans.json';

// The dictionaries are served from the workspace root rather than from the mapp
// package. Resolved from this module rather than from the working directory,
// which differs between a turbo run and a direct vitest invocation.
//
// `import.meta.dirname` rather than `new URL(..., import.meta.url)`: happy-dom
// replaces the global URL with an implementation that ignores a file: base and
// resolves against the document instead.
const DICTIONARIES = join(
  import.meta.dirname,
  '../../../../../public/dictionaries',
);

const languages = readdirSync(DICTIONARIES)
  .filter((file) => file.endsWith('.json'))
  .map((file) => ({
    entries: JSON.parse(readFileSync(`${DICTIONARIES}/${file}`, 'utf8')),
    language: file.replace('.json', ''),
  }));

describe('dictionaries', () => {
  it('ships an English base dictionary', () => {
    expect(Object.keys(mapp.dictionaries.en).length).toBeGreaterThan(0);
  });

  it('ships translation files to check against the base', () => {
    expect(languages.length).toBeGreaterThan(0);
  });

  it.each(languages)(
    '$language declares no key absent from English beyond the known baseline',
    ({ entries, language }) => {
      const known = knownOrphans[language] ?? [];

      const orphans = Object.keys(entries).filter(
        (key) => !Object.hasOwn(mapp.dictionaries.en, key),
      );

      expect(orphans.filter((key) => !known.includes(key))).toEqual([]);
    },
  );

  it.each(languages)(
    '$language has no stale entry in the known orphan baseline',
    ({ entries, language }) => {
      const known = knownOrphans[language] ?? [];

      // A key that has since been added to English, or removed from the
      // translation, should be taken out of known-orphans.json.
      const stale = known.filter(
        (key) =>
          !Object.hasOwn(entries, key) ||
          Object.hasOwn(mapp.dictionaries.en, key),
      );

      expect(stale).toEqual([]);
    },
  );
});
