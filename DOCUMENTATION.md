# DOCUMENTATION

This document provides an overview of the different documentation sources to support the XYZ/MAPP project.

## README

The [README.md](https://github.com/GEOLYTIX/xyz/blob/main/README.md) document for the xyz repository landing page is the primary entry point to provide an overview of the project.

Supporting documents for the project [LICENCE](https://github.com/GEOLYTIX/xyz/blob/main/LICENSE), in regards to [CONTRIBUTING](https://github.com/GEOLYTIX/xyz/blob/main/CONTRIBUTING.md) to the project,[DEVELOPING](https://github.com/GEOLYTIX/xyz/blob/main/DEVELOPING.md), and our [CODE_OF_CONDUCT](https://github.com/GEOLYTIX/xyz/blob/main/CODE_OF_CONDUCT.md) can be found alongside this document in the XYZ repository root directory.

## WIKI

The [XYZ repository wiki](https://github.com/GEOLYTIX/xyz/wiki) is intended as a place for workshops, getting started guidelines, process environment and workspace configuration references.

## JSDOCS

XYZ/MAPP source code is annotated via JSDoc markup language.

We are using the [clean-jsdoc-theme](https://github.com/ankitskvmdam/clean-jsdoc-theme-example) which is installed as one of the devDependencies.

The script to build the docs requires the jsdoc_mapp.json and jsdoc_xyz.json config files in the root directory. The script can be executed with `npm run generate-docs`.

The documentation pages are generated in the local `/docs` directory. The docs directory is [git] ignored will be built in an automated action.

The built documentation pages can be accessed via the repositories github pages.

https://geolytix.github.io/xyz/

MAPP library modules are accessed through https://geolytix.github.io/xyz/mapp/

### Modules

