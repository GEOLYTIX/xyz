# Architecture

- [Monorepo](monorepo.md) - Apps and packages, pnpm catalog, Turborepo tasks, build outputs and versions; start here, and use before adding a package, dependency or build step.
- [XYZ API](xyz-api.md) - Router, middleware, mod/ modules and request flow; use before changing a route, middleware or API module, or to see which endpoints MAPP calls.
- [MAPP](mapp.md) - The browser mapping library on OpenLayers, its entry module and builds; use before changing MAPP or to see how it relates to MAPP.UI and XYZ.
  - [@geolytix/mapp package](mapp-package.md) - MAPP from npm or a CDN on other sites: Openlayers global, mapp.host, CORS_ORIGINS, cookies, CSP, versions; use when embedding MAPP or changing the package.
- [MAPP.UI](mapp-ui.md) - How apps/ui builds on the mapp global, its module map and how views wire it up; use before changing ui elements, panels, entries or plugins.
