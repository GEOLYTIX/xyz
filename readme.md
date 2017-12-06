# XYZ

A Node.js framework to develop applications and APIs for spatial data.

## Introduction

The XYZ framework is designed around the idea to serve spatial data from various sources. The framework is modular with dependencies on third party open source modules such as the open GIS engine [Turf](http://turfjs.org/) and the authentication middleware [Passport](http://www.passportjs.org/).

## Licence

*tbc*

## Security

Access to any method or data source served through the XYZ framework can be restricted through the authentication middleware [Passport](http://www.passportjs.org/). The [passport-local](https://github.com/jaredhanson/passport-local) strategy in combination with cookie sessions is used as default authentication method. *The implementation of JSON Web Tokens is planned for a future feature release.*  

The default strategy uses a local MongoDB database in which users account are registered. XYZ endpoints allow for accounts to be created, removed, authenticated, approved and authorized.  

User accounts consist of an email address and password only. It is possible to create user accounts which are not email addresses. These accounts must be authenticated by an administrator or directly in the database.  

**Authentication** is the process of ascertaining that somebody really is who he claims to be. Once a user creates a new account an automated email will be sent from the passport module to the email address provided by the user. This email contains a link which is valid for 1 hour. Users authenticate accounts by following the link and thus proving that they have access to the email account which has been provided in the registration request.

Account **approval** is an administrative process. Adminstrator accounts can send requests to the passport middleware that they recognise the email address of an account and approve access for the account.

## Modules

## Frontend

## API

## Settings

### Launch Settings

### Application Settings


