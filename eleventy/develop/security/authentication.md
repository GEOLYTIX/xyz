---
title: Authentication
tags: [develop]
layout: root.html
orderPath: /develop/security/_authentication
---

# Authentication Strategy

All API requests must pass through the user auth module. Requests may be passed on to the API handler if the API is public or if a cookie with a valid signature is set on the request header.