# v4.α

The v4 alpha should be mostly feature complete.

## Road to Beta

Following tasks should be completed prior to a beta release.

- Review v4 structure.
- Review and port recent changes in v3 development branch.
- Review v3 documentation.
- Review CSS structure and implement new colour schema.
- Review dictionaries.
- Review dev workspace.
- Create sample views.
- Port client instances for testing.
- Port plugins/modules.
- Review GitHub issues.

## v4 at a glance

With a few dozen v3 production deployments we have accrued valuable client feedback, experience, as well as technical debt. Developer experience is at the forefront for the v4 *re-write* and advances in the javascript language and ecosystem allow us to bring several quality of life features to the MAPP client library.

We aim to make the client library and interfaces more customisable by taking on feedback from our development partners. Having a stable v3 build allowed us to take the time and get back to the drawing board for v4. The product team at Geolytix has significantly grown since the first v3 release. This requires us to be more dilligent in terms of versioning, testing, and documentation. Once released proper, we will use v4 as a *carte blanche* to bring orginational advances to the XYZ/MAPP repository.

### _XYZ / MAPP

There is no longer a global _XYZ method which has to be initialised and may only support a single mapview control. Instead of a global _XYZ object which contains everything (workspace, layers, locations, styles, etc.) there is now a global mapp object from which multiple mapview instances can be created.

### Seperation of UI/Mapp libraries

User interface methods to support the default MAPP view as well as custom views for reports have been seperated into their library. If loaded the UI library will be on the root of the window.mapp object.

### Polymorphism

Mapp methods are bound to mapviews, layers, and locations. It is possible to override methods directly in the mapp library or on an instance of a mapp control. Collections of methods are freely extensible via plugins.

### Snowpack

We no longer use webpack to build the library but snowpack.

### Dynamic module imports

It is now possible load libraries such as Tabulator and ChartJS if and when they are needed.