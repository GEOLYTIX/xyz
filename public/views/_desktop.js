window.onload = () => {

  const desktop = {
    tabview: document.getElementById('tabview'),
    listviews: document.getElementById('listviews'),
    vertDivider: document.getElementById('vertDivider'),
    hozDivider: document.getElementById('hozDivider'),
    touch: () => ('ontouchstart' in window) || (navigator.maxTouchPoints > 0)
  }

  desktop.tabview.addEventListener('click', e => e.stopPropagation())

  document.getElementById('mapButton')
    .addEventListener('mousemove', e => e.stopPropagation(), true)

  // Resize while holding mousedown on vertDivider.
  desktop.vertDivider.addEventListener('mousedown', e => {
    e.preventDefault()
    document.body.style.cursor = 'grabbing'
    window.addEventListener('mousemove', resize_x)
    window.addEventListener('mouseup', stopResize_x)
  })

  // Resize while touching vertDivider.
  desktop.vertDivider.addEventListener('touchstart', () => {
    window.addEventListener('touchmove', resize_x)
    window.addEventListener('touchend', stopResize_x)
  }, { passive: true })

  function resize_x(e) {
    let pageX = (e.touches && e.touches[0].pageX) || e.pageX

    if (pageX < 333) return

    // Half width snap.
    if (pageX > (window.innerWidth / 2)) pageX = window.innerWidth / 2

    document.body.style.gridTemplateColumns = `${pageX}px 10px auto`
  }

  // Remove eventListener after resize event.
  function stopResize_x() {
    document.body.style.cursor = 'auto'
    window.removeEventListener('mousemove', resize_x)
    window.removeEventListener('touchmove', resize_x)
    window.removeEventListener('mouseup', stopResize_x)
    window.removeEventListener('touchend', stopResize_x)
  }

  // Resize tabview while holding mousedown on hozDivider.
  desktop.hozDivider.addEventListener('mousedown', e => {
    e.preventDefault()
    document.body.style.cursor = 'grabbing'
    window.addEventListener('mousemove', resize_y)
    window.addEventListener('mouseup', stopResize_y)
  }, true)

  // Resize dataview while touching hozDivider.
  desktop.touch() && desktop.hozDivider.addEventListener('touchstart', e => {
    window.addEventListener('touchmove', resize_y)
    window.addEventListener('touchend', stopResize_y)
  }, { passive: true })

  // Resize the dataview container
  function resize_y(e) {
    e.preventDefault()

    let pageY = (e.touches && e.touches[0].pageY) || e.pageY

    if (pageY < 0) return

    let height = window.innerHeight - pageY

    // Min height snap.
    if (height < 40) return

    // Full height snap.
    if (height > (window.innerHeight - 10)) height = window.innerHeight

    desktop.tabview.style.maxHeight = height + 'px'

    if (height > 65 && document.querySelector('.attribution')) document.querySelector('.attribution').style.bottom = height + 'px'
  }

  // Remove eventListener after resize event.
  function stopResize_y() {
    document.body.style.cursor = 'auto';
    window.removeEventListener('mousemove', resize_y);
    window.removeEventListener('touchmove', resize_y);
    window.removeEventListener('mouseup', stopResize_y);
    window.removeEventListener('touchend', stopResize_y);
  }


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

    const localeDropdown = xyz.utils.html.node`
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
        locale => xyz.utils.html.node`<li><a href="${xyz.host + '?locale=' + locale}">${locale}`
      )}`

    desktop.listviews.querySelector('div').insertBefore(localeDropdown, desktop.listviews.querySelector('div').firstChild)
  }

  function createMap(locale) {

    xyz.locale = locale;

    xyz.mapview.create({
      target: document.getElementById('Map'),
      attribution: {
        logo: xyz.utils.html.node`
        <a
          class="logo"
          target="_blank"
          href="https://geolytix.co.uk"
          style="background-image: url('https://cdn.jsdelivr.net/gh/GEOLYTIX/geolytix/public/geolytix.svg');">`
      },
      scrollWheelZoom: true,
    })

    loadLayers(locale.layers)

    const btnZoomIn = xyz.utils.html.node`
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

    const btnZoomOut = xyz.utils.html.node`
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

    document.querySelector('.btn-column').appendChild(xyz.utils.html.node`
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

    document.querySelector('.btn-column').appendChild(xyz.utils.html.node`
      <button
        title="Current location"
        onclick=${e => {
          xyz.mapview.locate.toggle();
          e.target.classList.toggle('enabled');
        }}>
          <div class="xyz-icon icon-gps-not-fixed off-black-filter">`)

    document.querySelector('.btn-column').appendChild(xyz.utils.html.node`
      <button
        title="Fullscreen Mapview"
        onclick=${e => {
        e.target.classList.toggle('enabled');
        xyz.mapview.node.classList.toggle('fullscreen');
        xyz.map.updateSize();
      }}>
        <div class="xyz-icon icon-map off-black-filter">`)

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

    xyz.dataviews.tabview.init({
      target: document.getElementById('tabview'),
    });

    xyz.layers.listview.init({
      target: document.getElementById('layers')
    })

    xyz.locations.listview.init({
      target: document.getElementById('locations'),
      callbackInit: () => {
        xyz.locations.listview.node.parentElement.style.display = 'none'
      },
      callbackAdd: () => {
        xyz.locations.listview.node.parentElement.style.display = 'block'
      }
    })

    document.getElementById('clear_locations').onclick = e => {
      e.preventDefault()
      xyz.locations.list
        .filter(record => !!record.location)
        .forEach(record => record.location.remove())
    }

    if (xyz.locale.gazetteer) {

      const gazetteer = xyz.utils.html.node`
      <div>
        <div class="listview-title secondary-colour-bg">Search</div>
        <div class="input-drop">
          <input type="text" placeholder="Search places">
          <ul>`

      desktop.listviews.querySelector('div').insertBefore(gazetteer, desktop.listviews.querySelector('div').firstChild)

      xyz.gazetteer.init({
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

    xyz.user && xyz.user.admin_user && document.querySelector('.btn-column').appendChild(xyz.utils.html.node`
          <a
            title="Open account admin view"
            class="enabled" style="cursor: pointer;"
            href="${xyz.host + '/view/admin_user'}">
            <div class="xyz-icon icon-supervisor-account">`)

    if (document.head.dataset.login) {
      document.querySelector('.btn-column').appendChild(xyz.utils.html.node`
          <a
            title="${xyz.user ? `Logout ${xyz.user.email}` : 'Login'}"
            class="enabled" style="cursor: pointer;"
            href="${xyz.host + (xyz.user ? '/logout' : '/login')}">
            <div class="${'xyz-icon ' + (xyz.user ? 'icon-logout' : 'icon-lock-open')}">`)
    }
  }

}