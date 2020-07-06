---
title: API
tags: [develop]
layout: root.html
orderPath: /develop/api/_api
---

# XYZ APIs

Each XYZ API is an individual node process, usually deployed as a serverless function (lambda) via Vercel.

API methods may imported from the modules directory /mod. Modules associated with specific API will be stored in a /mod folder of the same name. All API endpoints have access to the XYZ user and workspace modules.

## Workspace

The workspace will be cached in a variable outside the function handler. The workspace will be cached if the variable is undefined during a first invocation of a function or after a cold start. With the cache parameter set as true an API will overwrite the existing object variable. Caching is required after the workspace changes.

## Request Parameter

*GET* requests will provide parameter in the URL. The URL parameter are parsed within the user authentication module and assigned to the request param object. Most XYZ APIs support optional URL *path parameter*. The path parameter is usually a required method key to select an API module to process a request.