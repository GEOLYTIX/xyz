# Knowledge changes

## 2026-11-19

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
