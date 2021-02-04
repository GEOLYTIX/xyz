---
title: User

layout: root.html
---

# User API

The User API allows to register, verify, and aprove user accounts. With access to the access control list (ACL) the User API may issue or revoke cookies with signed token (JWT) to provide secure access to other XYZ APIs. The User API requires a method value as URL parameter.

The different methods are following.

### /api/user/token

Will return the signed token from a XYZ Cookie set in the HTTP request header. The request will be redirected to the login form if no Cookie with a valid signed token was sent with the request.

### /api/user/coookie

Will return the textual representation of a HTTP Cookie if accessed as a *GET* request. The request will be redirected to the login form if no cookie is found on the request header. A new cookie will be set on the response header to a *POST* request after the login information in the request body has been checked against a user record in the ACL.

### /api/user/key

Will generate and respond with an API key if enabled for a user account.

### /api/user/log?email=dennis.bauszus@geolytix.co.uk

Returns an array of logins for the user. User accounts are looked up by their email address in the ACL. The log array will store the date time of every login and if possible the IP address of the login request.

### /api/user/logout

Will set a response header Cookie with a max age of 0 and a NULL token value. This will overwrite any existing XYZ Cookie effectively requiring the user to login in order to create a new Token/Cookie.