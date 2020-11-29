window.onload = () => {

  if ('scrollRestoration' in history) history.scrollRestoration = 'auto'

  // Set Openlayers node in order to move map object.
  const OL = document.getElementById('OL')

  // Move map up on document scroll
  document.addEventListener('scroll', () => {
    OL.style['marginTop'] = `-${parseInt(window.pageYOffset / 2)}px`
  })

  // Set vertDivider fo vertical resize of body grid.
  const vertDivider = document.getElementById('spacer')

  vertDivider.addEventListener('mousedown', e => {
    e.preventDefault()
    document.body.style.cursor = 'grabbing'
    window.addEventListener('mousemove', resize_x)
    window.addEventListener('mouseup', stopResize_x)
  })
  
  vertDivider.addEventListener('touchstart', e => {
    e.preventDefault()
    window.addEventListener('touchmove', resize_x)
    window.addEventListener('touchend', stopResize_x)
  }, {
    passive: true
  })
  
  // Vertical resize event
  function resize_x(e) {
    let pageX = (e.touches && e.touches[0].pageX) || e.pageX

    if (pageX < 333) return

    // Half width snap.
    if (pageX > (window.innerWidth / 2)) pageX = window.innerWidth / 2

    document.body.style.gridTemplateColumns = `${pageX}px 10px 50px auto`
  }
  
  // Remove vertical resize events.
  function stopResize_x() {
    document.body.style.cursor = 'auto'
    window.removeEventListener('mousemove', resize_x)
    window.removeEventListener('touchmove', resize_x)
    window.removeEventListener('mouseup', stopResize_x)
    window.removeEventListener('touchend', stopResize_x)
  }

  // Set hoxDivider for horizontal resize of body grid.
  const hozDivider = document.getElementById('hozDivider')

  // Resize tabview while holding mousedown on hozDivider.
  hozDivider.addEventListener('mousedown', () => {
    document.body.style.cursor = 'grabbing'
    window.addEventListener('mousemove', resize_y)
    window.addEventListener('mouseup', stopResize_y)
  }, true)

  // Resize dataview while touching hozDivider.
  hozDivider.addEventListener('touchstart', e => {
    e.preventDefault()
    window.addEventListener('touchmove', resize_y)
    window.addEventListener('touchend', stopResize_y)
  }, {
    passive: true
  })

  // Resize the dataview container.
  function resize_y(e) {
    e.preventDefault()

    let pageY = (e.touches && e.touches[0].pageY) || e.pageY

    if (pageY < 0) return

    let height = window.innerHeight - pageY

    // Min height snap.
    if (height < 65) height = 50

    // Full height snap.
    if (height > (window.innerHeight - 10)) height = window.innerHeight

    document.body.style.gridTemplateRows = `auto 10px ${height}px`

    OL.style.marginTop = `-${(height/2)}px`
  }

  // Remove horizontal resize events.
  function stopResize_y() {
    document.body.style.cursor = 'auto';
    window.removeEventListener('mousemove', resize_y);
    window.removeEventListener('touchmove', resize_y);
    window.removeEventListener('mouseup', stopResize_y);
    window.removeEventListener('touchend', stopResize_y);
  }

  // Tab event for mobile view.
  const tabs = document.querySelectorAll('.tab')
  const locationsTab = document.getElementById('locations')
  const layersTab = document.getElementById('layers')

  tabs.forEach(tab => {

    tab.querySelector('.listview').addEventListener('scroll', e => {
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

  const btnColumn = document.getElementById('mapButton')

  // Initialize xyz object
  const xyz = _xyz({
    host: document.head.dataset.dir || new String(''),
    hooks: true
  })

  document.getElementById('layers_header').textContent = xyz.language.layers_header
  document.getElementById('locations_header').textContent = xyz.language.locations_header


  xyz.workspace.get.locales().then(getLocale)

  // Get locale from host.
  function getLocale(locales) {

    if (!locales.length) return console.log('No accessible locales')

    const locale = xyz.hooks && xyz.hooks.current.locale ? {
      key: xyz.hooks.current.locale, 
      name: locales.find(l => l.key === xyz.hooks.current.locale).name
    } : locales[0];

    xyz.workspace.get.locale({
      locale: locale.key
    }).then(createMap)

    if (locales.length === 1) return

    layersTab.appendChild(xyz.utils.html.node`
      <div>${xyz.language.show_layers_for_locale}</div>
      <button class="btn-drop">
        <div class="head"
          onclick=${e => {
            e.preventDefault()
            e.target.parentElement.classList.toggle('active')
          }}>
          <span>${locale.name || locale.key}</span>
          <div class="icon"></div>
        </div>
        <ul>${locales.map(_locale => xyz.utils.html.node`
            <li>
              <a href="${xyz.host + '?locale=' + _locale.key + 
                `${xyz.hooks.current.language && '&language=' + xyz.hooks.current.language || ''}`}">
              ${_locale.name || _locale.key}`)}`)

  }

  // Create map element.
  function createMap(locale) {

    xyz.locale = locale

    xyz.mapview.create({
      target: OL,
      attribution: {
        target: document.querySelector('#Attribution > .attribution'),
        links: {
          [`XYZ v${xyz.version}`]: 'https://geolytix.github.io/xyz',
          Openlayers: 'https://openlayers.org'
        }
      },
      scrollWheelZoom: true,
    })

    // Add zoomIn button.
    const btnZoomIn = btnColumn.appendChild(xyz.utils.html.node `
      <button
        id="btnZoomIn"
        disabled=${xyz.map.getView().getZoom() >= xyz.locale.maxZoom}
        class="enabled"
        title=${xyz.language.toolbar_zoom_in}
        onclick=${e => {
          const z = parseInt(xyz.map.getView().getZoom() + 1)
          xyz.map.getView().setZoom(z)
          e.target.disabled = (z >= xyz.locale.maxZoom)
        }}><div class="xyz-icon icon-add">`)

    // Add zoomOut button.
    const btnZoomOut = btnColumn.appendChild(xyz.utils.html.node`
      <button
        id="btnZoomOut"
        disabled=${xyz.map.getView().getZoom() <= xyz.locale.minZoom}
        class="enabled"
        title=${xyz.language.toolbar_zoom_out}
        onclick=${e => {
          const z = parseInt(xyz.map.getView().getZoom() - 1)
          xyz.map.getView().setZoom(z)
          e.target.disabled = (z <= xyz.locale.minZoom)
        }}><div class="xyz-icon icon-remove">`)

    // changeEnd event listener for zoom button.
    OL.addEventListener('changeEnd', () => {
      const z = xyz.map.getView().getZoom()
      btnZoomIn.disabled = z >= xyz.locale.maxZoom
      btnZoomOut.disabled = z <= xyz.locale.minZoom
    })

    // Add zoom to area button.
    btnColumn.appendChild(xyz.utils.html.node`
      <button
        class="mobile-display-none"
        title=${xyz.language.toolbar_zoom_to_area}
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
        <div class="xyz-icon icon-pageview off-black-filter">`)

    // Add locator button.
    btnColumn.appendChild(xyz.utils.html.node`
      <button
        title=${xyz.language.toolbar_current_location}
        onclick=${e => {
          xyz.mapview.locate.toggle();
          e.target.classList.toggle('enabled');
        }}>
        <div class="xyz-icon icon-gps-not-fixed off-black-filter">`)

    // Add measure button.
    btnColumn.appendChild(xyz.utils.html.node`
      <button
        class="mobile-display-none"
          title=${xyz.language.toolbar_measure}
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
          }}><div class="xyz-icon icon-straighten off-black-filter">`)          

    // Add fullscreen button.
    btnColumn.appendChild(xyz.utils.html.node`
      <button
        class="mobile-display-none"
        title=${xyz.language.toolbar_fullscreen}
        onclick=${e => {
          e.target.classList.toggle('enabled')
          document.body.classList.toggle('fullscreen')
          xyz.map.updateSize()
        }}>
        <div class="xyz-icon icon-map off-black-filter">`)      

    xyz.plugins()
      .then(() => xyz.layers.load())
      .then(() => mappUI())
      .catch(error => console.error(error))
  }

  // Initialise listview controls.
  function mappUI() {

    // Add gazetteer control.
    if (xyz.locale.gazetteer) {

      const gazetteer = document.getElementById('gazetteer')
        
      const btnGazetteer = btnColumn.insertBefore(xyz.utils.html.node`
        <button id="btnGazetteer"
          onclick=${e => {
            e.preventDefault()
            btnGazetteer.classList.toggle('enabled')
            btnGazetteer.classList.toggle('mobile-hidden')
            gazetteer.classList.toggle('display-none')
          }}><div class="xyz-icon icon-search">`, btnColumn.firstChild)
        
      document.getElementById('closeGazetteer').onclick = e => {
        e.preventDefault()
        btnGazetteer.classList.toggle('enabled')
        btnGazetteer.classList.toggle('mobile-hidden')
        gazetteer.classList.toggle('display-none')
      }
          
      xyz.gazetteer.init({
        group: gazetteer.querySelector('.input-drop')
      })
          
    }

    xyz.tabview.init({
      node: document.getElementById('tabview')
    })

    xyz.layers.listview.init({
      target: layersTab
    })

    xyz.locations.listview.init({
      target: locationsTab
    })

    // Add clear all location button.
    locationsTab.appendChild(xyz.utils.html.node`
      <button 
        class="tab-display bold primary-colour"
        onclick=${e => {
          e.preventDefault()
          xyz.locations.list
            .filter(record => !!record.location)
            .forEach(record => record.location.remove())
        }}>
        ${xyz.language.clear_all_locations}`)

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

    // Get user from token.
    if (document.head.dataset.token) {
      xyz.user = xyz.utils.JWTDecode(document.head.dataset.token)
    }

    // Append user admin button.
    xyz.user && xyz.user.admin && btnColumn.appendChild(xyz.utils.html.node`
      <a
        title=${xyz.language.toolbar_admin}
        class="enabled mobile-display-none style="cursor: pointer;"
        href="${xyz.host + '/view/admin_user'}">
        <div class="xyz-icon icon-supervisor-account">`)

    // Append logout button.
    document.head.dataset.login && btnColumn.appendChild(xyz.utils.html.node`
      <a
        title="${xyz.user ? `${xyz.language.toolbar_logout} ${xyz.user.email}` : 'Login'}"
        class="enabled" style="cursor: pointer;"
        href="${xyz.host + (xyz.user ? '/api/user/logout' : '/login')}">
        <div class="${'xyz-icon ' + (xyz.user && 'icon-logout' || 'icon-lock-open')}">`)

  }

}