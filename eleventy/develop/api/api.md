---
title: API

layout: root.html
group: true
orderPath: /develop/api/_api
---

# XYZ APIs

The [api script](https://github.com/GEOLYTIX/xyz/blob/development/api/api.js) is the entry point for XYZ requests.

*Requests will be terminated immediately if received from Internet Explorer client.*

Request params will be assigned from the params and query property of the request object to support hosting via Express and through Vercel.

The language parameter will be set to English [en] if not explicitly set in the request.

Parameter strings will be URI decoded.

A logger method will be assigned to the params object to be available with the request object.

### Login / Register

Either request param will short circuit the api script an return the associated method. The login and register method will either process the request body if either the `login` or `register` flag are set in the request body, or return a view with a request form to submit a post request for the associated method.

### Logout

The logout request parameter flag will short circuit the api script, remove any asscoiated cookie and redirect the request with the logout flag removed from the request URL.

### Authentication

Request authentication will check for a token parameter or cookie, validate the signature, and return the user information to the api script.

The token will be removed from the request params.

The cookie will be removed and the login view will be returned with an error messgae if the authentication method returns an error.

The request will terminate without a valid user in a PRIVATE process environment and return the login view.

### Proxy requests

Proxy requests are short circuited as they only need authentication for PRIVATE process environments and the environment keys themselves for parameter substitution in the proxied request.

### Workspace

The workspace will be retrieved after successfull authentication to account for user roles.

A `500` error will be returned with an error message if the workspace method fails to evaluate a workspace obejct.

### Query & View templates

A template will be retrieved from the workspace if defined as request parameter.

A `404` will be returned if the defined template could not found in the workspace. This may be due to role restrictions.

A `500` will be returned with an error message if the workspace was unable to retrieve the template. This may be caused by JSON exceptions or a faulty source for the template.

The login form will be returned if the requested template has restricted access not met by the user object.

### API path

The path segment will be avaluated from the request URL. This allows for routing requests to the individual API modules.

### User API

Many User API methods require admin priviliges. The login view will be returned if access priviliges are not me by the user.

### Route matching

An API method will be returned the path segment of the request URL can be matched.

### Default route / [root]

The default Mapp view template will be assigned as template parameter for the View API to be returned on the root route.