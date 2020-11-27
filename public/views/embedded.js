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


  // Tab event for mobile view.
  const locationsTab = document.getElementById('locations')
  const layersTab = document.getElementById('layers')

  const btnColumn = document.getElementById('mapButton')

  // Initialize xyz object
  const xyz = _xyz({
    host: document.head.dataset.dir || new String(''),
    hooks: true
  })

  document.getElementById('layers_header').textContent = xyz.language.layers_header
  document.getElementById('locations_header').textContent = xyz.language.locations_header


  xyz.workspace.get.locales().then(locales => {

    if (!locales.length) return console.log('No accessible locales')

    const locale = xyz.hooks && xyz.hooks.current.locale ? {
      key: xyz.hooks.current.locale, 
      name: locales.find(l => l.key === xyz.hooks.current.locale).name
    } : locales[0];

    xyz.workspace.get.locale({
      locale: locale.key
    }).then(createMap)

  })

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

    xyz.plugins()
      .then(() => xyz.layers.load())
      .then(() => mappUI())
      .catch(error => console.error(error))

    // Add zoomIn button.
    const btnZoomIn = btnColumn.appendChild(xyz.utils.html.node `
      <button
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


    // Add fullscreen button.
    btnColumn.appendChild(xyz.utils.html.node`
      <button
        title=${xyz.language.toolbar_fullscreen}
        onclick=${e => {
          e.target.classList.toggle('enabled')

          document.body.style.gridTemplateColumns = e.target.classList.contains('enabled') ?
            '0 0 50px auto' : '333px 10px 50px auto';
          xyz.map.updateSize()
        }}>
        <div class="xyz-icon icon-map off-black-filter">`)      

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

  }

}