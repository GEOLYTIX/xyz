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

### /api/user/pgtable

Given the rights to create tables in the ACL database schema the `api/user/pgtable` endpoint may be used to create a new ACL table. A table will only be created if none exists yet. The newly created ACL will have one admin user admin@geolytix.xyz with the password 'admin123'. You are advised to register a new account immediately. Assign admin rights to the new account and thereafter delete the admin@geolytix.xyz account.