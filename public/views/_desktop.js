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
    if (height < 65) return

    // Full height snap.
    if (height > (window.innerHeight - 10)) height = window.innerHeight

    desktop.tabview.style.maxHeight = height + 'px'

    document.getElementById('Attribution').style.bottom = height + 'px'
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

    if (!locales.length) return console.log('No accessible locales')

    const locale = (xyz.hooks && xyz.hooks.current.locale) || locales[0]

    xyz.workspace.get.locale({
      locale: locale
    }).then(createMap)

    if (locales.length === 1) return

    const localeDropdown = xyz.utils.html.node`
    <div>
      <div class="listview-title secondary-colour-bg">${xyz.language.locales_header}</div>
      <div>${xyz.language.show_layers_for_locale}</div>
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
        target: document.getElementById('Attribution'),
        links: {
          [`XYZ v${xyz.version}`]: 'https://geolytix.github.io/xyz',
          Openlayers: 'https://openlayers.org'
        }
      },
      scrollWheelZoom: true,
    })

    xyz.modules()
      .then(() => xyz.layers.load())
      .then(() => mappUI())
      .catch(error => console.error(error))

    const btnZoomIn = xyz.utils.html.node`
    <button
      disabled=${xyz.map.getView().getZoom() >= xyz.locale.maxZoom}
      class="enabled"
      title=${_xyz.language.toolbar_zoom_in}
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
      title=${_xyz.language.toolbar_zoom_out}
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
      title=${_xyz.language.toolbar_zoom_to_area}
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
        title=${_xyz.language.toolbar_current_location}
        onclick=${e => {
          xyz.mapview.locate.toggle();
          e.target.classList.toggle('enabled');
        }}><div class="xyz-icon icon-gps-not-fixed off-black-filter">`)

    document.querySelector('.btn-column').appendChild(xyz.utils.html.node`
      <button
        title=${_xyz.language.toolbar_measure}
        onclick=${e => {

          if (e.target.classList.contains('enabled')) return xyz.mapview.interaction.draw.cancel()

          e.target.classList.add('enabled')

          xyz.mapview.interaction.draw.begin({
            type: 'LineString',
            tooltip: 'length',
            callback: () => {
              e.target.classList.remove('enabled')
            }
          })
        }}><div class="xyz-icon icon-line off-black-filter">`)          

    document.querySelector('.btn-column').appendChild(xyz.utils.html.node`
      <button
        title=${_xyz.language.toolbar_fullscreen}
        onclick=${e => {
        e.target.classList.toggle('enabled');
        xyz.mapview.node.classList.toggle('fullscreen');
        xyz.map.updateSize();
      }}>
        <div class="xyz-icon icon-map off-black-filter">`)

  }

  // function loadModules() {

  //   return new Promise((resolveAll, rejectAll) => {

  //     if (!xyz.locale.modules) return resolve()

  //     const promises = Object.entries(xyz.locale.modules).map(_module => {

  //       return new Promise((resolve, reject) => {

  //         const tag = xyz.utils.wire()`<script src="${_module[1]}">`

  //         const eF = e => {
  //           e.detail(xyz)
  //           document.removeEventListener(_module[0], eF, true)
  //           tag.remove()
  //           resolve(_module)
  //         }

  //         document.addEventListener(_module[0], eF, true)
  //         document.head.appendChild(tag)
  //       })
  //     })

  //     Promise
  //       .all(promises)
  //       .then(arr => resolveAll(arr))
  //       .catch(error => {
  //         console.error(error)
  //         rejectAll(error)
  //       });
  
  //   })

  // }

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
        <div class="listview-title secondary-colour-bg">${xyz.language.search_header}</div>
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
            title=${_xyz.language.toolbar_admin}
            class="enabled" style="cursor: pointer;"
            href="${xyz.host + '/view/admin_user'}">
            <div class="xyz-icon icon-supervisor-account">`)

    if (document.head.dataset.login) {
      document.querySelector('.btn-column').appendChild(xyz.utils.html.node`
          <a
            title="${xyz.user ? `${_xyz.language.toolbar_logout} ${xyz.user.email}` : 'Login'}"
            class="enabled" style="cursor: pointer;"
            href="${xyz.host + (xyz.user ? '/logout' : '/login')}">
            <div class="${'xyz-icon ' + (xyz.user ? 'icon-logout' : 'icon-lock-open')}">`)
    }
  }

}