---
title: Authentication
tags: [develop]
layout: root.html
group: true
orderPath: /develop/security/_authentication
---

# Authentication Strategy

All API requests must pass through the user auth module. Requests may be passed on to the API handler if the API is public or if a cookie with a valid signature is set on the request header.

## Access Control Lists (ACL)

The Access Control List \(ACL\) is a PostgreSQL table which stores user accounts identified by a valid email address, encrypted passwords, and roles.

The PostgreSQL user defined in the ACL connection string must have rights to read, update, and create records in the ACL table.

Given the rights to create tables in the ACL database schema the `api/user/pgtable` endpoint may be used to create a new ACL table. A table will only be created if none exists yet. The newly created ACL will have one admin user admin@geolytix.xyz with the password 'admin123'. You are advised to register a new account immediately. Assign admin rights to the new account and thereafter delete the admin@geolytix.xyz account.

Give the necessary roles to the PostgreSQL account defined in the environment settings the backend will generate a new ACL table from this schema.

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

The User registration form will submit a post query to the User API in order to register a new User record with an encrypted password.

The host will send an email with a verification token to the registered account email. The link containing the verification token must be opened in order to **verify ownership of the email account**.

After the account has been verified by its owner a second email with an approval token will be sent to all registered site administrators. Any one **administrator must follow the link to approve the newly verified account**.

Emails will be sent to inform whether an account has been deleted or approved by an administrator.

## Password reset

The **user registration form** can be used to reset a users password. Registering an existing email account will sent a new verification token to the registered email account. The new password will be live once the email account has been verified by its owner.

Resetting the password will also reset the number of failed login attempts.

## JSON Web Token

JWT issued by the XYZ host are signed and valid for 8 hours. The payload of the token carries information about the user account for which the token was generated.

```
{
  "email": "dennis.bauszus@geolytix.co.uk",
  "admin": true,
  "key": null,
  "roles": [],
  "iat": 1589877546,
  "exp": 1589906346
}
```

The **/api/user/token** endpoint may be called to return a signed token.

The token may be provided as an URL parameter or with a named cookie.

## Cookies

Cookies are set in the request header upon successful login. A cookie is named according to the `TITLE` environment setting for the path defined in the `DIR` entry. The signed JWT is the content of the cookie. The cookie itself is only valid for 8 hours. The **/api/user/cookie** endpoint may be called to issue or revoke an existting cookie. The logout process will revoke an existing cookie of the same name. This is done by setting a cookie of the same name without content to expire immediately.

[Authentication strategy](/xyz/docs/develop/security/authentication)

![](https://res.cloudinary.com/geolytix-xyz/image/upload/v1589878516/documentation/geolytix-dev-cookie.png)