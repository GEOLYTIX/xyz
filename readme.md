# Introduction

A [Node.js](https://nodejs.org) framework to develop applications and APIs for spatial data.

tl;dr Here is a public accessible deployment hosted on [Zeit Now](https://zeit.co/now).

\*\*\*\*[**https://geolytix.xyz/open**](https://geolytix.xyz/open)\*\*\*\*

The XYZ framework is designed to serve spatial data from [PostGIS](https://postgis.net) data sources without the need of additional services. The framework is modular with dependencies on third party open source modules such as the open GIS engine [Turf](https://github.com/Turfjs/turf), the [Leaflet](https://github.com/Leaflet/Leaflet) javascript engine for interactive maps and [Google Puppeteer](https://github.com/GoogleChrome/puppeteer) to create server-side PDF reports.

XYZ is build with a [PfaJn stack](https://medium.com/@goldrydigital/a-fine-pfajn-stack-to-put-maps-on-the-web-bf1a531cae93) which uses the [Fastify](https://www.fastify.io) web server and [JsRender](https://www.jsviews.com) for server side rendering of views.

The code repository should work out of the box \(zero-configuration\) as [serverless deployments with Zeit Now](https://medium.com/@goldrydigital/the-zeit-is-now-for-serverless-web-mapping-77edebfaf17e).

