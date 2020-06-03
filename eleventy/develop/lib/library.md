---
title: Library
tags: [develop]
layout: root.html
orderPath: /develop/lib/_library
---

# XYZ Library

The XYZ application control, control, or client library is the recommended way to interact with the XYZ API.

The library is compiled as a javascript bundle which may be added as a HTML script tag. Once added the library will execute and assign itself as _xyz to the window.global.

The _xyz method exported from the [index.mjs](https://github.com/GEOLYTIX/xyz/blob/master/lib/index.mjs) will initialise a _xyz object in the browser. The _xyz object is passed to a callback in the _xyz method or can be awaited in an async closure.

The library uses a factory design pattern with objects being created by assigning input params to object literals.

The structure of modules in the /lib directory follows the structure of the _xyz object. The individual module methods will be discussed in this section of the documentation.