---
title: Document
tags: [root]
layout: root.html
---

# How to Document

Please refer to the information in this article in order to contribute to the documentation.

## eleventy

We use [Eleventy](https://github.com/11ty/eleventy) to compile markdown into static pages.

eleventy and markdown-it are **not included** as dependencies in the XYZ included as save-dev dependencies. The npm modules may be installed for the project or globally.

Individual markdown documents and a template html are stored in the /eleventy folder. Configuration for the compilation is in the .eleventy.js file in the XYZ root.

Use following command to compile templates and markdown from the /eleventy folder in the /docs directory.

```
npx eleventy --input ./eleventy --output ./docs --formats=md
```

## Tree view structure

The order of static pages in the /docs directory will resemble the nesting of markdown articles in the /eleventy input folder. Defining front matter in the the individual markdown files allows for the configuration of the tree view navigation.

```
---
title: Getting started
tags: [getting-started, root]
layout: root.html
group: true
orderPath: /_getting-started/_getting-started
---
```

This example front matter shows how the `tags` array is used to show the 'Getting Started' page in the documentation root.

The `group` flag ensures that entry is pushed to the left in the tree view layout.

The `orderPath` is used to ensure that this page link will be on top of it's section due to underscores being sorted ahead of numerals and other characters.

## Images

Images should not be comitted to the XYZ repository but must be uploaded to an image hosting platform such as [cloudinary](https://cloudinary.com).

![](https://res.cloudinary.com/geolytix-xyz/image/upload/v1589640927/documentation/gh-pages_z1zcne.png)

The shown above is defined as an image link in the markdown:

```![](https://res.cloudinary.com/geolytix-xyz/image/upload/v1589640927/documentation/gh-pages_z1zcne.png)```

## Deploying the documentation

We use [Github pages](https://pages.github.com/) to serve the documentation directly from the XYZ repository /docs. For this reason relative links are prefixed with /xyz/docs.

In order to deploy the documentation as a static build to Vercel the vercel.json must be configured like so:

```
{
  "regions": [
    "lhr1"
  ],
  "builds": [
    {
      "src": "/docs/**",
      "use": "@vercel/static"
    }
  ],
  "trailingSlash": false,
  "rewrites": [
    {
      "source": "/xyz/docs/(.*)",
      "destination": "/docs/$1"
    },
    {
      "source": "/xyz/docs",
      "destination": "/docs/index.html"
    }
  ]
}
```