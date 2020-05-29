---
title: Strategy
tags: [develop]
layout: root.html

---

\_\_[_fastify-auth_](https://github.com/fastify/fastify-auth) which is used to decorate XYZ routes does not provide an authentication strategy. The strategy applied by the XYZ authToken module will detailed here.

Public endpoints are immediately resolved.

Private endpoints with a missing token will resolve in a [401](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401) or redirect to the login form.

Thereafter the signiture of the token will be verified. Failing to verify signature will resolve in a 401 or redirect.

Missing an email field in the decoded token with resolve in a 401 or redirect.

API token \(which do not expire\) are checked against the ACL. The token must match the token stored with the user account in the ACL. Failing to do so reolves in a 401 \(no redirect\).

Valid API token are internally replaced with a PRIVATE access token which expires in 10 seconds.

Admin level token are checked last. Routes which require administrative access will resolve in a 401 or redirect if the token has insufficient access privileges.

1. **decode token**

   If exists a user token will be decoded from the request cookie or request parameter \(in case the request is generated without the capability to assign cookies\).

2. **no token**

   Fail. _No user token found in request._ Authentication will fail if no decoded token exists at this stage. An anonymous user token and a session token with the request URL as redirect will be signed to the response.

3. **token timeout**

   Fail. _Session timeout._ The time from when the token was issued at \(iat\) is compared to the current time to establish the token's age. The authentication will fail if the token's age exceeds the timeout limit.

4. **no admin**

   Fail. _Admin authorization required for the requested route._ This stage is only checked for requests to endpoints which require admin level authorization. Authorization will fail if the user token does not carry admin privileges.

5. **no email**

   Fail. _Email not defined in token._ Authorization will fail at this stage if the user token does not carry an email field in the payload.

6. **user not verified**

   Fail. _User email not verified._ Authorization will fail if the user token does not carry information that the account email has been verified.

7. **user not approved**

   Fail. _User email not approved by administrator._ Authorization will fail at this stage if the user token does not carry the _approved_ field.

8. **issue new token**

   Success. Authorization has completed and the user token's issue at value \(iat\) is updated with the current time, signed to the response, and finally passed on to the _done\(\)_ callback.

