---
title: Authentication
tags: [develop]
layout: root.html
---

# Authentication Strategy

The XYZ process environment can be either PRIVATE or PUBLIC. In a PRIVATE environment ALL requests must be validated. In a PUBLIC environment only requests with elevated access must be validated.


## Access Control Lists (ACL)

The Access Control List (ACL) is a PostgreSQL table which stores user accounts and their priviliges. In the XYZ process environment the PRIVATE or PUBLIC key value must be a PostgreSQL connection with rights to read, update, and create records in the ACL table.

This is the PostgreSQL table schema for the ACL.

```sql
CREATE TABLE acl_schema.acl_table (
  "_id" serial not null,
  email text not null,
  password text not null,
  verified boolean default false,
  approved boolean default false,
  verificationtoken text,
  approvaltoken text,
  failedattempts integer default 0,
  password_reset text,
  api text,
  approved_by text,
  access_log text[] default '{}'::text[],
  blocked boolean default false,
  roles text[] default '{}'::text[],
  admin boolean default false,
  language text default 'en'
);
```


## Registration

[mod/user/register.js](https://github.com/GEOLYTIX/xyz/blob/master/mod/user/register.js)

A post request for user ragistration must contain a valid email address, an ecrypted password, and the `register=true` flag in the request body.

The requested user account will be added as a new record to the ACL.

A get request to the user registration endpoint will return a view with a registration form to make the post request. Opening the registration view will remove the XYZ cookie. Language specific registration view templates are in [/public/views/register](https://github.com/GEOLYTIX/xyz/tree/master/public/views/register).

Any get request with the url parameter `register=true` will short circuit the api script to return the registration view.


## Verification

[mod/user/verify.js](https://github.com/GEOLYTIX/xyz/blob/master/mod/user/verify.js)

The XYZ host will send an email with a verification token to the registered account email. The link containing the verification token must be followed in order to **verify ownership of the account**.

### Password reset

The **user registration form** can be used to reset a users password. Registering an existing email account will remove account verification and sent a new verification token to the registered email account. The new password will be stored in a seperate field and only become the password once the account has been verified by the account holder.

Password resets will reset the number of failed login attempts.

**Password reset is not possible with a blocked account.**

### Approval

[mod/user/approve.js](https://github.com/GEOLYTIX/xyz/blob/master/mod/user/approve.js)

Following verification an email with an approval token will be sent to all site administrators.

Any one administrator must follow the link to **approve a verified account**.

An email will be sent to the account owner with information in regards to the account approval.


## Login

[mod/user/login.js](https://github.com/GEOLYTIX/xyz/blob/master/mod/user/login.js)

A post request for user login must contain a valid email address, an ecrypted password, and the `login=true` flag in the request body.

A get request to the user login endpoint will return a view with a login form to make the post request. Opening the login view will remove the XYZ cookie. Language specific login view templates are in [/public/views/login](https://github.com/GEOLYTIX/xyz/tree/master/public/views/login).

Any get request with the url parameter `login=true` will short circuit the api script and return the login view.

### Expired accounts

Accounts may expire if set in the process environment.

**Admin accounts will not expire.**

An account will expire when the login date exceeds the approval date by more than the expiry limit set in the process environment (APPROVAL_EXPIRY).

### Failed login attempts

A login will fail if the provided password does not match the stored password. This will increased the counter for failed logins. An account will be locked if the number of failed attempts exceeds the limit set in the process environment (FAILED_ATTEMPTS).

### Locked accounts

A locked account is simply an account with too many failed login attempts. This will remove the verification flag on the ACL record and issue a new verification mail. Locked accounts retain their administrator approval and password.

### Blocked accounts

An account which has been flagged as blocked may have administrator approval as well as verification but can no longer be used for login nor password resets.

### Login redirects

The login post request will redirect a successful login to the URL provided as redirect in the login post body.

### Logout

The `logout=true` request parameter on any route will shortcircuit the api method and remove a session cookie by setting a cookie with the value null and expiry 0.


## Cookies

A successful login will create a cookie with a signed user token. The cookie has an expiry of 8 hours and will be set on the response header.

The value from the `TITLE` process environment key is used as name for the cookie.

The value from the `DIR` process environment key is used as path for the cookie.

![](https://res.cloudinary.com/geolytix-xyz/image/upload/v1589878516/documentation/geolytix-dev-cookie.png)

The cookie value itself is a signed token.

### Token

A JSON Web Token ([JWT](https://jwt.io/)) consist of three parts, the header, payload, and signature.

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImRlbm5pcy5iYXVzenVzQGdlb2x5dGl4LmNvLnVrIiwibGFuZ3VhZ2UiOiJlbiIsInJvbGVzIjpbImdseCIsImVuIl0sImlhdCI6MTYwNjk5MzU0MCwiZXhwIjoxNjA3MDIyMzQwfQ.GSqDpYBTWRCPRl-gc-I7evTQmjo4E7Qfc1hkMydUCNA
```

The payload of an XYZ token is an encrypted user object.

```json
{
  "email": "dennis.bauszus@geolytix.co.uk",
  "language": "en",
  "roles": [
    "glx",
    "en"
  ],
  "iat": 1606993540,
  "exp": 1607022340
}
```

The payload can be decrypted without knowing the secret which has been used to sign the token. Validation of a token's signature is only possible with knowledge of the SECRET which has been used to sign the token. **The SECRET is provided in the XYZ process environment and must never be made public.**

A token will expire after 8 hours. A token signature can not be validated after the token has expired.

### Token login

A cookie will be generated from a token and set on the response header. The cookie expiry will match the expiry of the token.

### API key

An API key is a token which will not expire. The API key must be stored in the ACL. Generating a new API key will overwrite the existing API key. Request with an API key as token will check whether the provided key matches the stored key. 

Removing the key in the ACL will therefore invalidate a key.

API keys are invalid if the associated account is blocked.

A cookie generated from an API key will expire in 8 hours.

### Auth process

[mod/user/auth.js](https://github.com/GEOLYTIX/xyz/blob/master/mod/user/auth.js)

The auth process checks the signature of token from a cookie or provided as URL parameter. The auth process will set a cookie if the token has been provided as URL parameter.