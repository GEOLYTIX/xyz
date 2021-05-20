window.onload = () => {

  // Assign location origin as host.
  const params = {
    host: window.location.origin,
  }

  // Take hooks from URL and store as current hooks.
  // It should be possible to override params.host.
  window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (match, key, value) => {
    params[key] = decodeURI(value);
  })

  const xyz = _xyz({
    host: params.host + document.head.dataset.dir,
    hooks: true
  })

  // Define locations list and selectCallback.
  xyz.locations.list = [
    {
      style: { strokeColor: '#090', strokeWidth: 2 },
      colorFilter: 'invert(22%) sepia(80%) saturate(1933%) hue-rotate(272deg) brightness(97%) contrast(104%)'
    }
  ]

  xyz.locations.selectCallback = location => {

    xyz.mapview.popup.create({
      coords: location.marker,
      content: xyz.locations.view.infoj(location),
      autoPan: true
    })

  }

  // Load locale if defined
  if (params.locale) return getLocale(params.locale)

  // Load first locale if no locale has been defined.
  xyz.workspace.get.locales().then(locales => {

    if (!locales.length) return console.log('No accessible locales')

    getLocale(locales[0].key)
  })

  function getLocale(locale) {

    xyz.workspace.get.locale({
      locale: locale
    }).then(locale => {
      xyz.locale = locale
      createMap()
    })

  }

  function createMap() {

    xyz.mapview.create({
      target: document.getElementById('Map'),
      scrollWheelZoom: true,
      attribution: {
        target: document.getElementById('_Attribution'),
        links: {
          ['XYZ v'+xyz.version]: 'https://geolytix.github.io/xyz',
          Openlayers: 'https://openlayers.org'
        }
      }
    })

    xyz.plugins()
      .then(() => xyz.layers.load(xyz.hooks.current.layers))
      .then(() => {

        xyz.hooks.current.locations.forEach(_hook => {

          let hook = _hook.split('!');

          xyz.locations.select({
            locale: xyz.workspace.locale.key,
            layer: xyz.layers.list[decodeURIComponent(hook[0])],
            table: hook[1],
            id: hook[2]
          })

        })

      })
      .catch(error => console.error(error))

  }

}