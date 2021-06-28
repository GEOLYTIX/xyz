---
title: Provider
layout: root.html
---

# Provider API

The XYZ [provider module](https://github.com/GEOLYTIX/xyz/blob/development/mod/provider/_provider.js) is a collection of modules which allow requests to 3rd party provider.

The provider modules themselves are in the same mod folder. Requests for these provider may not be proxied due to specific requirements in regards to keys and auxiliary libraries.

The Cloudfront and Github provider may both be used to request workspaces and workspace templates.

## Cloudfront

The [Cloudfront provider module](https://github.com/GEOLYTIX/xyz/blob/development/mod/provider/cloudflare.js) makes use of the AWS-SDK and requires a Cloudfront encryption key in order to request protected ressources stored with the AWS Cloudfront platform.

## Cloudinary

The [Cloudinary provider module](https://github.com/GEOLYTIX/xyz/blob/development/mod/provider/cloudinary.js) uses the [Cloudinary API module](https://www.npmjs.com/package/cloudinary) to upload images or documents provided as a post body to the Cloudinary API.