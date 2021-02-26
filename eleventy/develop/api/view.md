---
title: View

layout: root.html
---

# View API

[Application view](/xyz/docs/develop/views/) templates can be accessed through the XYZ API to allow for parameter substitution prior to the template being sent to the client. The View API will be private or public dependent on the environment configuration. Individual templates may be defined as private or for admin access only overriding the environment settings.

### /api/view/:template?

A template parameter must be provided to the View API. The template parameter (eg. `/api/view?template=myTemplate`) may be provided as first URL path parameter (eg. `/api/view/myTemplate`).

A `400` status code will be returned if the template parameter is not defined.

The named template must be available as in the workspace.

A `404` status code will be returned if the template is not found in the workspace.

An err property will be defined if the XYZ Host fails to cache a template in the workspace. The value of the err property will be returned if found.