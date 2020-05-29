---
title: Security
tags: [develop]
layout: root.html

---

We are using the [fastify-auth](https://github.com/fastify/fastify-auth) module for authentication in XYZ. All authentication is handled by the [auth.js](https://github.com/GEOLYTIX/xyz/blob/master/auth.js) module.

By setting the access key \(PUBLIC or PRIVATE\) in the [**environmental settings**](../../environment-settings/) with a PostgreSQL connection string \(plus a table name separated by a \| pipe\) it is possible to restrict access. The access control list \(ACL\) table must be stored in a PostgreSQL database.

If set to PRIVATE a login is required to open the application or access any endpoint. If set to public login is optional for routes which are not restricted for administrator. Admin routes are not available if no ACL is provided. Without the admin route all changes to the settings need to be done in the code repository or database.

An ACL must have following table schema:

```sql
create table if not exists users
(
	"_id" serial not null,
	email text not null,
	password text not null,
	verified boolean,
	approved boolean,
	admin boolean,
	verificationtoken text,
	approvaltoken text,
	failedattempts integer default 0,
	password_reset text,
	api text
);
```

We are using a javascript implementation of the OpenBDS [Blowfish \(cipher\)](https://en.wikipedia.org/wiki/Blowfish_%28cipher%29) to encrypt passwords at rest in the ACL. The [login](https://github.com/GEOLYTIX/xyz/blob/master/views/login.html) and [register](https://github.com/GEOLYTIX/xyz/blob/master/views/register.html) views use [input form validation](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email#Validation) for the email \(max 50 character\) and password \(min 8 character\). These are also validated on the backend.