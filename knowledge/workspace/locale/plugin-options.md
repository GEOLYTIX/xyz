---
type: Workspace Key
title: Plugin options
description: The options of the consent, feature_info, link_button and userIDB locale plugins; use when one of these plugins needs more than true.
resource: ../../../apps/ui/lib/plugins/link_button.mjs
tags: [workspace, locale, plugins, mapp, ui]
status: draft
x-xyz-keys:
  - key: locale.consent
    type: object
    description: Asks a logged in user once for consent and stores the answer with the user.
  - { key: locale.consent.text, type: string, required: true, description: Text of the consent dialog. }
  - { key: locale.consent.title, type: string, description: Dialog title; the consent_title dictionary entry by default. }
  - key: locale.feature_info
    type: [boolean, object]
    description: A button which shows the properties of a clicked feature in a popup.
  - { key: locale.feature_info.features, type: boolean, description: List the cluster label of each clustered feature instead of their number. }
  - { key: locale.feature_info.css, type: string, description: Inline style of the popup content. }
  - key: locale.link_button
    type: [object, array]
    description: A link button in the map button column, or an array of them.
  - { key: locale.link_button.href, type: string, required: true }
  - { key: locale.link_button.icon_name, type: string, required: true, description: Name of a Material Symbols icon. }
  - { key: locale.link_button.title, type: string }
  - { key: locale.link_button.target, type: string }
  - { key: locale.link_button.css_class, type: string }
  - { key: locale.link_button.css_style, type: string }
  - { key: locale.link_button.locale, type: boolean, description: Append ?locale=<locale key> to href. }
  - { key: "locale.link_button[].href", type: string, required: true }
  - { key: "locale.link_button[].icon_name", type: string, required: true, description: Name of a Material Symbols icon. }
  - { key: "locale.link_button[].title", type: string }
  - { key: "locale.link_button[].target", type: string }
  - { key: "locale.link_button[].css_class", type: string }
  - { key: "locale.link_button[].css_style", type: string }
  - { key: "locale.link_button[].locale", type: boolean, description: Append ?locale=<locale key> to href. }
  - key: locale.userIDB
    type: object
    description: A developer button which edits the user record in the browser's IndexedDB.
  - { key: locale.userIDB.title, type: string, default: userIDB }
sources:
  - id: consent
    resource: ../../../apps/mapp/lib/plugins/consent.mjs
  - id: featureinfo
    resource: ../../../apps/ui/lib/plugins/feature_info.mjs
  - id: linkbutton
    resource: ../../../apps/ui/lib/plugins/link_button.mjs
  - id: useridb
    resource: ../../../apps/ui/lib/plugins/userIDB.mjs
  - resource: ../../../apps/mapp/tests/plugins/consent.test.mjs
  - resource: ../../../apps/ui/tests/plugins/feature_info.test.mjs
  - resource: ../../../apps/ui/tests/plugins/link_button.test.mjs
  - resource: ../../../apps/ui/tests/plugins/userIDB.test.mjs
---
# Plugin options

These [locale plugins](plugins.md) take an options object. The other ui
plugins only need `true`.

- `consent` shows a confirm dialog with `text` and `title` to a logged in
  user who has not consented yet, and stores the answer in the user record
  of the browser's IndexedDB. It does nothing without a user, and warns and
  does nothing without `text`.[^consent]
- `feature_info` is `true` or an object. Its button toggles a highlight
  interaction which shows the id, layer and properties of a feature in a
  popup. For a cluster feature `features: true` lists the cluster label of
  each feature instead of their number; `css` styles the popup
  content.[^featureinfo]
- `link_button` is one link or an array of links. Each needs `href` and
  `icon_name`, or it is skipped with a warning. `title` defaults to the
  `link` dictionary entry; `locale: true` appends the locale key to `href`;
  `css_class` and `css_style` apply to the icon.[^linkbutton]
- `userIDB` adds a button titled `title` which opens the user record in a
  JSON editor, to store or remove it. Configure it as an object; `true`
  fails.[^useridb]

## Pitfalls

- `link_button` without `target` opens the link in the same tab, although
  the JSDoc says `_blank`; set `"target": "_blank"` for a new tab.
  `locale: true` appends `?locale=` even to a `href` with a query string
  ([#3115](https://github.com/GEOLYTIX/xyz/issues/3115)).
- `consent` is stored per browser by the default view, which merges the
  stored user into `mapp.user`; clearing site data asks again.

# Examples

A consent dialog, feature info with cluster labels and two link buttons.

```json
{
  "dbs": "DEVDB",
  "locale": {
    "consent": { "text": "Please confirm you consent to third party cookies." },
    "feature_info": { "features": true },
    "link_button": [
      { "href": "https://geolytix.github.io/xyz/", "icon_name": "help", "title": "Help", "target": "_blank" },
      { "href": "/view", "icon_name": "grid_view", "locale": true }
    ],
    "layers": {
      "countries": {
        "display": true,
        "format": "geojson",
        "table": "naturalearth.countries",
        "geom": "geom_4326",
        "srid": "4326",
        "qID": "id"
      }
    }
  }
}
```

[^consent]: mapp plugins/consent.mjs and its tests
[^featureinfo]: ui plugins/feature_info.mjs and its tests
[^linkbutton]: ui plugins/link_button.mjs and its tests
[^useridb]: ui plugins/userIDB.mjs and its tests
