---
title: JWT Token
tags: [develop]
layout: root.html

---

[JSON Web Token \(JWT\)](https://jwt.io/) are used as access token for private instances and admin endpoints. Token decode as follows.

```text
{
  alg: "HS256",
  typ: "JWT"
}.
{
  email: "dennis.bauszus@geolytix.co.uk",
  access: "admin",
  iat: 1542035244,
  exp: 1542035364
}.
[signature]
```

The signature is created with the [**SECRET defined in the environment settings**](../../environment-settings/access-control.md). The email field is used to lookup a user account in the ACL and determine its access level.