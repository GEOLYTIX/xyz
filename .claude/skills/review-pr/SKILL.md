---
name: review-pr
description: Use when reviewing a pull request, a branch, or uncommitted working changes in the XYZ/MAPP repository — whether the user asks to "review this PR", "check my changes before I push", "look at PR 1234", or asks whether a change is ready to merge. Produces a terminal report covering whole-method correctness, listener and callback registration, scope creep across modules, test coverage for touched modules, and JSDoc conformance.
---

# Review PR

Review a change to XYZ/MAPP and report what a careful maintainer would raise. Write the report to the terminal; do not post it to GitHub and do not edit the code under review unless the user asks for fixes afterwards.

Two people use this review. A contributor runs it on their own working changes before pushing, so findings need to be specific enough to act on without further digging. A maintainer runs it while reading someone else's pull request, so the report needs to be readable top to bottom without the repository open alongside it. Write for both: name the file and line for every finding, and say what is wrong rather than only which rule was broken.

## Gather The Changes

1. Work out what is under review. A pull request number or URL means `gh pr view <n> --repo GEOLYTIX/xyz` for the description and linked issues and `gh pr diff <n> --repo GEOLYTIX/xyz` for the change. Pass `--repo` explicitly: a fork clone will otherwise resolve to the fork, where the pull request does not exist. No argument means review the working branch, diffed against the branch it targets rather than against `main` — XYZ maintains `major`, `minor` and `patch` release branches alongside `main`, and diffing a patch-based branch against `main` buries the change in unrelated commits. Take the base from `gh pr view --json baseRefName` when there is a pull request, or from the branch's upstream, and confirm with the user when neither is clear. Add `git status` for anything uncommitted. Ask which is meant only if the request is genuinely ambiguous — a dirty working tree on a feature branch usually means the uncommitted work is the subject.
2. Read the linked issue in full, not just the pull request description. XYZ issues frequently carry the reproduction, the scope, and the motivation that the pull request summarises in a sentence. Where a linked issue exists it is the yardstick for the scope check below. Plenty of XYZ pull requests reference a Linear ticket such as `ENG-295` instead, which you cannot read — when there is no readable linked issue, say so in the report and fall back to the pull request description, and treat the scope check as a judgement rather than a comparison.
3. Read the pull request comments, and search for issues that reference the pull request number. This is where reviewers record the things that never reach the description: a maintainer asking whether the change is in scope, or an issue opened *about* this change while it was being reviewed. Issue #2955 was filed by a maintainer during the review of #2945 and is the single most useful thing a reviewer of that pull request could read, yet nothing in the pull request itself points to it. `gh pr view <n> --comments` and a search for the number will both surface this.
4. List every touched file before reading any of them, so the shape of the change is clear before its details are. A change touching one module and its test reads very differently from the same fix scattered over nine.
5. Note which halves of the codebase the change touches, because it decides which checks below apply. `apps/mapp/lib/**` is the browser library, where the listener and registration check earns its keep. `apps/xyz/**` is the Node API, where the Vitest coverage check does. A purely server-side change has no listeners to examine, and saying so in one line is the right outcome — not silence, and not a manufactured finding.
6. For a large diff, parallel subagents can help, but split the work by concern rather than by file. One subagent per touched module reads quickly and hides exactly the bugs worth finding: a change that widens a route in `router.js` and a change to the handler in `verify.js` are each defensible alone and wrong together. Keep the reading of the diff in the main thread so the report is written with the whole change in view, and have any subagent return findings rather than file contents.

## Read Every Touched Method In Full

Read each changed function in its entirety in its post-change state, not just the lines the diff shows. For working changes that is the file on disk. For a pull request you have not checked out, fetch its head first — `git fetch upstream pull/<n>/head` for an open pull request, or `git fetch upstream` when it is already merged — and then read with `git show FETCH_HEAD:<path>` or `git show <merge-sha>:<path>`. Reading this way rather than checking the branch out leaves whatever the user has in progress untouched, which matters because they may be reviewing someone else's pull request from inside their own unfinished work.

Then find the callers. Searching the bare function name is not enough in MAPP, where modules collect their functions into a `methods` object and export that as the default, so callers reach a private function through the module name instead — `layerStyle.panel(entry)`, not `panel(entry)`. Search for the exported path as well as the bare name, or you will conclude a function has one caller when it has three.

