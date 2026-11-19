---
type: Guide
title: Clean code guidelines
description: Code style rules Biome cannot enforce - control flow, array methods, returns and errors, function order - plus the Biome and JSDoc conventions; use when writing or reviewing XYZ, MAPP or MAPP.UI code.
resource: ../../biome.json
tags: [development, style, biome, jsdoc]
status: draft
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Clean-code-guidelines
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: biome
    resource: ../../biome.json
  - id: ci
    resource: ../../.github/workflows/biome.yml
  - id: review
    resource: ../../.claude/skills/review-pr/SKILL.md
  - resource: ../../apps/mapp/biome.json
  - resource: ../../apps/ui/biome.json
  - resource: ../../DOCUMENTATION.md
---
# Clean code guidelines

These rules apply to all apps. Biome enforces formatting and a small set of
lint rules; the rest is checked in review.[^wiki]

## Control flow

- Leave a blank line before a comment.
- A function must not end with an `if` statement. The last case is the
  default, so return it without a condition.

  ```js
  function foo(arg) {
    if (arg === 'foo') return 'foo indeed';

    return 'bar';
  }
  ```

- Avoid double negation: write `if (check)`, not `if (!no_check)`.
- Return early from a guard rather than nesting the rest of the function.
  Biome fails a function with a cognitive complexity above 20; split it
  into named helpers.[^biome]

## Array methods

`map()` returns an array. Use it only when the result is used, and never
push into another array from inside `map()` or `forEach()`.

```js
// Do
const values = arr.map((entry) => entry.value);

// Don't
const values = [];
arr.forEach((entry) => values.push(entry.value));
```

## Functions

- Order functions in a module by their execution.
- A function which is only called from one place, but repeatedly, eg. a
  polling loop, can be an IIFE at that place.

  ```js
  (async function ping() {
    const response = await query(params);

    if (response.status === 'processing') {
      setTimeout(ping, 1000);
      return;
    }

    // Continue with the response.
  })();
  ```

- Return a value only if the caller expects one. Use a bare `return;` to
  stop a function which returns nothing.
- Name functions; avoid anonymous functions in JSDoc-documented modules.

## Errors

Return errors as `Error` objects, check for them with `instanceof Error`, and
log them with `console.error`. Don't return error strings.

```js
const response = await provider(req);

if (response instanceof Error) {
  console.error(response);
  return res.status(500).send('Provider request failed.');
}
```

Endpoint modules send a status and a plain text message for expected
failures; they don't throw to Express.

## Listeners and state

From the [review checklist](../../.claude/skills/review-pr/SKILL.md):[^review]

- Remove listeners, OpenLayers interactions and overlays you add, or use
  `{ once: true }` or an `AbortController` signal. A function which runs
  again on a user action, eg. a theme switch or layer reload, must not
  register twice.
- A push into a persistent array, eg. `layer.showCallbacks`, is a
  registration too.

## Biome

[Biome](https://biomejs.dev) formats and lints. The root [biome.json](../../biome.json)
holds the rules; [apps/mapp](../../apps/mapp/biome.json) and
[apps/ui](../../apps/ui/biome.json) have their own files. Lint rules are
opt-in (`recommended: false`), so a rule missing from the config is not
checked. CI runs `biome ci .` and fails if `apps/mapp/lib` references the
ui.[^ci] Commands are in [DEVELOPING.md](../../DEVELOPING.md#biome).

## JSDoc

Signatures, params and return types live in JSDoc, not in this bundle.
Follow [DOCUMENTATION.md](../../DOCUMENTATION.md):

- A module comment has the module path as title, a short purpose and
  `@requires` for linked modules.
- A function comment starts with `@function`, has `@async` where it applies
  and an `@description`. `@param` lists real arguments only; `@property`
  lists the properties the function reads, optional ones in brackets.
- Shared MAPP objects use a global `@typedef`, nested ones named with a dash,
  eg. `layer-style`.
- Superseded functions kept for old configurations are `@deprecated` and warn
  when called.

## Corrections to the Wiki

The Wiki named only `apps/mapp/biome.json` as an override; `apps/ui` has one
too. Its examples had typos (`antry`), fixed here.

[^wiki]: Clean-code-guidelines Wiki page at revision 3fc379b
[^biome]: biome.json
[^ci]: .github/workflows/biome.yml
[^review]: .claude/skills/review-pr/SKILL.md
