# Deployment

Guides for setting up, running, building, deploying and publishing XYZ/MAPP.
They replace SETUP.md, DEPLOYMENT.md and the Wiki setup and hosting pages.
The release procedure stays in [RELEASING.md](../../RELEASING.md).

- [Local development](local-development.md) - Packages, prerequisites, install, build and environment for a local checkout; use first on a new machine.
- [Running locally](running-locally.md) - Dev scripts, VS Code launch configurations, first-run checks and troubleshooting; use when the local server does not start or shows a blank view.
- [GitHub Codespaces](codespaces.md) - Run XYZ/MAPP in the browser from a fork; use for a first try without a local install.
- [Neon serverless Postgres](neon.md) - A hosted PostGIS table connected as DBS_* with an editable layer; use for a first database-backed layer.
- [Deploy to Vercel](vercel.md) - How the function is wired, what ships, deploying, rollback and the auth and SAML apps; use before a Vercel deployment.
- [Vercel environment](vercel-environment.md) - vercel.json env, project variables or a frozen Varlock blob, Google Secret Manager, CI and troubleshooting; use when configuring a Vercel project.
- [Node host](node-host.md) - Run the app as a long-lived Node server, and share login across instances; use for hosting outside Vercel.
- [Release builds](release-builds.md) - Where the MAPP bundles are built and committed, Turborepo caching, debug builds, the pre-cached workspace and CI workflows; use before deploying a branch or changing the build.
- [Publishing the MAPP package](mapp-publishing.md) - Packing, testing and publishing @geolytix/mapp; use before publishing the package.
