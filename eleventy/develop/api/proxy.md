---
title: Proxy

layout: root.html
---

# XYZ Proxy

The XYZ [proxy module](https://github.com/GEOLYTIX/xyz/blob/development/mod/proxy.js) will match a url defined as a request parameter.

Keys defined as template parameter will be substituted if matched with keys defined as process environment variables.

The request with the substituted key parameter will then be piped to the client.

```js
  const _url = req.url.match(/\?.*/)

  if (!_url[0]) return

  // Find variables to be substituted.
  const url = _url[0].substring(1).replace(/\$\{(.*?)\}/g,

    // Substitute matched variable with key value from process environment.
    matched => process.env[`KEY_${matched.replace(/\$|\{|\}/g, '')}`] || matched)

  const proxy = https.request(url, _res => {
    res.writeHead(_res.statusCode, _res.headers)
    _res.pipe(res, {
      end: true
    })
  })

  req.pipe(proxy, {
    end: true
  })
```

## Mapp Proxy

The Mapp [proxy module](https://github.com/GEOLYTIX/xyz/blob/development/lib/proxy.mjs) will return a promise of a XHR request to the XYZ proxy module.

Proxied requests can be sent through the Mapp library proxy method. The request will either be rejected with an error message or resolve with query response.

Within the [Mapp gazetteer module](https://github.com/GEOLYTIX/xyz/blob/development/lib/gazetteer.mjs) this is used to request place details from the Google Places API.

```js
_xyz
  .proxy(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${record.id}&\${GOOGLE}`)
  .then(response => {
    const feature = {
      type: 'Point',
      coordinates: [response.result.geometry.location.lng, response.result.geometry.location.lat]
    }
    
    gazetteer.createFeature(feature)
    
    if (gazetteer.callback) return gazetteer.callback(feature);
    
    record.callback && record.callback(feature)
})
```