A diff hunk cannot tell you whether the change is right, only what moved. Reading the whole method and its callers is what surfaces the things reviewers actually miss:

- A guard added at the top of a function that the only caller already performs.
- An early return that now skips cleanup, an event unbind, or a cache write further down.
- A parameter that changed meaning for one caller but not the others.
- A promise that is no longer awaited, or an error path that now returns `undefined` where callers expect an object.
- A method that was correct for the reported case but is now wrong for a second case it also serves.

When a change touches a route in `apps/xyz/router.js`, compare the middleware the route carried before against what it carries now. Express routes in XYZ get their request handling from the registration they match, so widening or narrowing a path can silently move a request onto a registration with a different middleware chain — the handler is untouched and still passes its tests, while a parameter it depends on quietly stops being populated. Read both registrations, not just the changed line, and name any middleware the request no longer passes through.

When the change fixes a regression, find the commit that introduced it with `git log -L <start>,<end>:<path>`. This reframes a review more often than any other single step: it shows whether the change restores the original behaviour or layers a second mechanism on top of the one that broke, which is the difference between a fix and a workaround that leaves the fault in place.

Report on the method as it now stands. Whether the original issue is fixed is necessary but not sufficient — a change that resolves the issue and breaks a sibling path is not ready.

A pre-existing bug you find inside a method the change touches is worth reporting as a `[Note]`, labelled as pre-existing, with a suggestion to open its own issue. It is real, and the reviewer is the person best placed to see it — but holding a pull request for a fault it did not introduce is how good changes stall.

## Check Listeners And Repeated Registration

MAPP builds its interfaces by registering callbacks, and those registrations outlive the code that made them. The failure is rarely a crash; it is the same handler firing two or three times because nothing removed the previous one.

For each touched registration, ask whether calling the surrounding function twice leaves one registration or two:

- `addEventListener` without a matching `removeEventListener`, an `AbortController` signal, or `{ once: true }`, on a target that outlives the call — `window`, `document`, the mapview, or a layer.
- A push into a persistent array or an assignment into a persistent object, such as `layer.showCallbacks`, `mapview.interactions`, or a `layer.style` entry. These are the easiest to miss because they read as ordinary assignment rather than as subscription.
- OpenLayers interactions, overlays, and sources added to the map without a corresponding removal.
- Anything registered inside a function that runs again on a user action — switching a theme, reloading a layer, reopening a dialog, changing a locale.

Issue #2955 is the shape to look for: a legend method appended to `layer.showCallbacks[]` each time the theme changed, never removed, so every theme switch added another legend. Nothing errored. The symptom was duplicated behaviour, and only reading the registration alongside its teardown revealed it.

Where a registration is deliberately permanent, say so in the report rather than flagging it — a listener bound once at initialisation on a target that lives for the session is not a leak.

## Check The Change Stays In Scope

CONTRIBUTING.md asks that a pull request address a single issue, so that each can be reviewed on its own merits. Compare the touched modules against what the linked issue describes.

Flag a module that the issue does not explain. Renaming a variable in a file the fix merely passes through, reformatting an untouched block, or fixing a second unrelated bug all make the change harder to review and harder to revert. Say which modules are justified by the issue and which are not, and suggest the unrelated ones move to their own pull request.

Be careful to distinguish scope creep from a fix that genuinely needs breadth. A change to a shared utility legitimately touches every caller, and a rename the issue asks for legitimately spans files. The question is whether the issue accounts for the spread, not whether the number of files is large.

## Check Tests And Coverage

XYZ has two test systems and the distinction decides what to ask for. Read `vitest.config.mjs` and the relevant `package.json` rather than relying on TESTING.md for paths — the documented config has drifted from the real one before.

- **XYZ API** — `apps/xyz/mod/**`, plus its `utils` and `plugins`. Covered by Vitest under `apps/xyz/tests/**`. Run `pnpm test:xyz:coverage` and read the per-file table for the touched files.
- **MAPP library** — `apps/mapp/lib/**`. Outside the Vitest run entirely, so it never appears in that coverage table and its absence there means nothing. The browser suite TESTING.md describes runs from a built bundle at `public/js/tests/`, and its source is not in this repository, so there is no per-file coverage figure to quote for a MAPP module. Say that plainly rather than reporting a coverage gap that is an artefact of which suite exists.

