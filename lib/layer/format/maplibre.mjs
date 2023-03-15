let promise, maplibregl = null

async function MaplibreGL() {

  if (maplibregl) return new maplibregl.Map(...arguments);

  if (!promise) promise = new Promise(async resolve => {

    if (window.maplibregl) {

      maplibregl = window.maplibregl

      resolve()
  
      return
    }

    Promise
      .all([
        import('https://cdn.skypack.dev/pin/maplibre-gl@v2.4.0-H4IHKk1NcQVlmkNN8f4I/mode=imports,min/optimized/maplibre-gl.js'),
      ])
      .then(imports => {
  
        maplibregl = imports[0]

        resolve()
      })
      .catch(error => {
        console.error(error.message)
        alert('Failed to load MaplibreGL library. Please reload the browser.')
      })
  
  })

  await promise

  return new maplibregl.Map(...arguments);
}

export default async layer => {

  layer.container = layer.mapview.Map.getTargetElement().appendChild(mapp.utils.html.node`
    <div class="maplibre" style="position: absolute; width: 100%; height: 100%;">`)

  layer.Map = await MaplibreGL({
    container: layer.container,
    style: layer.style.URL,
    attributionControl: false,
    boxZoom: false,
    doubleClickZoom: false,
    dragPan: false,
    dragRotate: false,
    interactive: false,
    keyboard: false,
    pitchWithRotate: false,
    scrollZoom: false,
    touchZoomRotate: false,
    preserveDrawingBuffer: layer.preserveDrawingBuffer,
    transformRequest: (url, resourceType) => {

      if (url.indexOf('mapbox:') === 0) {
        return transformMapboxUrl(url, resourceType, layer.accessToken)
      }
      
      // Do any other transforms you want
      return {url}
    }
  });

  layer.L =  new ol.layer.Layer({
    zIndex: layer.zIndex || 0,
    render: frameState => {

      if (!layer.display) return
      
      // adjust view parameters in mapbox
      layer.Map.jumpTo({
        center: ol.proj.toLonLat(frameState.viewState.center),
        zoom: frameState.viewState.zoom - 1,
        bearing: (-frameState.viewState.rotation * 180) / Math.PI,
        animate: false
      })

      return layer.container;
    }
  })

}

// transformMapboxUrl and supporting functions are taken from https://github.com/rowanwins/maplibregl-mapbox-request-transformer

function transformMapboxUrl(url, resourceType, accessToken) {
  
  if (url.indexOf('/styles/') > -1 && url.indexOf('/sprite') === -1) {
    return {
      url: normalizeStyleURL(url, accessToken)
    }
  }

  if (url.indexOf('/sprites/') > -1) {
    return {
      url: normalizeSpriteURL(url, accessToken)
    }
  }

  if (url.indexOf('/fonts/') > -1) {
    return {
      url: normalizeGlyphsURL(url, accessToken)
    }
  }

  if (url.indexOf('/v4/') > -1) {
    return {
      url: normalizeSourceURL(url, accessToken)
    }
  }

  if (resourceType === 'Source') {
    return {
      url: normalizeSourceURL(url, accessToken)
    }
  }
}

function parseUrl(url) {

  const parts = url.match(/^(\w+):\/\/([^/?]*)(\/[^?]+)?\??(.+)?/);

  if (!parts) {
    throw new Error('Unable to parse URL object');
  }

  return {
    protocol: parts[1],
    authority: parts[2],
    path: parts[3] || '/',
    params: parts[4] ? parts[4].split('&') : []
  };
}

function formatUrl(urlObject, accessToken) {

  const apiUrlObject = parseUrl('https://api.mapbox.com');

  urlObject.protocol = apiUrlObject.protocol;
  urlObject.authority = apiUrlObject.authority;
  urlObject.params.push(`access_token=${accessToken}`);

  const params = urlObject.params.length ? `?${urlObject.params.join('&')}` : '';

  return `${urlObject.protocol}://${urlObject.authority}${urlObject.path}${params}`;
}

function normalizeStyleURL(url, accessToken) {

  const urlObject = parseUrl(url);

  urlObject.path = `/styles/v1${urlObject.path}`;

  return formatUrl(urlObject, accessToken);
}

function normalizeGlyphsURL(url, accessToken) {

  const urlObject = parseUrl(url);

  urlObject.path = `/fonts/v1${urlObject.path}`;

  return formatUrl(urlObject, accessToken);
}

function normalizeSourceURL(url, accessToken) {

  const urlObject = parseUrl(url);

  urlObject.path = `/v4/${urlObject.authority}.json`;
  urlObject.params.push('secure');

  return formatUrl(urlObject, accessToken);
}

function normalizeSpriteURL(url, accessToken) {

  const urlObject = parseUrl(url);
  const path = urlObject.path.split('.');

  urlObject.path = `/styles/v1${path[0]}/sprite.${path[1]}`;

  return formatUrl(urlObject, accessToken);
}