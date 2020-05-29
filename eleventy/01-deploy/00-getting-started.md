---
title: Getting started
tags: [deploy, root]
layout: root.html

---

## Getting started

Start by cloning the XYZ repository from GEOLYTIX' public GitHub repository.

```
git clone https://github.com/GEOLYTIX/xyz
```

From the XYZ root, type `npm install` to install the required node_modules as defined by the [package.json](https://github.com/GEOLYTIX/xyz/blob/master/package.json).

The [express.js](https://github.com/GEOLYTIX/xyz/blob/master/express.js) script can be run by node to start a zero config XYZ host on port 3000.

```
node express.js
```

The default view can now be opened on localhost:3000.

![](https://res.cloudinary.com/geolytix-xyz/image/upload/v1589814155/documentation/node_express_v54ufm.png)

[Dotenv](https://www.npmjs.com/package/dotenv) is installed by default. This allows for the environment variables to be defined in a .env file in the XYZ root.

If opened with Visual Studio code the environment variables may be defined in the vscode/.launch configuration.