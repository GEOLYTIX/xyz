window.onload = async () => {

  mapp.utils.merge(mapp.dictionaries, {
    en: {
      toolbar_zoom_in: "Zoom in",
      toolbar_zoom_out: "Zoom out",
      toolbar_zoom_to_area: "Zoom to area",
      toolbar_current_location: "Current location",
      toolbar_fullscreen: "Fullscreen mapview",
      toolbar_admin: "Open account admin view",
      toolbar_login: "Log in",
      toolbar_logout: "Log out",
      layers: "Layers",
      locations: "Locations"

    },
    de: {
      toolbar_zoom_in: "Zoom rein",
      toolbar_zoom_out: "Zoom raus",
      toolbar_zoom_to_area: "Zoom Rechteck",
      toolbar_current_location: "Standort",
      toolbar_fullscreen: "Vollbild",
      toolbar_admin: "Benutzerkontenverwaltung",
      toolbar_login: "Einloggen",
      toolbar_logout: "Ausloggen",
      layers: "Ebenen",
      locations: "Orte"
    },
    cn: {
      toolbar_zoom_in: "放大",
      toolbar_zoom_out: "缩小",
      toolbar_zoom_to_area: "缩放至区域",
      toolbar_current_location: "当前位置",
      toolbar_fullscreen: "全屏显示地图",
      toolbar_admin: "开启帐户管理员视图",
    },
    pl: {
      toolbar_zoom_in: "Powiększ",
      toolbar_zoom_out: "Pomniejsz",
      toolbar_zoom_to_area: "Pokaż obszar",
      toolbar_current_location: "Obecna lokalizacja",
      toolbar_fullscreen: "Mapa na pełnym ekranie",
      toolbar_admin: "Pokaż konto administratora",
    },
    ko: {
      toolbar_zoom_in: "줌인",
      toolbar_zoom_out: "줌아웃",
      toolbar_zoom_to_area: "해당지역 줌(Zoom)",
      toolbar_current_location: "현재 위치",
      toolbar_fullscreen: "지도뷰 전체화면",
      toolbar_admin: "계정관리뷰 오픈",
    },
    fr: {
      toolbar_zoom_in: "Zoomer",
      toolbar_zoom_out: "Dé-zoomer",
      toolbar_zoom_to_area: "Zoomer sur un encadré",
      toolbar_current_location: "Localisation actuelle",
      toolbar_fullscreen: "Carte en plein écran",
      toolbar_admin: "Afficher le compte administrateur",
    },
    ja: {
      toolbar_zoom_in: "ズームイン",
      toolbar_zoom_out: "ズームアウト",
      toolbar_zoom_to_area: "エリアをズームに",
      toolbar_current_location: "現在地",
      toolbar_fullscreen: "フルスクリーン マップビュー",
      toolbar_admin: "アカウントアドミンビューを開く",
    }
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
  if ("scrollRestoration" in history) history.scrollRestoration = "auto";

  // Set Openlayers node in order to move map object.
  const OL = document.getElementById("OL");

  // Move map up on document scroll
  document.body.addEventListener("scroll", () => {
    OL.style["marginTop"] = `-${parseInt(window.pageYOffset / 2)}px`;

    // Limit scrollTop on mobile browser
    if (document.body.scrollTop > window.innerHeight) {
      document.body.scrollTop = window.innerHeight
    }
  });

  // ResizeHandler for #CTRLS
  mapp.ui.utils.resizeHandler({
    target: document.getElementById("ctrls-divider"),
    resizeEvent: (e) => {
      let pageX = (e.touches && e.touches[0].pageX) || e.pageX;

      if (pageX < 333) return;

      // Half width snap.
      if (pageX > window.innerWidth / 2) pageX = window.innerWidth / 2;

      document.body.style.gridTemplateColumns = `${pageX}px 10px auto`;
    },
  });

  // ResizeHandler for tabview
  mapp.ui.utils.resizeHandler({
    target: document.getElementById("tabview-divider"),
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

  const locationsTab = document.getElementById("locations");
  const layersTab = document.getElementById("layers");

  const tabs = document.querySelectorAll("#ctrl-tabs > div");
  const tabPanels = document.querySelectorAll("#ctrl-panel > div");

  tabs.forEach((tab) => {

    // Set help text from dictionary.
    tab.title = mapp.dictionary[tab.dataset.id]

    tab.onclick = (e) => {

      // Change active class for the tab.
      tabs.forEach((el) => el.classList.remove("active"));
      e.target.classList.add("active");

      // Change active class for the panel.
      tabPanels.forEach((el) => el.classList.remove("active"));
      document.getElementById(e.target.dataset.id).classList.add('active')

      // Put focus on the gazetteer if the locations tab is activated.
      if (e.target.dataset.id === 'locations') {
        let gazetteerInput = document.getElementById('gazetteerInput')
        gazetteerInput && window.innerWidth > 768 && gazetteerInput.focus()
      }
    }
  });

  const tabview = document.getElementById("Tabview");

  mapp.ui.Tabview({
    node: tabview,
    id: "tabview",
    showTab: () => {
      // Show the tabview if not already visible.
      if (tabview.classList.contains("desktop-display-none")) {
        tabview.classList.remove("desktop-display-none");
        document.body.style.gridTemplateRows = "auto 10px 50px";
      }
    },
    removeLastTab: () => {
      // Hide tabview if tab had no siblings.
      tabview.classList.add("desktop-display-none");
      document.body.style.gridTemplateRows = "auto 0 0";
      mapview.Map.getTargetElement().style.marginTop = 0;
    },
  });

  const btnColumn = document.getElementById("mapButton");

  const host = document.head.dataset.dir || new String("");

  // Get list of accessible locales from Workspace API.
  const locales = await mapp.utils.xhr(`${host}/api/workspace/locales`);

  if (!locales.length) return alert("No accessible locales");

  // Get locale with list of layers from Workspace API.
  const locale = await mapp.utils.xhr(
    `${host}/api/workspace/locale?locale=${
      document.head.dataset.locale || mapp.hooks.current.locale || locales[0].key
    }`
  );

  // Add locale dropdown to layers panel if multiple locales are accessible.
  if (locales.length > 1) {
    const localesDropdown = mapp.ui.elements.dropdown({
      data_id: "locales-dropdown",
      span: locale.name || locale.key,
      entries: locales.map((locale) => ({
        title: locale.name || locale.key,
        key: locale.key,
      })),
      callback: (e, entry) => {
        window.location.assign(`${host}?locale=${entry.key}`);
      },
    });

    layersTab.appendChild(mapp.utils.html.node`${localesDropdown}`);
  }

  // Create mapview
  const mapview = mapp.Mapview({
    host: host,
    target: OL,
    locale: locale,
    hooks: true,
    scrollWheelZoom: true,
    scalebar: 'metric', //'imperial'
    attribution: {
      target: document.querySelector('#Attribution > .attribution-links'),
      links: {
        [`XYZ v${mapp.version}`]: "https://geolytix.github.io/xyz",
        ["SHA"]: `https://github.com/GEOLYTIX/xyz/commit/${mapp.hash}`,
        Openlayers: "https://openlayers.org",
      },
    }
  });

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

  // Add zoom to area button.
  btnColumn.append(mapp.utils.html.node`
    <button
      class="mobile-display-none"
      title=${mapp.dictionary.toolbar_zoom_to_area}
      onclick=${(e) => {

        // If active cancel zoom and enable highlight interaction.
        if (e.target.classList.contains('active')) {
          return mapview.interactions.highlight()
        }

        // Add active class
        e.target.classList.add('active')

        // Make zoom interaction current.
        mapview.interactions.zoom({

          // The interaction callback is executed on cancel or finish.
          callback: () => {
            e.target.classList.remove('active');
            mapview.interactions.highlight();
          },
        })

      }}>
      <div class="mask-icon pageview">`)

  // Add locator button.
  mapview.locale.locator && btnColumn.appendChild(mapp.utils.html.node`
    <button
      title=${mapp.dictionary.toolbar_current_location}
      onclick=${(e) => {
        mapview.locate();
        e.target.classList.toggle('active');
      }}>
      <div class="mask-icon gps-not-fixed">`);

  // Add fullscreen button.
  btnColumn.appendChild(mapp.utils.html.node`
    <button
      class="mobile-display-none"
      title=${mapp.dictionary.toolbar_fullscreen}
      onclick=${(e) => {
        e.target.classList.toggle('active');
        document.body.classList.toggle('fullscreen');
        mapview.Map.updateSize();
        Object.values(mapview.layers)
          .forEach((layer) => layer.mbMap?.resize());
      }}>
      <div class="mask-icon map">`);

  // Load plugins
  await mapp.utils.loadPlugins(locale.plugins);

  // Execute plugins with matching keys in locale.
  Object.keys(locale).forEach((key) => {
    mapp.plugins[key] && mapp.plugins[key](locale[key], mapview);
  });

  // Load JSON layers from Workspace API.
  const layers = await mapp.utils.promiseAll(locale.layers.map(
    layer => mapp.utils.xhr(`${host}/api/workspace/layer?`
      + `locale=${locale.key}&layer=${layer}`)))

  // Add layers to mapview.
  await mapview.addLayer(layers);

  if (mapview.locale.gazetteer) {

    // Add gazetteer to location panel.
    const gazetteer = locationsTab.appendChild(mapp.utils.html.node`
        <div class="dropdown active">
          <input id="gazetteerInput" type="text" placeholder="e.g. London">
          <ul></ul>`)

    mapp.ui.Gazetteer(Object.assign({
      mapview: mapview,
      target: gazetteer,
    }, mapview.locale.gazetteer));
    
  } else {

    document.querySelector("[data-id=locations]").style.display = 'none'
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

  mapp.

  // Select locations from hooks.
  mapp.hooks.current.locations.forEach((_hook) => {

    // Split location hook into layer key and id.
    const hook = _hook.split("!");

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
      host: mapview.host,
      idle: mapview.locale.idle,
    });

  // Append user admin link.
  mapp.user?.admin &&
    btnColumn.appendChild(mapp.utils.html.node`
      <a
        title=${mapp.dictionary.toolbar_admin}
        class="mobile-display-none"
        href="${mapview.host + "/api/user/admin"}">
        <div class="mask-icon supervisor-account">`);

  // Append login/logout link.
  document.head.dataset.login &&
    btnColumn.appendChild(mapp.utils.html.node`
      <a
        title="${mapp.user && mapp.dictionary.toolbar_logout || mapp.dictionary.toolbar_login}"
        href="${(mapp.user && "?logout=true") || "?login=true"}">
        <div class="${`mask-icon ${(mapp.user && "logout") || "lock-open"}`}">`);

  // btnColumn.appendChild(mapp.utils.html.node`
  //   <a
  //     title="GEOLYTIX MAPP"
  //     href="https://geolytix.com">
  //     <div class="bg-icon mapp">`);

  // Append spacer for tableview
  btnColumn.appendChild(mapp.utils.html.node`
    <div class="mobile-display-none" style="height: 60px;">`);
};