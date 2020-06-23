window.onload = () => {

  if ('scrollRestoration' in history) history.scrollRestoration = 'auto'

  //move map up on document scroll
  document.addEventListener('scroll', () => document.getElementById('Map').style['marginTop'] = -parseInt(window.pageYOffset / 2) + 'px')

  const tabs = document.querySelectorAll('.tab')
  const locationsTab = document.getElementById('locations')
  const layersTab = document.getElementById('layers')

  tabs.forEach(tab => {
    tab.querySelector('.listview').addEventListener('scroll',
      e => {
        if (e.target.scrollTop > 0) return e.target.classList.add('shadow')
        e.target.classList.remove('shadow')
      })

    tab.onclick = e => {
      if (!e.target.classList.contains('tab')) return
      e.preventDefault()
      tabs.forEach(el => el.classList.remove('active'))
      e.target.classList.add('active')
    }
  })

  const xyz = _xyz({
    host: document.head.dataset.dir || new String(''),
    hooks: true
  })

  xyz.workspace.get.locales().then(getLocale)

  function getLocale(locales) {

    const locale = (xyz.hooks && xyz.hooks.current.locale) || locales[0]

    xyz.workspace.get.locale({
      locale: locale
    }).then(createMap)

    if (locales.length === 1) return

    const localeDropdown = xyz.utils.wire()`
    <div>
      <div class="listview-title secondary-colour-bg">Locales</div>
      <div>Show layers for the following locale:</div>
      <button
        class="btn-drop">
        <div
          class="head"
          onclick=${e => {
          e.preventDefault()
          e.target.parentElement.classList.toggle('active')
        }}>
        <span>${locale}</span>
        <div class="icon"></div>
      </div>
      <ul>${locales.map(
          locale => xyz.utils.wire()`<li><a href="${xyz.host + '?locale=' + locale}">${locale}`
        )}`

    layersTab.parentElement.insertBefore(localeDropdown, layersTab.parentElement.firstChild)
  }

  function createMap(locale) {

    xyz.locale = locale;

    xyz.mapview.create({
      target: document.getElementById('Map'),
      attribution: {
        logo: xyz.utils.wire()`
        <a
          class="logo"
          target="_blank"
          href="https://geolytix.co.uk"
          style="background-image: url('https://cdn.jsdelivr.net/gh/GEOLYTIX/geolytix/public/geolytix.svg');">`
      },
      scrollWheelZoom: true,
    })

    loadLayers(locale.layers)

    const btnZoomIn = xyz.utils.wire()`
    <button
      disabled=${xyz.map.getView().getZoom() >= xyz.locale.maxZoom}
      class="enabled"
      title="Zoom in"
      onclick=${e => {
        const z = parseInt(xyz.map.getView().getZoom() + 1)
        xyz.map.getView().setZoom(z)
        e.target.disabled = (z >= xyz.locale.maxZoom)
      }}><div class="xyz-icon icon-add">`

    document.querySelector('.btn-column').appendChild(btnZoomIn)

    const btnZoomOut = xyz.utils.wire()`
    <button
      disabled=${xyz.map.getView().getZoom() <= xyz.locale.minZoom}
      class="enabled"
      title="Zoom out"
      onclick=${e => {
        const z = parseInt(xyz.map.getView().getZoom() - 1)
        xyz.map.getView().setZoom(z)
        e.target.disabled = (z <= xyz.locale.minZoom)
      }}><div class="xyz-icon icon-remove">`

    document.querySelector('.btn-column').appendChild(btnZoomOut)

    xyz.mapview.node.addEventListener('changeEnd', () => {
      const z = xyz.map.getView().getZoom();
      btnZoomIn.disabled = z >= xyz.locale.maxZoom;
      btnZoomOut.disabled = z <= xyz.locale.minZoom;
    })

    document.querySelector('.btn-column').appendChild(xyz.utils.wire()`
    <button
      title="Zoom to area"
      onclick=${e => {
        e.stopPropagation()
        e.target.classList.toggle('enabled')

        if (e.target.classList.contains('enabled')) {

          return xyz.mapview.interaction.zoom.begin({
            callback: () => {
              e.target.classList.remove('enabled')
            }
          })
        }

        xyz.mapview.interaction.zoom.cancel()

      }}>
      <div class="xyz-icon icon-area off-black-filter">`)

    document.querySelector('.btn-column').appendChild(xyz.utils.wire()`
    <button
      title="Current location"
      onclick=${e => {
        xyz.mapview.locate.toggle();
        e.target.classList.toggle('enabled');
      }}>
      <div class="xyz-icon icon-gps-not-fixed off-black-filter">`)

  }

  function loadLayers(layers) {

    const layerPromises = layers.map(layer => {

      return xyz.workspace.get.layer({
        locale: xyz.locale.key,
        layer: layer
      })

    })

    Promise.all(layerPromises).then(layers => {

      if (xyz.hooks && xyz.hooks.current.layers.length) {
        layers.forEach(layer => {
          layer.display = !!~xyz.hooks.current.layers.indexOf(layer.key)
        })
      }

      layers.forEach(layer => {

        layer = xyz.layers.decorate(layer)
        xyz.layers.list[layer.key] = layer
        layer.display && layer.show()

      })

      mappUI()

    })
  }

  function mappUI() {

    xyz.layers.listview.init({
      target: layersTab
    })

    xyz.locations.listview.init({
      target: locationsTab,
      callbackInit: () => {
        locationsTab.closest('.tab').style.display = 'none'
        layersTab.closest('.tab').click()
      },
      callbackAdd: () => {
        locationsTab.closest('.tab').style.display = 'block'
        locationsTab.closest('.tab').click()
      }
    })

    document.getElementById('clear_locations').onclick = e => {
      e.preventDefault()
      xyz.locations.list
        .filter(record => !!record.location)
        .forEach(record => record.location.remove())
    }

    if (xyz.locale.gazetteer) {

      const gazetteer = _xyz.utils.wire()`
      <div id="gazetteer" class="display-none">
        <div class="input-drop">
            <input type="text" placeholder="e.g. London">
            <ul>`

      const btnGazetteer = _xyz.utils.wire()`
      <button onclick=${e => {
          e.preventDefault()
          e.target.classList.toggle('enabled')
          gazetteer.classList.toggle('display-none')
        }}><div class="xyz-icon icon-search">`

      document.querySelector('.btn-column').insertBefore(btnGazetteer, document.querySelector('.btn-column').firstChild)

      document.body.insertBefore(gazetteer, document.querySelector('.btn-column'))

      _xyz.gazetteer.init({
        group: gazetteer.querySelector('.input-drop')
      })
    }

    // Select locations from hooks.
    xyz.hooks.current.locations.forEach(_hook => {

      const hook = _hook.split('!');

      xyz.locations.select({
        locale: xyz.locale.key,
        layer: xyz.layers.list[decodeURIComponent(hook[0])],
        table: hook[1],
        id: hook[2]
      })
    })

    if (document.head.dataset.token) {
      xyz.user = xyz.utils.JWTDecode(document.head.dataset.token)
    }

    xyz.user && xyz.user.admin_user && document.querySelector('.btn-column').appendChild(xyz.utils.wire()`
          <a
            title="Open account admin view"
            class="enabled" style="cursor: pointer;"
            href="${xyz.host + '/view/admin_user'}">
            <div class="xyz-icon icon-supervisor-account">`)

    if (document.head.dataset.login) {
      document.querySelector('.btn-column').appendChild(xyz.utils.wire()`
          <a
            title="${xyz.user ? `Logout ${xyz.user.email}` : 'Login'}"
            class="enabled" style="cursor: pointer;"
            href="${xyz.host + (xyz.user ? '/logout' : '/login')}">
            <div class="${'xyz-icon ' + (xyz.user ? 'icon-logout' : 'icon-lock-open')}">`)
    }
  }

}