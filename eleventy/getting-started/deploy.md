---
title: Deployments
tags: [getting-started]
layout: root.html
---

## Deploying serverless functions to Vercel

The XYZ host was designed to be deployed as Serverless Functions. By keeping memory uptake and the total number of functions to a minimum it is possible to deploy XYZ for free on Vercel's Hobby plan.

A command line interface must be installed in order to deploy to the Now platform.

```
npm i -g vercel
```

With the CLI installed and logged in to a valid Vercel account it is possible to deploy a zero config XYZ host by typing `vercel` in the project root. For successive deployments it is necessary to set a production flag in order to bring the latest deployment to production.

```
vercel --prod
```

The project will be deployed and build according to the [now.json](https://github.com/GEOLYTIX/xyz/blob/master/now.json) which is located in the project's root.

```
{
  "version": 2,
  "regions": [
    "lhr1"
  ],
  "builds": [
    {
      "src": "/public/**",
      "use": "@now/static"
    },
    {
      "src": "/docs/**",
      "use": "@now/static"
    },
    {
      "src": "/api/*.js",
      "use": "@now/node",
      "config": {
        "includeFiles": [
          "public/**"
        ]
      }
    }
  ],
  "trailingSlash": false,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; base-uri 'self'; object-src 'self'; worker-src 'self' blob:; frame-src 'self' www.google.com www.gstatic.com; form-action 'self'; style-src 'self' 'unsafe-inline' fonts.googleapis.com cdn.jsdelivr.net; font-src 'self' fonts.gstatic.com cdn.jsdelivr.net; script-src 'self' 'unsafe-inline' www.google.com www.gstatic.com cdn.jsdelivr.net blob:; img-src 'self' api.ordnancesurvey.co.uk *.tile.openstreetmap.org api.mapbox.com res.cloudinary.com *.global.ssl.fastly.net raw.githubusercontent.com cdn.jsdelivr.net gitcdn.xyz data:"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/query/:_template?",
      "destination": "/api/query.js"
    },
    {
      "source": "/api/provider/:provider?",
      "destination": "/api/provider.js"
    },
    {
      "source": "/api/layer/:format?/:z?/:x?/:y?",
      "destination": "/api/layer.js"
    },
    {
      "source": "/api/location/:method?",
      "destination": "/api/location.js"
    },
    {
      "source": "/api/workspace/:method?/:key?",
      "destination": "/api/workspace.js"
    },
    {
      "source": "/api/user/:method?/:key?",
      "destination": "/api/user.js"
    },
    {
      "source": "/api/(.*)",
      "destination": "/api/$1.js"
    },
    {
      "source": "/docs/(.*)",
      "destination": "/docs/$1/$2"
    },
    {
      "source": "/docs",
      "destination": "/docs/index.html"
    },
    {
      "source": "/(public|workspaces|views|css|js|icons)/(.*)",
      "destination": "/public/$1/$2"
    },
    {
      "source": "/view/:_template?/:access?",
      "destination": "/api/view.js"
    },
    {
      "source": "/:access?",
      "destination": "/api/view.js"
    },
    {
      "source": "/",
      "destination": "/api/view.js"
    }
  ]
}
```

Environment settings for Now deployments may be added as an env block to the now.json.