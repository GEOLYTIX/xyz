# Strategy

_fastify-auth_ does not provide an authentication strategy. The strategy which is applied by the authToken\(\) function will be detailed in this section.

Requests will be passed on if the authentication succeeds. A redirect to the login will be sent if the authentication fails. A fail message will be assigned to the status field in the user token. A [401 http code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/401) will be assigned to the response of a requests which fails to authenticate. Redirection can be surpressed with the _noredirect_ parameter on the request. This allows for API calls from the client application to not receive a redirect response but only a fail message. The application interface will be masked if a request fails to authenticate.

The individual steps in the authentication strategy sequence are as follows.

1. **no login**

   Success. An anonymous user token and empty session token will be signed and sent to the client if no login is required.

2. **decode token**

   If exists a user token will be decoded from the request cookie or request parameter \(in case the request is generated without the capability to assign cookies\).

3. **no token**

   Fail. _No user token found in request._ Authentication will fail if no decoded token exists at this stage. An anonymous user token and a session token with the request URL as redirect will be signed to the response.

4. **token timeout**

   Fail. _Session timeout._ The time from when the token was issued at \(iat\) is compared to the current time to establish the token's age. The authentication will fail if the token's age exceeds the timeout limit.

5. **no admin**

   Fail. _Admin authorization required for the requested route._ This stage is only checked for requests to endpoints which require admin level authorization. Authorization will fail if the user token does not carry admin privileges.

6. **no email**

   Fail. _Email not defined in token._ Authorization will fail at this stage if the user token does not carry an email field in the payload.

7. **user not verified**

   Fail. _User email not verified._ Authorization will fail if the user token does not carry information that the account email has been verified.

8. **user not approved**

   Fail. _User email not approved by administrator._ Authorization will fail at this stage if the user token does not carry the _approved_ field.

9. **issue new token**

   Success. Authorization has completed and the user token's issue at value \(iat\) is updated with the current time, signed to the response, and finally passed on to the _done\(\)_ callback.

