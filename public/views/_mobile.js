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

    if (!locales.length) return console.log('No accessible locales')

    const locale = xyz.hooks && xyz.hooks.current.locale ? {
      key: xyz.hooks.current.locale, 
      name: locales.find(l => l.key === xyz.hooks.current.locale).name
    } : locales[0];

    xyz.workspace.get.locale({
      locale: locale.key
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
        <span>${locale.name || locale.key}</span>
        <div class="icon"></div>
      </div>
      <ul>${locales.map(
        _locale => xyz.utils.html.node`<li><a href="${xyz.host + '?locale=' + _locale.key + `${xyz.hooks && xyz.hooks.current.language ? '&language=' + xyz.hooks.current.language : ''}`}">${_locale.name || _locale.key}`
        )}`

    layersTab.parentElement.insertBefore(localeDropdown, layersTab.parentElement.firstChild)
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

    xyz.plugins()
      .then(() => xyz.layers.load())
      .then(() => mappUI())
      .catch(error => console.error(error))

    const btnZoomIn = xyz.utils.html.node`
    <button
      disabled=${xyz.map.getView().getZoom() >= xyz.locale.maxZoom}
      class="enabled"
      title=${xyz.language.toolbar_zoom_in}
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
      title=${xyz.language.toolbar_zoom_out}
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
      <div class="xyz-icon icon-area off-black-filter">`)

    document.querySelector('.btn-column').appendChild(xyz.utils.html.node`
    <button
      title=${xyz.language.toolbar_current_location}
      onclick=${e => {
        xyz.mapview.locate.toggle();
        e.target.classList.toggle('enabled');
      }}>
      <div class="xyz-icon icon-gps-not-fixed off-black-filter">`)

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

      const gazetteer = xyz.utils.html.node`
      <div id="gazetteer" class="display-none">
        <div class="input-drop">
            <input type="text" placeholder="e.g. London">
            <ul>`

      const btnGazetteer = xyz.utils.html.node`
      <button onclick=${e => {
          e.preventDefault()
          e.target.classList.toggle('enabled')
          gazetteer.classList.toggle('display-none')
        }}><div class="xyz-icon icon-search">`

      document.querySelector('.btn-column').insertBefore(btnGazetteer, document.querySelector('.btn-column').firstChild)

      document.body.insertBefore(gazetteer, document.querySelector('.btn-column'))

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
            title=${xyz.language.toolbar_admin}
            class="enabled" style="cursor: pointer;"
            href="${xyz.host + '/view/admin_user'}">
            <div class="xyz-icon icon-supervisor-account">`)

    if (document.head.dataset.login) {
      document.querySelector('.btn-column').appendChild(xyz.utils.html.node`
          <a
            title="${xyz.user ? `${xyz.language.toolbar_logout} ${xyz.user.email}` : 'Login'}"
            class="enabled" style="cursor: pointer;"
            href="${xyz.host + (xyz.user ? '/api/user/logout' : '/login')}">
            <div class="${'xyz-icon ' + (xyz.user ? 'icon-logout' : 'icon-lock-open')}">`)
    }
  }

}