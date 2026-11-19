# Knowledge changes

## 2026-11-19

- Recorded the release scope: the whole migration ships in one PR with v5.1;
  content details are patched after the release.

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
