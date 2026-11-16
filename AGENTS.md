# Working on XYZ/MAPP

Start with [knowledge/index.md](knowledge/index.md) and open only the concepts
relevant to the task. Follow their source links into the implementation and tests.
The bundle is a partial migration; absence of a concept does not imply absence of
functionality. Check the code and existing root documentation for uncovered topics.

- Read [DEVELOPING.md](DEVELOPING.md) and [TESTING.md](TESTING.md) for development
  commands and test conventions. Use the workspace's pnpm version and catalog.
- Keep API signatures, parameters and return types in source JSDoc. Use knowledge
  concepts for context, constraints, configuration and workflows.
- When changing behavior covered by a concept, update that concept and its source
  links in the same PR. Keep directory indexes current.
- Read [the authoring workflow](knowledge/workflows/authoring.md) before editing
  knowledge. Run `pnpm knowledge:check` and `pnpm knowledge:test` after changes to
  the bundle or validator.
- Check Wiki claims against the current branch before migrating them. Record the
  source page and revision; retain `status: draft` until content review. Do not
  claim human verification or mark content verified merely because CI passes.
- Workspace examples are configuration guidance, not a complete executable
  schema. Check authorization, templates and source loading before generating
  workspaces for a real deployment.
