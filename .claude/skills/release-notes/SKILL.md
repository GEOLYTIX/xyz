---
name: release-notes
description: Use when drafting, generating, revising, or reviewing GitHub release notes, changelogs, or a "What's Changed" section for an XYZ release.
---

# Release Notes

Create concise, user-focused release notes from the supplied pull requests, commits, or version range. Match the XYZ release format below exactly unless the user explicitly requests another format.

## Gather The Changes

1. Identify the repository, previous version, new version, and included pull requests from the user's request or repository context.
2. Once the candidate pull requests are identified, research each one with its own subagent rather than fetching pages directly in the main thread. Launch one subagent per pull request, all in a single message, so they run in parallel — each PR's research is independent of the others. Give each subagent the PR URL and ask it to return, as a compact structured summary (not a raw page dump):
   - Title, author, and actual behavior verified from the diff and description — do not rely on the title alone when the diff or description tells a clearer story.
   - Every issue linked to the PR (GitHub's "Development" sidebar entries and any "Closes/Fixes/Resolves #" references in the description), with that issue's full title and body fetched separately. A PR description frequently omits scope, sub-problems, or the original motivation that only the linked issue records — treat the PR description as a summary, not the full picture.
3. Do not rely on a pull request title when its diff, description, or linked issues provide a clearer or more complete explanation of the change.
4. Ask one concise clarification question if the release range cannot be determined. Never invent versions, pull request numbers, contributors, links, behavior, or impact.
5. Include user-visible fixes, features, documentation improvements, and meaningful maintenance changes. Exclude merge commits, release preparation commits, and incidental refactors unless they affect users or maintainers in a way worth announcing.

## Organize The Notes

Start with ## What's Changed.
Group related pull requests under descriptive ### headings in title case, such as Map and Theme Fixes, Filter Fixes, CSV Upload Fixes, or Documentation.
Derive headings from the actual changes. Do not force a fixed set of categories.
Order sections by user impact and keep closely related changes together. Put documentation and internal maintenance last.
Give each pull request its own bullet unless multiple pull requests implement inseparable parts of the same user-facing change.
Finish with a bold Full changelog: link comparing the previous and new tags.

## Write The File

For drafting, generating, or revising release notes, write the finished Markdown to release-notes/<new-version>.md, preserving the tag exactly, including its leading v. For example, release v4.23.6 must be written to release-notes/v4.23.6.md.
Resolve release-notes/ from the Git workspace root, not from this skill's directory.
Create the release-notes/ directory or version file when it does not exist.
Read an existing version file before editing it. Replace its contents with the finished release notes because the version file is the release artifact; do not append another copy of the notes.
If the user provides an explicit destination file, use that path instead.
When the user asks only for a review, do not edit the file unless they also ask for fixes.

## Write Each Entry

Use this structure:

markdown
- **Concise user-visible outcome in the past tense.**
  Explain the previous problem and the corrected behavior in plain language. Thanks @author! [#123](https://github.com/OWNER/REPOSITORY/pull/123)

Follow these rules:

Begin with a bold sentence that can be understood by someone scanning the release.
Prefer outcomes such as Prevented, Fixed, Improved, Added, or <thing> now <does something> over implementation-led wording.
Explain what went wrong before, when it occurred, and what happens now. Include enough technical detail to make the fix meaningful, but avoid narrating the code diff.
Use backticks for code identifiers, configuration keys, values, filenames, and types.
Use active voice, precise wording, and short paragraphs. Avoid hype, filler, vague claims, and phrases such as "various fixes" or "under the hood".
Preserve important distinctions such as numeric versus integer behavior, clustered versus individual features, or missing versus empty values.
End every entry with the exact attribution and linked pull request form: Thanks @author! [#123](URL).
Do not add issue links, commit hashes, test details, or breaking-change labels unless they are relevant and verified.

## Output Format

markdown
## What's Changed

### Category Name

- **User-visible outcome.**
  Previous behavior, its impact, and the corrected behavior. Thanks @author! [#123](https://github.com/OWNER/REPOSITORY/pull/123)

### Documentation

- **Improved documentation for the affected feature.**
  Explain what is clearer or easier to maintain now. Thanks @author! [#456](https://github.com/OWNER/REPOSITORY/pull/456)

**Full changelog:** [vPREVIOUS...vNEW](https://github.com/OWNER/REPOSITORY/compare/vPREVIOUS...vNEW)
Before writing, verify that every included pull request appears once, every attribution and link is correct, headings reflect their entries, and the comparison URL uses the correct tags. After writing, respond with a concise summary and the repository-relative file path instead of repeating the complete release notes, unless the user asks to see them in the response.