---
layout: root.html
tags: [root]
---

## Open source javascript library and middleware for spatial data and application interfaces.

XYZ is a combination of node.js middleware and client libraries for building web applications for the analysis of spatial data.

The XYZ middleware is a collection of RESTful endpoints which provide secure interfaces to spatial data sources.

### Getting started

This section explains how to run the XYZ host locally, set the process environment and how to deploy XYZ as serverless functions to Vercel's Now platform. Information in regard to API access is provided in this section.

### Configure

Workspaces are used to configure locales, layers and locations in connected data sources. The workspace configuration defines how spatial data is presented in maps, tables, or charts created through the XYZ library.

### Develop

User will primarily interact with spatial data interfaces through views which facilitate the XYZ library to communicate with the middleware. This section gives an overview of library methods as well as the various API endpoints providing access to connected data sources.

Being open source we encourage developers to contribute to the XYZ project. Customization however can be achieved without the need to alter the core code base. Endpoints may be extended with stored scripts and custom views may be provided as a combination of markup and javascript.

### Design

A collection of interface control elements with a consistent look and feel to ease the development of custom application views.

### Mapp

A default user interface for desktop and mobile browser. This section provides a user guide to the functionality provided by the Mapp interface.

### Document

Made possible with eleventy. This page explains how to the XYZ project documentation contained in the gh-pages branch of the XYZ repository can be run locally.