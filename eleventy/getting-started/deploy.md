---
title: Deployments
tags: [getting-started]
layout: root.html
---

## Deploying serverless functions to Vercel

The XYZ host was designed to be deployed as a Serverless Function. By keeping memory uptake to a minimum it is possible to deploy XYZ on [Vercel's free Hobby plan](https://vercel.com/pricing).

A command line interface must be installed in order to deploy to Vercel.

```
npm i -g vercel
```

With the CLI installed and logged in to a valid Vercel account it is possible to deploy a zero config XYZ host by typing `vercel` in the project root. For successive deployments it is necessary to set a production flag in order to bring the latest deployment to production.

```
vercel --prod --force
```

The `--force` option ensures that the build directories are overwritten. This may be required to force the workspace to change accross all process invocations.

### Configuration (vercel.json)

The project will be deployed and build according to the [vercel.json](https://github.com/GEOLYTIX/xyz/blob/master/vercel.json) which is located in the project's root.

```
{
  "version": 2,
  "regions": [
    "lhr1"
  ],
  "build": {
    "env": {
      "NODE_ENV": "production"
    }
  },
  "functions": {
    "api/api.js": {
      "includeFiles": "public/**"
    }
  },
  "trailingSlash": false,
  "headers": [{
    "source": "/(.*)",
    "headers": [{
        "key": "Access-Control-Allow-Origin",
        "value": "*"
      },
      {
        "key": "Cache-Control",
        "value": "no-cache"
      },
      {
        "key": "Access-Control-Allow-Headers",
        "value": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With"
      },
      {
        "key": "Content-Security-Policy",
        "value": "default-src 'self'; base-uri 'self'; object-src 'self'; connect-src 'self' *.maptiler.com *.mapbox.com; worker-src 'self' blob:; child-src 'self' blob:; frame-src 'self' www.google.com www.gstatic.com; form-action 'self'; style-src 'self' 'unsafe-inline' fonts.googleapis.com cdn.jsdelivr.net; font-src 'self' fonts.gstatic.com cdn.jsdelivr.net; script-src 'self' 'unsafe-inline' api.mapbox.com www.google.com www.gstatic.com cdn.jsdelivr.net blob:; img-src 'self' geolytix.github.io api.ordnancesurvey.co.uk *.tile.openstreetmap.org api.mapbox.com res.cloudinary.com *.global.ssl.fastly.net raw.githubusercontent.com cdn.jsdelivr.net gitcdn.xyz data:"
      }
    ]
  }],
  "rewrites": [{
      "source": "/(workspaces|views|css|js|icons)/(.*)",
      "destination": "/$1/$2"
    },
    {
      "source": "/api/query/:_template?",
      "destination": "/api/api.js"
    },
    {
      "source": "/api/location/:method?",
      "destination": "/api/api.js"
    },
    {
      "source": "/api/user/:method?/:key?",
      "destination": "/api/api.js"
    },
    {
      "source": "/api/workspace/:method?/:key?",
      "destination": "/api/api.js"
    },
    {
      "source": "/api/layer/:format?/:z?/:x?/:y?",
      "destination": "/api/api.js"
    },
    {
      "source": "/api/provider/:provider?",
      "destination": "/api/api.js"
    },
    {
      "source": "/api/(.*)",
      "destination": "/api/api.js"
    },
    {
      "source": "/view/:_template?/:access?",
      "destination": "/api/api.js"
    },
    {
      "source": "/:access?",
      "destination": "/api/api.js"
    },
    {
      "source": "/",
      "destination": "/api/api.js"
    }
  ]
}
```

Rewrites are required for url path parameter to be passed to the api process.

Headers allow the configuration of request header on all requests. These can be overwritten for individual requests prior to sending a response back to the client from inside the serverless function execution.

## Content Security Policies (CSP)

[CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) directives defined on the header define how the API may be accessed and which sources are valid for client applications. The default directives are:

*default-src:* 'self'

*base-uri:* 'self'

*object-src:* 'self'

*connect-src:* 'self' *.maptiler.com *.mapbox.com; worker-src 'self' blob:

*child-src:* 'self' blob:

*frame-src:* 'self' www.google.com www.gstatic.com

*form-action:* 'self'

*style-src:* 'self' 'unsafe-inline' fonts.googleapis.com cdn.jsdelivr.net

*font-src:* 'self' fonts.gstatic.com cdn.jsdelivr.net

*script-src:* 'self' 'unsafe-inline' api.mapbox.com www.google.com www.gstatic.com cdn.jsdelivr.net blob:

*img-src:* 'self' geolytix.github.io api.ordnancesurvey.co.uk *.tile.openstreetmap.org api.mapbox.com res.cloudinary.com *.global.ssl.fastly.net raw.githubusercontent.com cdn.jsdelivr.net gitcdn.xyz data:

Environment settings for Now deployments may be added as an env block to the vercel.json.