Then judge the change:

- A new feature without a test is a finding, and the report should name the file the test belongs in.
- A touched module whose coverage is unchanged and low is worth raising, with the current percentage quoted so the reader can weigh it. Treat this as a discussion to open rather than a gate: several XYZ modules start near zero, and demanding full coverage on a one-line fix in one of them is how a reasonable pull request gets stuck.
- A bug fix with no test that fails before the fix is the finding most worth making. Say which case the test should cover.
- Run the suite. A suite that runs and fails is a blocking finding regardless of anything else in the report. A suite you could not run — dependencies not installed, environment not configured — is not a failure and must not be reported as one; record it as a check that could not be completed, and say why. The distinction matters because a reader who sees "tests failed" will look for a bug that may not exist.
- Make sure the suite actually ran. These scripts go through turbo, which replays a cached result when nothing it tracks has changed: the run returns in milliseconds and prints `>>> FULL TURBO` with no test counts. Reporting a pass from a cached artefact is the worst outcome available to this check, because it reads exactly like a real pass. If you see that marker, re-run with `--force` and report the counts from the run that actually executed.
- A touched file missing from the coverage table altogether is a different finding from one with low coverage, and more interesting. It usually means the tests mock the module out rather than exercise it, so the suite passes while the changed code never executes. Say which it is.

## Check Documentation

Check touched functions and modules against DOCUMENTATION.md:

- Module comments carry the module path as the title, a short description of purpose, and `@requires` for linked modules.
- Function comments begin with `@function`, are marked `@async` where they are, and carry an `@description`. Functions should not be anonymous.
- `@param` lists only actual function arguments. `@property` documents the properties the method genuinely reads, with optional ones in square brackets.
- `@returns` states when a promise is returned and when it may reject, in the form `@returns {Promise<Object|Error>}`.
- Shared MAPP objects belong in a global `@typedef`, with nested typedefs named by the dash convention — the style object of `layer` is `layer-style`, and its theme is `layer-style-theme`.
- Superseded functions kept for legacy configurations are marked `@deprecated` and warn when called.

Flag a new exported function with no JSDoc, and a changed signature whose `@param` list no longer matches. A missing `@description` on an otherwise documented function is worth a note rather than a blocking finding.

## Report Format

Write to the terminal in Markdown, using this shape:

```markdown
# Review: <PR title and number, or branch name>

<Two or three sentences: what the change does, whether it resolves the linked
issue, and the single most important thing the reader should know.>

## Findings

### [Blocking] <short title>
`apps/mapp/lib/<path>.mjs:142`
What is wrong, why it matters, and what would resolve it.

### [Consider] <short title>
`apps/xyz/mod/<path>.js:88`
...

### [Note] <short title>
...

## Checks

| Check | Result |
|---|---|
| Touched methods read in full | <n> methods across <n> files |
| Listeners and registration | <findings, "no registrations touched", or "not applicable — no MAPP code"> |
| Scope | <modules justified against the issue, or "no readable issue — judged against the description"> |
| Tests and coverage | <suite result, whether it ran or replayed from cache, coverage on touched files> |
| Documentation | <conformance summary> |
```

Keep every row even when a check did not apply, and say which of the three it was: examined and clean, not applicable to this change, or not completed and why. A reader scanning the table needs to tell those apart, and a missing row reads as an oversight.

Order findings by severity, most serious first. Use `[Blocking]` for a correctness bug, a failing suite, or a leaked registration; `[Consider]` for something a maintainer would likely ask for but could merge without; `[Note]` for an observation worth recording. A clean review still gets the Checks table — knowing what was examined is most of the value when nothing is wrong.

Say plainly when a check could not be completed, for example when the suite could not run or the linked issue was not available, rather than reporting that check as passed. A review that quietly skips a check is worse than one that reports the gap, because the reader cannot tell the difference between examined and overlooked.

Keep findings concrete. "This listener is never removed, so switching the theme twice renders two legends" tells the reader what to do; "improve event handling" does not.

Report what you found, not what would make the review look thorough. A small, correct change deserves a short report and an empty Findings section, and padding it with style preferences or speculative concerns trains the reader to skim — which costs you the one finding that mattered. If you suspect something but could not confirm it, say what you checked and what remains unknown rather than either dropping it or asserting it.
