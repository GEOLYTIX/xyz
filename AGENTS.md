# Working on XYZ/MAPP

Start with [knowledge/index.md](knowledge/index.md) and open only the concepts
relevant to the task. Follow their source links into the implementation and tests.
Every Wiki page is migrated, but not every feature is covered in depth; absence of a
concept does not imply absence of functionality. Check the code and existing root
documentation for uncovered topics.

- Read [DEVELOPING.md](DEVELOPING.md) and [TESTING.md](TESTING.md) for development
  commands and test conventions. Use the workspace's pnpm version and catalog.
- Keep API signatures, parameters and return types in source JSDoc. Use knowledge
  concepts for context, constraints, configuration and workflows.
- When changing behavior covered by a concept, update that concept and its source
  links in the same PR. Keep directory indexes current. `pnpm knowledge:changed`
  lists the concepts linking the modules a branch changed; CI fails when a
  concept's `resource` changes without the concept.
- Read [the authoring workflow](knowledge/workflows/authoring.md) before editing
  knowledge. Run `pnpm knowledge:check` after changes to the bundle, and
  `pnpm knowledge:test` after changes to the validator.
- The bundle is published as the knowledge portal; see
  [DOCUMENTATION.md](DOCUMENTATION.md). Run `pnpm knowledge:site:build` after
  adding, moving or renaming concepts. Do not edit the generated Wiki stubs.
- Retain `status: draft` until content review. Do not claim human verification
  or mark content verified merely because CI passes.
- Workspace examples are configuration guidance, not a complete executable
  schema. Check authorization, templates and source loading before generating
  workspaces for a real deployment.
