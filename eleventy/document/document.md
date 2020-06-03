---
title: Document
tags: [root]
layout: root.html
---

# How to Document

Please refer to the information in this article in order to contribute to the documentation.

## eleventy

We use [Eleventy](https://github.com/11ty/eleventy) to compile markdown into static pages.

eleventy and markdown-it are included as save-dev dependencies in the XYZ package.json

Individual markdown documents and a template html are stored in the /eleventy folder. Configuration for the compilation is in the .eleventy.js file in the XYZ root.

Use following command to compile templates and markdown from the /eleventy folder in the /docs directory.

```
npx eleventy --input ./eleventy --output ./docs --formats=md
```

We use [Github pages](https://pages.github.com/) to serve the documentation directly from the XYZ repository /docs.

![](https://res.cloudinary.com/geolytix-xyz/image/upload/v1589640927/documentation/gh-pages_z1zcne.png)

Images as shown above must be uploaded to cloudinary or other cdn for hosting. Image links should be added to markdown like so.

```![](https://res.cloudinary.com/geolytix-xyz/image/upload/v1589640927/documentation/gh-pages_z1zcne.png)```