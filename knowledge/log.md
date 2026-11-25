# Knowledge changes

## 2026-11-25

- Wiki `sources` link the snapshot revision of each page, since the page URLs
  now show the generated stubs.
- Documented the remaining keys used in the test workspaces: drawing button
  `label`s, `icon_scaling.icon` and `clusterScale`, and `multi_filter.target`.
  `style.label.declutter` and `entry.draw.geometry` are read by no code and
  were removed from the test workspaces.
- The checker fails on malformed `x-xyz-variables`, `requires` keys without
  an owner and unknown layer `formats`, and checks the workspace schema when
  other checks fail. The rules moved to [knowledge checks](workflows/checks.md).
- `x-xyz-keys` entries take `description`, `enum` and `deprecated`, generated
  into the workspace schema. `layer.format` lists the registry formats.
- `pnpm knowledge:changed` fails a pull request which changes a concept's
  `resource` without the concept; the `knowledge-unaffected` label turns it
  into a warning. `review-pr` compares the concept and code diffs.
- Added the [actor convention](decisions/actor-convention.md): `verified` is a
  maintainer's content review, and `status: stable` requires one.
- Reviewed the pull requests merged into `minor` since the bundle started
  against their concepts. Only #3084 changed documented behaviour:
  `locale.layer_order` sorts unlisted layers to the end, drawn on top. The
  tests added by #3087, #3126, #3127, #3128, #3136, #3146, #3147, #3079,
  #3082, #3069 and #3129, and the mapview draw, modify and snap interactions,
  are linked from the concepts they cover.

## 2026-11-24

- The VitePress knowledge portal is the published documentation, deployed to
  GitHub Pages by `deploy-docs.yml` on release and manually with a ref. It
  replaces the JSDoc API reference site; `clean-jsdoc-theme`, the JSDoc
  configurations, `pnpm generate-docs` and the `/docs` route are removed.
  JSDoc comments stay in the source.
- `pnpm knowledge:wiki` reduces the Wiki to stubs: Home, an Open Knowledge
  Format page from [about this bundle](about.md), and a stub per former page
  from the [migration inventory](workflows/wiki-migration.md).
- Replaced the Wiki publishing decision with
  [documentation publishing](decisions/documentation-publishing.md).

## 2026-11-20

- Added a VitePress portal prototype which renders the bundle, for comparison
  with the generated Wiki: `pnpm knowledge:site:dev` and
  `pnpm knowledge:site:build`. Its configuration lives in
  `utils/knowledge/site/`, outside the bundle.

## 2026-11-19

- Migrated the remaining Wiki pages and root documents: security (practices,
  accounts, authentication, authorization), every remaining environment
  variable, deployment (local development, Codespaces, Vercel, Neon, Node
  hosts, release builds, npm publishing), architecture (XYZ API, MAPP.UI,
  monorepo, the npm package), development guides, views, plugins and
  terminology. SETUP.md and DEPLOYMENT.md are pointers to the bundle.
- Environment variables read in code without a concept now fail the check.
- Generated a JSON Schema of workspaces from `x-xyz-keys`, linked by the new
  `ref` field and a `theme` root. The check fails on an outdated schema and on
  examples with wrong types or undocumented keys, and warns on undocumented
  keys in the test workspaces. Added the layer drawing concept and the keys
  the test workspaces showed missing.
- Added the workspace frame and locale key groups: workspace and locales
  (rewritten from the locales sample), templates, roles, locale view,
  gazetteer and locale plugins. Corrected Wiki claims: role objects merge on
  the server and a role filter must set `filter.default`, negated roles are
  not evaluated, and array merging replaces or appends whole arrays.
- Examples may define named `locales`, merged into their `locale` as the XYZ
  API does; the example test also runs gazetteer searches.
- Added the dataviews concept: layer and location dataviews, the core Json
  renderer, the tabulator and chartjs plugins, query params flags, map change
  reloads and toolbars. The example test runs each layer dataview query.
- Added the location key groups: infoj, entry display, entry types and
  editing. The example test also opens a location of each layer with infoj,
  which runs its fields and fieldfx against the devdb.
- Added the layer style key groups: feature styles and icons, themes, and
  labels and hovers. Format-specific style keys moved to the formats concept.
  Corrected the data source concept: `params.fields` is generated, extra
  columns go in `params.default_fields`.
- Added the layer core key groups: display and view (including `viewConfig`),
  data source (tables, zoom ranges, params), formats and cluster. Corrected
  Wiki claims: `mvt_cache` is disabled, `panelOrder` moved to `viewConfig`,
  and `tiles` always needs `URI`.
- Added the bundle overview: OKF, the bundle layout, and developing and
  creating workspaces through agents.
- Workspace concepts own their keys in `x-xyz-keys` and end with an executable
  JSON example. Added the layer filter and filter expression concepts as the
  first key groups.
- The checker validates `x-xyz-keys`, fails on a key owned twice and on
  examples which are not JSON, and warns on oversized concepts, Workspace Key
  concepts without an example and Feature concepts missing their headings.
  `pnpm knowledge:find` looks concepts up by key, variable, module or word.
- Recorded the release scope: the whole migration ships in one PR with v5.1;
  content details are patched after the release.
- Recorded the first Wiki generation: archive the hand-written Wiki, generate
  from the PR branch for review, and remove the archive before merge.

## 2026-11-18

- Moved the bundle to OKF v0.3: root `title` and `description`, extension keys
  renamed to `x-xyz-variables` and `x-xyz-revision`, and the checker accepts
  only `okf_version: "0.3"`. It also checks the v0.3 path fields and warns on
  `stale_after` values which are not RFC 3339.
- Added Server and Databases environment concepts; environment concepts are
  grouped by feature rather than one per variable.
- Recorded the Wiki publishing decision: generated on release, and manually
  between releases to publish corrections.

## 2026-11-17

- Added TRUSTED_RETURN_HOSTS, session token claim and telemetry environment concepts.
- The checker warns on undocumented environment variables and on concepts missing
  from their directory index, fails on unprefixed path-like resources and on a
  root index without okf_version, and its tests run on Vitest.
- Removed the undocumented `configuration` metadata from the locales concept.

## 2026-11-16

- Established the OKF v0.2 bundle, authoring rules and local validation.
- Adapted selected content from three Wiki pages against the current minor branch.
- Added agent navigation and source links; content remains draft for review.
