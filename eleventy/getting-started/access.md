---
title: Access
tags: [getting-started]
layout: root.html 
---

# Access

Access to the XYZ API is by default open without the possibility of administrative access.

## PUBLIC

`"PUBLIC": "postgres://username:password@123.123.123.123:5432/database|schema.table"`

Public access with a [pg-connection-string](https://github.com/iceddev/pg-connection-string) which references a PostgreSQL ACL keeps the API open but allows for users to login with elevated access defined by the user accounts' roles and admin rights.

## PRIVATE

`"PRIVATE": "postgres://username:password@123.123.123.123:5432/database|schema.table"`

Setting the PRIVATE access key in the environment settings requires authentication via token for every request sent to the API.

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
  admin_workspace boolean default false,
  admin_user boolean default false
);
```

In order for the XYZ to send confirmation emails and notifications it is required to define a SMTPS account which is capable of sending emails on behalf of the host. The SMTPS connection is defined as value for the `TRANSPORT` environment key.

`"TRANSPORT": "smtps://xyz%40geolytix.co.uk:password@smtp.gmail.com"`

A domain alias may be defined to overwrite the [host value from the request header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Host) in mails send from the XYZ. This may be useful where domain rewrites are used.

`"ALIAS": "geolytix.xyz"`

## User Registration

The User registration form will submit a post query to the User API in order to register a new User record with an encrypted password.

The host will send an email with a verification token to the registered account email. The link containing the verification token must be opened in order to **verify ownership of the email account**.

After the account has been verified by its owner a second email with an approval token will be sent to all registered site administrators. Any one **administrator must follow the link to approve the newly verified account**.

Emails will be sent to inform whether an account has been deleted or approved by an administrator.

## Password reset

The **user registration form** can be used to reset a users password. Registering an existing email account will sent a new verification token to the registered email account. The new password will be live once the email account has been verified by its owner.

Resetting the password will also reset the number of failed login attempts.

## Failed logins / Locking User Accounts

By default accounts will be locked after 3 failed login attempts. Administrator may lock accounts at any time through the User API or the User Admin Panel. Setting the `FAILED_ATTEMPTS` environment key may change the maximum number of failed attempts.

`"FAILED_ATTEMPTS": "3"`

## Secrets

A secret must be set in the environment settings for signing web token. More complex secrets harden signatures against brute force attempts to find the secret itself.

`"SECRET": "ChinaCatSunflower"`

## JSON Web Token

JWT issued by the XYZ host are signed and valid for 8 hours. The payload of the token carries information about the user account for which the token was generated.

```
{
  "email": "dennis.bauszus@geolytix.co.uk",
  "admin_user": true,
  "admin_workspace": true,
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