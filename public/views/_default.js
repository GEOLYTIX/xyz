window.onload = async () => {

  mapp.utils.merge(mapp.dictionaries, {
    en: {
      toolbar_zoom_in: 'Zoom in',
      toolbar_zoom_out: 'Zoom out',
      toolbar_zoom_to_area: 'Zoom to area',
      toolbar_current_location: 'Current location',
      toolbar_fullscreen: 'Fullscreen mapview',
      toolbar_admin: 'Open account admin view',
      toolbar_login: 'Log in',
      toolbar_logout: 'Log out',
      layers: 'Layers',
      locations: 'Locations',
      no_locale: 'Failed to load locale.',
      no_locales: 'User has no accessible locales.'
    },
    de: {
      toolbar_zoom_in: 'Zoom rein',
      toolbar_zoom_out: 'Zoom raus',
      toolbar_zoom_to_area: 'Zoom Rechteck',
      toolbar_current_location: 'Standort',
      toolbar_fullscreen: 'Vollbild',
      toolbar_admin: 'Benutzerkontenverwaltung',
      toolbar_login: 'Einloggen',
      toolbar_logout: 'Ausloggen',
      layers: 'Ebenen',
      locations: 'Orte',
    },
    zn: {
      toolbar_zoom_in: '放大',
      toolbar_zoom_out: '缩小',
      toolbar_zoom_to_area: '缩放至区域',
      toolbar_current_location: '当前位置',
      toolbar_fullscreen: '全屏地图视图',
      toolbar_admin: '打开帐户管理视图',
      toolbar_login: '登录',
      toolbar_logout: '登出',
      layers: '图层',
      locations: '地点',
    },
    zn_tw: {
      toolbar_zoom_in: '放大',
      toolbar_zoom_out: '縮小',
      toolbar_zoom_to_area: '縮放至區域',
      toolbar_current_location: '當前位置',
      toolbar_fullscreen: '全屏地圖視圖',
      toolbar_admin: '打開帳戶管理視圖',
      toolbar_login: '登錄',
      toolbar_logout: '登出',
      layers: '圖層',
      locations: '地點',
    },
    pl: {
      toolbar_zoom_in: 'Przybliż',
      toolbar_zoom_out: 'Oddal',
      toolbar_zoom_to_area: 'Przybliż do obszaru',
      toolbar_current_location: 'Obezha lokalizcja',
      toolbar_fullscreen: 'Mapa na całym ekranie',
      toolbar_admin: 'Otwórz widok administratora',
      toolbar_login: 'Zaloguj się',
      toolbar_logout: 'Wyloguj się',
      layers: 'Warstwy',
      locations: 'Lokalizacje',
    },
    fr: {
      toolbar_zoom_in: 'Zoom +',
      toolbar_zoom_out: 'Zoom -',
      toolbar_zoom_to_area: 'Zoomer sur la zone',
      toolbar_current_location: 'Emplacement actuel',
      toolbar_fullscreen: 'Carte en plein écran',
      toolbar_admin: 'Ouvrir le menu administrateur',
      toolbar_login: 'Se connecter',
      toolbar_logout: 'Déconnexion',
      layers: 'Couches cartographiques',
      locations: 'Sites',
    },
    ja: {
      toolbar_zoom_in: 'ズームイン',
      toolbar_zoom_out: 'ズームアウト',
      toolbar_zoom_to_area: 'エリアをズームに',
      toolbar_current_location: '現地',
      toolbar_fullscreen: 'フルスクリーン マップビュー',
      toolbar_admin: 'アカウントアドミンビューを開く',
      toolbar_login: 'ログイン',
      toolbar_logout: 'ログアウト',
      layers: 'レイヤー',
      locations: 'ロケーション',
    },
    es: {
      toolbar_zoom_in: 'Zoom +',
      toolbar_zoom_out: 'Zoom -',
      toolbar_zoom_to_area: 'Zoom al área',
      toolbar_current_location: 'Ubicación actual',
      toolbar_fullscreen: 'Vista de mapa en pantalla completa',
      toolbar_admin: 'Abrir vista de administrador de cuenta',
      toolbar_login: 'Iniciar sesión',
      toolbar_logout: 'Desconexión',
      layers: 'Capas',
      locations: 'Ubicaciones',
    },
    tr: {
      toolbar_zoom_in: 'Yaklas',
      toolbar_zoom_out: 'Uzaklas',
      toolbar_zoom_to_area: 'Bolgeye yaklas',
      toolbar_current_location: 'Mevcut konum',
      toolbar_fullscreen: 'Tam ekran harita',
      toolbar_admin: 'Hesap yoneticisini ac',
      toolbar_login: 'Oturum ac',
      toolbar_logout: 'Oturumu kapat',
      layers: 'Katmanlar',
      locations: 'Konumlar',
    },
    it: {
      toolbar_zoom_in: 'Ingrandisci',
      toolbar_zoom_out: 'Rimpicciolisci',
      toolbar_zoom_to_area: 'Zoom nell\'area',
      toolbar_current_location: 'Posizione attuale',
      toolbar_fullscreen: 'Mappa a schermo intero',
      toolbar_admin: 'Apri il menù amministratore',
      toolbar_login: 'Log in',
      toolbar_logout: 'Log out',
      layers: 'Layers',
      locations: 'Località',
    },
    th: {
      toolbar_zoom_in: 'ขยายเข้า',
      toolbar_zoom_out: 'ซูมออก',
      toolbar_zoom_to_area: 'ซูมไปที่พื้นที่',
      toolbar_current_location: 'สถานที่ปัจจุบัน',
      toolbar_fullscreen: 'มุมมองแผนที่แบบเต็มหน้าจอ',
      toolbar_admin: 'เปิดมุมมองผู้ดูแลระบบ',
      toolbar_login: 'เข้าสู่ระบบ',
      toolbar_logout: 'ออกจากระบบ',
      layers: 'ชั้น',
      locations: 'สถานที่',
    },
  })

  // Parse user object from dataset attribute on document head.
  mapp.user = document.head.dataset.user &&
    JSON.parse(decodeURI(document.head.dataset.user))
    || undefined

  // Language as URL parameter will override user language.
  mapp.language = mapp.hooks.current.language
    || mapp.user?.language
    || mapp.language

  // Restore scroll
  if ('scrollRestoration' in history) history.scrollRestoration = 'auto';

  // Set Openlayers node in order to move map object.
  const OL = document.getElementById('OL');

  // Move map up on document scroll
  document.body.addEventListener('scroll', () => {
    OL.style['marginTop'] = `-${parseInt(window.pageYOffset / 2)}px`;

    // Limit scrollTop on mobile browser
    if (document.body.scrollTop > window.innerHeight) {
      document.body.scrollTop = window.innerHeight
    }
  });

  // ResizeHandler for #CTRLS
  mapp.ui.utils.resizeHandler({
    target: document.getElementById('ctrls-divider'),
    resizeEvent: (e) => {
      let pageX = (e.touches && e.touches[0].pageX) || e.pageX;

      if (pageX < 350) return;

      // Half width snap.
      if (pageX > window.innerWidth / 2) pageX = window.innerWidth / 2;

      document.body.style.gridTemplateColumns = `${pageX}px 10px auto`;
    },
  });

  // ResizeHandler for tabview
  mapp.ui.utils.resizeHandler({
    target: document.getElementById('tabview-divider'),
    resizeEvent: (e) => {

      let pageY = (e.touches && e.touches[0].pageY) || e.pageY;

      if (pageY < 0) return;

      let height = window.innerHeight - pageY;

      // Min height snap.
      if (height < 65) height = 50;

      // Full height snap.
      if (height > window.innerHeight - 10) height = window.innerHeight;

      document.body.style.gridTemplateRows = `auto 10px ${height}px`;

      OL.style.marginTop = `-${height / 2}px`;
    },
  });

  const locationsTab = document.getElementById('locations');
  const layersTab = document.getElementById('layers');

  const tabs = document.querySelectorAll('#ctrl-tabs > div');
  const tabPanels = document.querySelectorAll('#ctrl-panel > div');

  tabs.forEach((tab) => {

    // Set help text from dictionary.
    tab.title = mapp.dictionary[tab.dataset.id]

    tab.onclick = (e) => {

      // Change active class for the tab.
      tabs.forEach((el) => el.classList.remove('active'));
      e.target.classList.add('active');

      // Change active class for the panel.
      tabPanels.forEach((el) => el.classList.remove('active'));
      document.getElementById(e.target.dataset.id).classList.add('active')

      // Put focus on the gazetteer if the locations tab is activated.
      if (e.target.dataset.id === 'locations') {
        let gazetteerInput = document.getElementById('gazetteerInput')
        gazetteerInput && window.innerWidth > 768 && gazetteerInput.focus()
      }
    }
  });

  const tabview = document.getElementById('Tabview');

  mapp.ui.Tabview({
    node: tabview,
    id: 'tabview',
    showTab: () => {
      // Show the tabview if not already visible.
      if (tabview.classList.contains('desktop-display-none')) {
        tabview.classList.remove('desktop-display-none');
        document.body.style.gridTemplateRows = 'auto 10px 50px';
      }
    },
    removeLastTab: () => {
      // Hide tabview if tab had no siblings.
      tabview.classList.add('desktop-display-none');
      document.body.style.gridTemplateRows = 'auto 0 0';
      mapview.Map.getTargetElement().style.marginTop = 0;
    },
  });

  const btnColumn = document.getElementById('mapButton');

  // Get list of accessible locales from Workspace API.
  const locales = await mapp.utils.xhr(`${mapp.host}/api/workspace/locales`);

  // Get locale with list of layers from Workspace API.
  const locale = await mapp.utils.xhr(
    `${mapp.host}/api/workspace/locale?locale=${mapp.hooks.current.locale || locales[0]?.key}&layers=true`);

  if (locale instanceof Error) {

    !locales.length ?
      alert(mapp.dictionary.no_locales) :
      alert(mapp.dictionary.no_locale)
  }

  // Add locale dropdown to layers panel if multiple locales are accessible.
  if (locales.length > 1) {
    const localesDropdown = mapp.ui.elements.dropdown({
      data_id: 'locales-dropdown',
      span: locale.name || locale.key,
      entries: locales.map((locale) => ({
        title: locale.name || locale.key,
        key: locale.key,
      })),
      callback: (e, entry) => {
        window.location.assign(`${mapp.host}?locale=${entry.key}`);
      },
    });

    layersTab.appendChild(mapp.utils.html.node`${localesDropdown}`);
  }

  if (!window.ol) await mapp.utils.olScript()

  // Create mapview
  const mapview = await mapp.Mapview({
    host: mapp.host,
    target: OL,
    locale: locale,
    hooks: true,
    scrollWheelZoom: true,
    attribution: {
      target: document.getElementById('Map'),
      logo: mapp.utils.html.node`
        <a class="logo" target="_blank" href="https://geolytix.co.uk">
          <img src="https://geolytix.github.io/public/geolytix_mapp.svg">`,
      links: {
        [`XYZ v${mapp.version}`]: 'https://github.com/GEOLYTIX/xyz',
        ['SHA']: `https://github.com/GEOLYTIX/xyz/commit/${mapp.hash}`,
        Openlayers: 'https://openlayers.org',
      }
    },
    
    // mapp.Mapview must be awaited.
    loadPlugins: true
  });

  // Add layers to mapview.
  await mapview.addLayer(locale.layers);

  // Add zoomIn button.
  const btnZoomIn = btnColumn.appendChild(mapp.utils.html.node`
    <button
      id="btnZoomIn"
      .disabled=${mapview.Map.getView().getZoom() >= mapview.locale.maxZoom}
      title=${mapp.dictionary.toolbar_zoom_in}
      onclick=${(e) => {
      const z = parseInt(mapview.Map.getView().getZoom() + 1);
      mapview.Map.getView().setZoom(z);
      e.target.disabled = z >= mapview.locale.maxZoom;
    }}>
      <div class="mask-icon add">`)

  // Add zoomOut button.
  const btnZoomOut = btnColumn.appendChild(mapp.utils.html.node`
    <button
      id="btnZoomOut"
      .disabled=${mapview.Map.getView().getZoom() <= mapview.locale.minZoom}
      title=${mapp.dictionary.toolbar_zoom_out}
      onclick=${(e) => {
      const z = parseInt(mapview.Map.getView().getZoom() - 1);
      mapview.Map.getView().setZoom(z);
      e.target.disabled = z <= mapview.locale.minZoom;
    }}>
      <div class="mask-icon remove">`)

  // changeEnd event listener for zoom button.
  OL.addEventListener('changeEnd', () => {
    const z = mapview.Map.getView().getZoom();
    btnZoomIn.disabled = z >= mapview.locale.maxZoom;
    btnZoomOut.disabled = z <= mapview.locale.minZoom;
  });

  if (mapview.locale.gazetteer) {

    mapp.ui.Gazetteer(Object.assign(mapview.locale.gazetteer, {
      mapview,
      target: locationsTab.appendChild(mapp.utils.html.node`<div>`),
    }));

  } else {

    document.querySelector('[data-id=locations]').style.display = 'none'
  }

  // Create layers listview.
  mapp.ui.layers.listview({
    target: layersTab,
    mapview: mapview,
  });

  // Create locations listview.
  mapp.ui.locations.listview({
    target: locationsTab,
    mapview: mapview,
  });

  // Begin highlight interaction.
  mapview.interactions.highlight();

  // Select locations from hooks.
  mapp.hooks.current.locations.forEach((_hook) => {

    // Split location hook into layer key and id.
    const hook = _hook.split('!');

    // Get the location.
    // Will be added to listview in location panel.
    mapp.location.get({
      layer: mapview.layers[decodeURIComponent(hook[0])],
      id: hook[1],
    });
  });


  // Configure idle mask if set in locale.
  mapp.user &&
    mapview.locale.idle &&
    mapp.ui.utils.idleLogout({
      host: mapp.host,
      idle: mapview.locale.idle,
    });

  // Append user admin link.
  mapp.user?.admin &&
    btnColumn.appendChild(mapp.utils.html.node`
      <a
        title=${mapp.dictionary.toolbar_admin}
        href="${mapp.host + '/api/user/admin'}">
        <div class="mask-icon supervisor-account">`);

  // Append login/logout link.
  document.head.dataset.login &&
    btnColumn.appendChild(mapp.utils.html.node`
      <a
        title="${mapp.user && mapp.dictionary.toolbar_logout || mapp.dictionary.toolbar_login}"
        href="${(mapp.user && '?logout=true') || '?login=true'}">
        <div class="${`mask-icon ${(mapp.user && 'logout') || 'lock-open'}`}">`);

  // Append spacer for tableview
  btnColumn.appendChild(mapp.utils.html.node`
    <div class="mobile-display-none" style="height: 60px;">`);
};