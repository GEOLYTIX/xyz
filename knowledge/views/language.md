---
type: Feature
title: Language and dictionaries
description: How a view chooses its language, how MAPP looks up interface texts in dictionaries, and how view, message and workspace values are translated; use when adding a language or translating a view.
resource: ../../apps/mapp/lib/dictionary.mjs
tags: [views, language, dictionary, mapp, xyz]
status: draft
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Application-Views
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: dictionary
    resource: ../../apps/mapp/lib/dictionary.mjs
  - id: load
    resource: ../../apps/mapp/lib/utils/loadDictionary.mjs
  - id: keyvalue
    resource: ../../apps/mapp/lib/utils/keyvalue_dictionary.mjs
  - id: templates
    resource: ../../apps/xyz/mod/utils/languageTemplates.js
  - id: default
    resource: ../../public/views/_default.html
  - resource: ../../public/dictionaries/en.mjs
  - resource: ../../apps/xyz/mod/workspace/templates/_msgs.js
  - resource: ../../apps/mapp/tests/dictionary.test.mjs
  - resource: ../../apps/mapp/tests/utils/loadDictionary.test.mjs
  - resource: ../../apps/mapp/tests/utils/keyvalue_dictionary.test.mjs
  - resource: ../../apps/xyz/tests/mod/utils/languageTemplates.test.mjs
---
# Language and dictionaries

Texts are translated in two places. The XYZ API picks a language template
for a view, mail or message. In the browser, MAPP looks interface texts up
in a dictionary for `mapp.language`.

## Behaviour

- **Language code.** `mapp.language` starts as the `language` URL hook or
  `en`. The default view then uses the hook, the user's `language` or `en`,
  in that order.[^default]
- **Dictionaries.** English is bundled from `public/dictionaries/en.mjs`.
  `mapp.utils.loadDictionary(code)` fetches
  `${mapp.host}/public/dictionaries/<code>.json` and merges it into
  `mapp.dictionaries[code]`.[^load] The repository has `de`, `es`, `fr`,
  `it`, `ja`, `ko`, `pl`, `th`, `tr`, `zh` and `zh_tw`.
- **Lookup.** `mapp.dictionary.<key>` returns the text in `mapp.language`,
  else the English text, else the key itself. If `mapp.language` has no
  dictionary, the lookup warns and sets `mapp.language` to `en`.[^dictionary]
- **Language templates.** A template in `workspace.templates` may be an
  object of language codes, eg. `{ "en": "file:/views/report_en.html",
  "de": "file:/views/report_de.html" }`. The view API picks the `language`
  param's entry, or `en`; an `en` entry is required. A value with a
  provider prefix such as `file:` or `https:` is loaded as a src.[^templates]
  Mail and message templates (`_msgs.js`) work the same way.
- **Workspace values.** `keyvalue_dictionary` on a locale or layer is a list
  of `{ key, value, default, <code>: text }`. Every string property
  `key` with the value `value` is replaced with the text for the user's
  language, `mapp.language`, or `default`.[^keyvalue] The mapview applies the
  locale's list, `layer.decorate` the layer's.

## Flow

URL `language` → view API `{{language}}` and the language template → the
browser: `mapp.mjs` sets `mapp.language` → the view's script sets it again
and awaits `loadDictionary` → `mapp.Mapview` loads a missing dictionary
before it runs plugins → ui elements read `mapp.dictionary`.

## Where to change

- Add or correct a text: `public/dictionaries/en.mjs` and the `<code>.json`
  files. Use the key in code as `mapp.dictionary.<key>`.
- Add a language: a new `<code>.json`, plus the language lists in
  `_login.html` and `_user.html`.
- Server messages: `apps/xyz/mod/workspace/templates/_msgs.js` and
  `_mails.js`.

## Tests

`apps/mapp/tests/dictionary.test.mjs` covers the fallbacks;
`utils/loadDictionary.test.mjs` and `utils/keyvalue_dictionary.test.mjs` the
utilities; `apps/xyz/tests/mod/utils/languageTemplates.test.mjs` the
template selection.

## Pitfalls

- Set `mapp.language` and await `loadDictionary` before creating ui
  elements. Elements created earlier keep their English texts.
- The view API accepts two letter codes only. `language=zh_tw` loads the
  `zh_tw` dictionary in the browser, but the HTML gets `lang="en"` and the
  `en` view template.
- `keyvalue_dictionary` prefers the user's stored language over the
  `language` URL hook, while the default view prefers the hook.

[^default]: _default.html and mapp.mjs
[^load]: utils/loadDictionary.mjs
[^dictionary]: dictionary.mjs get
[^templates]: utils/languageTemplates.js
[^keyvalue]: utils/keyvalue_dictionary.mjs
