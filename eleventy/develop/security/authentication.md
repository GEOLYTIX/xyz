---
title: Authentication
tags: [develop]
layout: root.html
group: true
orderPath: /develop/security/_authentication
---

# Authentication Strategy

The XYZ process environment can be either PRIVATE or PUBLIC. In a PRIVATE environment ALL requests must be validated. In a PUBLIC environment only requests with elevated access must be validated. Validated requests have a user object parameter with priviliges that match the request target.

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

## User Registration

A post request to the user registration endpoint must have an ecrypted password, a valid email address, and the `register=true` flag in the request body.

The requested user account will be added as a new record to the ACL.

A get request to the user registration endpoint will return a view with a registration form to make the post request. Opening the registration view will remove the XYZ cookie. Language specific registration view templates are in [this public directory](https://github.com/GEOLYTIX/xyz/tree/master/public/views/register).

User registration is handled in [this script module](https://github.com/GEOLYTIX/xyz/blob/master/mod/user/register.js).

### Account Verification

The XYZ host will send an email with a verification token to the registered account email. The link containing the verification token must be followed in order to **verify ownership of the account**.

### Account Approval

Following verification an email with an approval token will be sent to all site administrators. Any one administrator must follow the link to **approve a verified account**.

An email will be sent to account owner with information in regards to the account approval.

### Password reset

The **user registration form** can be used to reset a users password. Registering an existing email account will sent a new verification token to the registered email account. The new password will be live once the email account has been verified by its owner.

Resetting the password will also reset the number of failed login attempts.



## Token / API key

A JSON Web Token ([JWT](https://jwt.io/)) consist of three parts, the header, payload, and signature.

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImRlbm5pcy5iYXVzenVzQGdlb2x5dGl4LmNvLnVrIiwibGFuZ3VhZ2UiOiJlbiIsInJvbGVzIjpbImdseCIsImVuIl0sImlhdCI6MTYwNjk5MzU0MCwiZXhwIjoxNjA3MDIyMzQwfQ.GSqDpYBTWRCPRl-gc-I7evTQmjo4E7Qfc1hkMydUCNA
```

The payload of an XYZ token is an encrypted user object.

```JSON
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

An API key is a token which will not expire. The API key itself will be stored in the 

All API requests must pass through the user auth module which will attempt to validate the signature of a token/key or cookie.

## Cookies

Cookies are set in the request header upon successful login. A cookie is named according to the `TITLE` environment setting for the path defined in the `DIR` entry. The signed JWT is the content of the cookie. The cookie itself is only valid for 8 hours. The **/api/user/cookie** endpoint may be called to issue or revoke an existting cookie. The logout process will revoke an existing cookie of the same name. This is done by setting a cookie of the same name without content to expire immediately.

![](https://res.cloudinary.com/geolytix-xyz/image/upload/v1589878516/documentation/geolytix-dev-cookie.png)