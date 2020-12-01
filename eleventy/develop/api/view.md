---
title: View
tags: [develop]
layout: root.html
---

# View API

[Application view](/xyz/docs/develop/views/) templates can be accessed through the XYZ API to provider parameter substitution in the template as well as secure access through the [User API](/xyz/docs/develop/api/user).

### /api/view/:template?

A template parameter must be provided to the View API. The template parameter (eg. `/api/view?template=myTemplate`) may be provided as first URL path parameter (eg. `/api/view/myTemplate`).

A `400` status code will be returned if the template parameter is not defined.

The named template must be available as in the workspace.

A `404` status code will be returned if the template is not found in the workspace.

An err property will be defined if the XYZ Host fails to cache a template in the workspace. The value of the err property will be returned if found.



### login param

