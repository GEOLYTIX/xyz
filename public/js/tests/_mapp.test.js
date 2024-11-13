(() => {
  // public/tests/_base.test.mjs
  async function base() {
    let mapview = {};
    await codi.describe("Mapview test", async () => {
      console.log(`MAPP v${mapp.version}`);
      const OL = document.getElementById("OL");
      const locationsTab = document.getElementById("locations");
      const layersTab = document.getElementById("layers");
      const tabs = document.querySelectorAll("#ctrl-tabs > div");
      const tabPanels = document.querySelectorAll("#ctrl-panel > div");
      const tabview = document.getElementById("Tabview");
      await codi.it("should merge dictionaries correctly", () => {
        const initialLength = Object.keys(mapp.dictionaries.en).length;
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
            locations: "Locations",
            no_locales: "Your account has been verified and approved, but you do not have access to any locales. This is likely as an administrator has not given you the required roles. Please contact an administrator to resolve this.",
            no_layers: "No accessible layers in locale."
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
          zh: {
            toolbar_zoom_in: "\u653E\u5927",
            toolbar_zoom_out: "\u7F29\u5C0F",
            toolbar_zoom_to_area: "\u7F29\u653E\u81F3\u533A\u57DF",
            toolbar_current_location: "\u5F53\u524D\u4F4D\u7F6E",
            toolbar_fullscreen: "\u5168\u5C4F\u5730\u56FE\u89C6\u56FE",
            toolbar_admin: "\u6253\u5F00\u5E10\u6237\u7BA1\u7406\u89C6\u56FE",
            toolbar_login: "\u767B\u5F55",
            toolbar_logout: "\u767B\u51FA",
            layers: "\u56FE\u5C42",
            locations: "\u5730\u70B9"
          },
          zh_tw: {
            toolbar_zoom_in: "\u653E\u5927",
            toolbar_zoom_out: "\u7E2E\u5C0F",
            toolbar_zoom_to_area: "\u7E2E\u653E\u81F3\u5340\u57DF",
            toolbar_current_location: "\u7576\u524D\u4F4D\u7F6E",
            toolbar_fullscreen: "\u5168\u5C4F\u5730\u5716\u8996\u5716",
            toolbar_admin: "\u6253\u958B\u5E33\u6236\u7BA1\u7406\u8996\u5716",
            toolbar_login: "\u767B\u9304",
            toolbar_logout: "\u767B\u51FA",
            layers: "\u5716\u5C64",
            locations: "\u5730\u9EDE"
          },
          pl: {
            toolbar_zoom_in: "Przybli\u017C",
            toolbar_zoom_out: "Oddal",
            toolbar_zoom_to_area: "Przybli\u017C do obszaru",
            toolbar_current_location: "Obezha lokalizcja",
            toolbar_fullscreen: "Mapa na ca\u0142ym ekranie",
            toolbar_admin: "Otw\xF3rz widok administratora",
            toolbar_login: "Zaloguj si\u0119",
            toolbar_logout: "Wyloguj si\u0119",
            layers: "Warstwy",
            locations: "Lokalizacje"
          },
          fr: {
            toolbar_zoom_in: "Zoom +",
            toolbar_zoom_out: "Zoom -",
            toolbar_zoom_to_area: "Zoomer sur la zone",
            toolbar_current_location: "Emplacement actuel",
            toolbar_fullscreen: "Carte en plein \xE9cran",
            toolbar_admin: "Ouvrir le menu administrateur",
            toolbar_login: "Se connecter",
            toolbar_logout: "D\xE9connexion",
            layers: "Couches cartographiques",
            locations: "Sites"
          },
          ja: {
            toolbar_zoom_in: "\u30BA\u30FC\u30E0\u30A4\u30F3",
            toolbar_zoom_out: "\u30BA\u30FC\u30E0\u30A2\u30A6\u30C8",
            toolbar_zoom_to_area: "\u30A8\u30EA\u30A2\u3092\u30BA\u30FC\u30E0\u306B",
            toolbar_current_location: "\u73FE\u5730",
            toolbar_fullscreen: "\u30D5\u30EB\u30B9\u30AF\u30EA\u30FC\u30F3 \u30DE\u30C3\u30D7\u30D3\u30E5\u30FC",
            toolbar_admin: "\u30A2\u30AB\u30A6\u30F3\u30C8\u30A2\u30C9\u30DF\u30F3\u30D3\u30E5\u30FC\u3092\u958B\u304F",
            toolbar_login: "\u30ED\u30B0\u30A4\u30F3",
            toolbar_logout: "\u30ED\u30B0\u30A2\u30A6\u30C8",
            layers: "\u30EC\u30A4\u30E4\u30FC",
            locations: "\u30ED\u30B1\u30FC\u30B7\u30E7\u30F3"
          },
          esp: {
            toolbar_zoom_in: "Zoom +",
            toolbar_zoom_out: "Zoom -",
            toolbar_zoom_to_area: "Zoom al \xE1rea",
            toolbar_current_location: "Ubicaci\xF3n actual",
            toolbar_fullscreen: "Vista de mapa en pantalla completa",
            toolbar_admin: "Abrir vista de administrador de cuenta",
            toolbar_login: "Iniciar sesi\xF3n",
            toolbar_logout: "Desconexi\xF3n",
            layers: "Capas",
            locations: "Ubicaciones"
          },
          tr: {
            toolbar_zoom_in: "Yaklas",
            toolbar_zoom_out: "Uzaklas",
            toolbar_zoom_to_area: "Bolgeye yaklas",
            toolbar_current_location: "Mevcut konum",
            toolbar_fullscreen: "Tam ekran harita",
            toolbar_admin: "Hesap yoneticisini ac",
            toolbar_login: "Oturum ac",
            toolbar_logout: "Oturumu kapat",
            layers: "Katmanlar",
            locations: "Konumlar"
          },
          it: {
            toolbar_zoom_in: "Ingrandisci",
            toolbar_zoom_out: "Rimpicciolisci",
            toolbar_zoom_to_area: "Zoom nell'area",
            toolbar_current_location: "Posizione attuale",
            toolbar_fullscreen: "Mappa a schermo intero",
            toolbar_admin: "Apri il men\xF9 amministratore",
            toolbar_login: "Log in",
            toolbar_logout: "Log out",
            layers: "Layers",
            locations: "Localit\xE0"
          },
          th: {
            toolbar_zoom_in: "\u0E02\u0E22\u0E32\u0E22\u0E40\u0E02\u0E49\u0E32",
            toolbar_zoom_out: "\u0E0B\u0E39\u0E21\u0E2D\u0E2D\u0E01",
            toolbar_zoom_to_area: "\u0E0B\u0E39\u0E21\u0E44\u0E1B\u0E17\u0E35\u0E48\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48",
            toolbar_current_location: "\u0E2A\u0E16\u0E32\u0E19\u0E17\u0E35\u0E48\u0E1B\u0E31\u0E08\u0E08\u0E38\u0E1A\u0E31\u0E19",
            toolbar_fullscreen: "\u0E21\u0E38\u0E21\u0E21\u0E2D\u0E07\u0E41\u0E1C\u0E19\u0E17\u0E35\u0E48\u0E41\u0E1A\u0E1A\u0E40\u0E15\u0E47\u0E21\u0E2B\u0E19\u0E49\u0E32\u0E08\u0E2D",
            toolbar_admin: "\u0E40\u0E1B\u0E34\u0E14\u0E21\u0E38\u0E21\u0E21\u0E2D\u0E07\u0E1C\u0E39\u0E49\u0E14\u0E39\u0E41\u0E25\u0E23\u0E30\u0E1A\u0E1A",
            toolbar_login: "\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E23\u0E30\u0E1A\u0E1A",
            toolbar_logout: "\u0E2D\u0E2D\u0E01\u0E08\u0E32\u0E01\u0E23\u0E30\u0E1A\u0E1A",
            layers: "\u0E0A\u0E31\u0E49\u0E19",
            locations: "\u0E2A\u0E16\u0E32\u0E19\u0E17\u0E35\u0E48"
          }
        });
        const updatedLength = Object.keys(mapp.dictionaries.en).length;
        codi.assertTrue(updatedLength > initialLength, "English dictionary should have new entries");
        codi.assertEqual(mapp.dictionaries.en.toolbar_zoom_in, "Zoom in", "English dictionary should have the correct value for toolbar_zoom_in");
        codi.assertEqual(mapp.dictionaries.de.toolbar_zoom_in, "Zoom rein", "German dictionary should have the correct value for toolbar_zoom_in");
      });
      await codi.it("should refresh cookie and get user with updated credentials", async () => {
        const currentUser = mapp.user;
        mapp.user = await mapp.utils.xhr(`${mapp.host}/api/user/cookie`);
        if (mapp.user !== null) {
          codi.assertNotEqual(mapp.user, currentUser, "User object should be updated after refreshing cookie");
          codi.assertTrue(mapp.user.hasOwnProperty("email"), 'User object should have the "email" property');
          codi.assertTrue(mapp.user.hasOwnProperty("language"), 'User object should have the "language" property');
          codi.assertTrue(mapp.user.hasOwnProperty("roles"), 'User object should have the "roles" property');
        }
      });
      await codi.it("should set the language correctly", () => {
        const currentLanguage = mapp.language;
        mapp.language = mapp.hooks.current.language || mapp.user?.language || mapp.language;
        if (mapp.hooks.current.language) {
          codi.assertEqual(mapp.language, mapp.hooks.current.language, "Language should be set to the value from mapp.hooks.current.language");
        } else if (mapp.user?.language) {
          codi.assertEqual(mapp.language, mapp.user.language, "Language should be set to the value from mapp.user.language");
        } else {
          codi.assertEqual(mapp.language, currentLanguage, "Language should remain unchanged if no overrides are present");
        }
      });
      await codi.it("should restore scroll if supported", () => {
        if ("scrollRestoration" in history) {
          history.scrollRestoration = "auto";
          codi.assertEqual(history.scrollRestoration, "auto", 'Scroll restoration should be set to "auto"');
        } else {
          codi.assertFalse("scrollRestoration" in history, "Scroll restoration is not supported");
        }
      });
      document.body.addEventListener("scroll", () => {
        OL.style["marginTop"] = `-${parseInt(window.pageYOffset / 2)}px`;
        if (document.body.scrollTop > window.innerHeight) {
          document.body.scrollTop = window.innerHeight;
        }
      });
      mapp.ui.utils.resizeHandler({
        target: document.getElementById("ctrls-divider"),
        resizeEvent: (e) => {
          let pageX = e.touches && e.touches[0].pageX || e.pageX;
          if (pageX < 350)
            return;
          if (pageX > window.innerWidth / 2)
            pageX = window.innerWidth / 2;
          document.body.style.gridTemplateColumns = `${pageX}px 10px auto`;
        }
      });
      mapp.ui.utils.resizeHandler({
        target: document.getElementById("tabview-divider"),
        resizeEvent: (e) => {
          const pageY = e.touches && e.touches[0].pageY || e.pageY;
          if (pageY < 0)
            return;
          let height = window.innerHeight - pageY;
          if (height < 65)
            height = 50;
          if (height > window.innerHeight - 10)
            height = window.innerHeight;
          document.body.style.gridTemplateRows = `auto 10px ${height}px`;
          OL.style.marginTop = `-${height / 2}px`;
        }
      });
      tabs.forEach((tab) => {
        tab.title = mapp.dictionary[tab.dataset.id];
        tab.onclick = (e) => {
          tabs.forEach((el) => el.classList.remove("active"));
          e.target.classList.add("active");
          tabPanels.forEach((el) => el.classList.remove("active"));
          document.getElementById(e.target.dataset.id).classList.add("active");
          if (e.target.dataset.id === "locations") {
            const gazetteerInput = document.getElementById("gazetteerInput");
            gazetteerInput && window.innerWidth > 768 && gazetteerInput.focus();
          }
        };
      });
      await codi.it("should set help text from dictionary", () => {
        tabs.forEach((tab) => {
          tab.title = mapp.dictionary[tab.dataset.id];
          codi.assertEqual(tab.title, mapp.dictionary[tab.dataset.id], "Title should be set from the dictionary");
        });
      });
      await codi.it("should handle tab click events", () => {
        tabs.forEach((tab) => {
          tab.click();
          codi.assertTrue(tab.classList.contains("active"), "Clicked tab should have the active class");
          tabs.forEach((otherTab) => {
            if (otherTab !== tab) {
              codi.assertFalse(otherTab.classList.contains("active"), "Other tabs should not have the active class");
            }
          });
          const panel = document.getElementById(tab.dataset.id);
          codi.assertTrue(panel.classList.contains("active"), "Corresponding panel should have the active class");
          tabPanels.forEach((otherPanel) => {
            if (otherPanel !== panel) {
              codi.assertFalse(otherPanel.classList.contains("active"), "Other panels should not have the active class");
            }
          });
        });
        const layersTab2 = Array.from(tabs).find((tab) => tab.dataset.id === "layers");
        layersTab2.click();
      });
      const testTabView = mapp.ui.Tabview({
        node: tabview,
        id: "tabview",
        showTab: () => {
          if (tabview.classList.contains("desktop-display-none")) {
            tabview.classList.remove("desktop-display-none");
            document.body.style.gridTemplateRows = "auto 10px 50px";
          }
        },
        removeLastTab: () => {
          tabview.classList.add("desktop-display-none");
          document.body.style.gridTemplateRows = "auto 0 0";
          mapview.Map.getTargetElement().style.marginTop = 0;
        }
      });
      const btnColumn = document.getElementById("mapButton");
      const locales = await mapp.utils.xhr(`${mapp.host}/api/workspace/locales`);
      const locale = await mapp.utils.xhr(
        `${mapp.host}/api/workspace/locale?locale=${mapp.hooks.current.locale || locales[0]?.key}&layers=true`
      );
      if (locale instanceof Error) {
        mapp.ui.elements.dialog({
          css_style: "padding: 1em; border-color: #000",
          content: mapp.dictionary.no_locales,
          top: "50%",
          left: "10%"
        });
      }
      if (locales.length > 1) {
        const localesDropdown = mapp.ui.elements.dropdown({
          data_id: "locales-dropdown",
          span: locale.name || locale.key,
          entries: locales.map((locale2) => ({
            title: locale2.name || locale2.key,
            key: locale2.key
          })),
          callback: (e, entry) => {
            window.location.assign(`${mapp.host}?template=test_view&integrity=true&locale=${entry.key}`);
          }
        });
        layersTab.appendChild(mapp.utils.html.node`${localesDropdown}`);
      }
      await codi.it("should retrieve accessible locales from Workspace API", async () => {
        codi.assertTrue(Array.isArray(locales), "Locales should be an array");
        codi.assertNotEqual(locales.length, 0, "Locales array should not be empty");
      });
      await codi.it("should retrieve locale with list of layers from Workspace API", async () => {
        codi.assertFalse(locale instanceof Error, "Locale should not be an instance of Error");
        codi.assertTrue(locale.hasOwnProperty("name"), 'Locale should have a "name" property');
        codi.assertTrue(locale.hasOwnProperty("key"), 'Locale should have a "key" property');
        codi.assertTrue(locale.hasOwnProperty("layers"), 'Locale should have a "layers" property');
      });
      if (locale instanceof Error) {
        await codi.it("should display an error dialog if locale is an instance of Error", async () => {
          const errorDialog = document.querySelector(".dialog-modal");
          codi.assertNotEqual(errorDialog, null, "Error dialog should be appended to the document body");
          codi.assertEqual(errorDialog.textContent.trim(), mapp.dictionary.no_locales, "Error dialog should display the correct message");
        });
      }
      if (locales.length > 1) {
        await codi.it("should add locale dropdown to layers panel if multiple locales are accessible", async () => {
          const dropdown = layersTab.querySelector('[data-id="locales-dropdown"]');
          codi.assertNotEqual(dropdown, null, "Locale dropdown should be appended to the layers tab");
        });
      }
      if (!window.ol)
        await mapp.utils.olScript();
      locale.syncPlugins ??= ["zoomBtn", "admin", "login"];
      mapview = await mapp.Mapview({
        host: mapp.host,
        target: OL,
        locale,
        hooks: false,
        scrollWheelZoom: true,
        attribution: {
          target: document.getElementById("Map"),
          logo: mapp.utils.html.node`
    <a class="logo" target="_blank" href="https://geolytix.co.uk">
      <img src="https://geolytix.github.io/public/geolytix_mapp.svg">`,
          links: {
            [`XYZ v${mapp.version}`]: "https://github.com/GEOLYTIX/xyz",
            ["SHA"]: `https://github.com/GEOLYTIX/xyz/commit/${mapp.hash}`,
            Openlayers: "https://openlayers.org"
          }
        },
        syncPlugins: locale.syncPlugins,
        svgTemplates: locale.svg_templates
      });
      if (!locale.layers?.length) {
        mapp.ui.elements.dialog({
          css_style: "padding: 1em; border-color: #000;",
          content: mapp.dictionary.no_layers,
          target: document.getElementById("Map"),
          top: "50%",
          left: "50%"
        });
      }
      await mapview.addLayer(locale.layers);
      if (mapview.locale.gazetteer) {
        mapp.ui.Gazetteer(Object.assign(mapview.locale.gazetteer, {
          mapview,
          target: locationsTab.appendChild(mapp.utils.html.node`<div>`)
        }));
      } else {
        document.querySelector("[data-id=locations]").style.display = "none";
      }
      mapp.ui.layers.listview({
        target: layersTab,
        mapview
      });
      mapp.ui.locations.listview({
        target: locationsTab,
        mapview
      });
      mapview.interactions.highlight();
      mapp.hooks.current.locations.forEach((_hook) => {
        const hook = _hook.split("!");
        mapp.location.get({
          layer: mapview.layers[decodeURIComponent(hook[0])],
          id: hook[1]
        });
      });
      await codi.it("should create a mapview", async () => {
        codi.assertNotEqual(mapview, void 0, "Mapview should be created");
        codi.assertTrue(mapview.hasOwnProperty("host"), 'Mapview should have a "host" property');
        codi.assertTrue(mapview.hasOwnProperty("target"), 'Mapview should have a "target" property');
        codi.assertTrue(mapview.hasOwnProperty("locale"), 'Mapview should have a "locale" property');
        codi.assertTrue(mapview.hasOwnProperty("hooks"), 'Mapview should have a "hooks" property');
        codi.assertTrue(mapview.hasOwnProperty("scrollWheelZoom"), 'Mapview should have a "scrollWheelZoom" property');
        codi.assertTrue(mapview.hasOwnProperty("attribution"), 'Mapview should have an "attribution" property');
      });
      await codi.it("should add layers to mapview", async () => {
        codi.assertTrue(Object.keys(mapview.layers).length > 0, "Mapview should have layers");
      });
      await codi.it("should create a gazetteer if available in the locale", async () => {
        if (mapview.locale.gazetteer) {
          const gazetteer = locationsTab.querySelector("div");
          codi.assertNotEqual(gazetteer, null, "Gazetteer should be created");
        } else {
          const locationsTabElement = document.querySelector("[data-id=locations]");
          codi.assertEqual(locationsTabElement.style.display, "none", "Locations tab should be hidden");
        }
      });
      await codi.it("should create a layers listview", async () => {
        const listview = layersTab.querySelector("div");
        codi.assertNotEqual(listview, null, "Layers listview should be created");
      });
      if (mapview.locale.gazetteer) {
        await codi.it("should create a locations listview", async () => {
          const listview = locationsTab.querySelector("div");
          codi.assertNotEqual(listview, null, "Locations listview should be created");
        });
      }
      await codi.it("should begin highlight interaction", async () => {
        codi.assertTrue(mapview.interactions.hasOwnProperty("highlight"), 'Mapview should have a "highlight" interaction');
      });
      mapp.user && mapview.locale.idle && mapp.ui.utils.idleLogout({
        host: mapp.host,
        idle: mapview.locale.idle
      });
      btnColumn.appendChild(mapp.utils.html.node`
<div class="mobile-display-none" style="height: 60px;">`);
      await codi.it("should show the tabview when showTab is called", () => {
        tabview.classList.add("desktop-display-none");
        testTabView.showTab();
        codi.assertFalse(tabview.classList.contains("desktop-display-none"), 'Tabview should not have the "desktop-display-none" class after showTab is called');
        codi.assertEqual(document.body.style.gridTemplateRows, "auto 10px 50px", 'Grid template rows should be set to "auto 10px 50px" after showTab is called');
      });
      await codi.it("should hide the tabview when removeLastTab is called", () => {
        tabview.classList.remove("desktop-display-none");
        testTabView.removeLastTab();
        codi.assertTrue(tabview.classList.contains("desktop-display-none"), 'Tabview should have the "desktop-display-none" class after removeLastTab is called');
        codi.assertEqual(document.body.style.gridTemplateRows, "auto 0px 0px", 'Grid template rows should be set to "auto 0 0" after removeLastTab is called');
        codi.assertEqual(mapview.Map.getTargetElement().style.marginTop, "0px", "Margin top of the map target element should be set to 0 after removeLastTab is called");
      });
    });
    return mapview;
  }

  // tests/browser/local.test.mjs
  async function coreTest() {
    await _mappTest.workspaceTest();
    await _mappTest.queryTest();
    const mapview = await _mappTest.base();
    await runAllTests(_mappTest.userTest);
    await runAllTests(_mappTest.mappTest);
    await runAllTests(_mappTest.dictionaryTest, mapview);
    await runAllTests(_mappTest.pluginsTest);
    await runAllTests(_mappTest.layerTest, mapview);
    await runAllTests(_mappTest.locationTest, mapview);
    await runAllTests(_mappTest.mapviewTest, mapview);
    await runAllTests(_mappTest.ui_elementsTest, mapview);
    await runAllTests(_mappTest.entriesTest, mapview);
    await runAllTests(_mappTest.ui_layers, mapview);
    await runAllTests(_mappTest.uiTest);
    await runAllTests(_mappTest.formatTest, mapview);
    await runAllTests(_mappTest.ui_locations, mapview);
    await runAllTests(_mappTest.utilsTest, mapview);
  }
  async function runAllTests(tests, mapview) {
    const testFunctions = Object.values(tests).filter((item) => typeof item === "function");
    for (const testFn of testFunctions) {
      try {
        await testFn(mapview);
      } catch (error) {
        console.error(`Error in test ${testFn.name}:`, error);
      }
    }
  }

  // tests/lib/mapp.test.mjs
  var mappTest = {
    base: base2
  };
  function base2() {
    codi.describe("Mapp base object test", () => {
      codi.it("Mapp: Ensure we have base objects", () => {
        codi.assertTrue(Object.hasOwn(mapp, "ol", "The mapp object needs to have an ol object"));
        codi.assertTrue(Object.hasOwn(mapp, "version", "The mapp object needs to have an version object"));
        codi.assertTrue(Object.hasOwn(mapp, "hash", "The mapp object needs to have an hash object"));
        codi.assertTrue(Object.hasOwn(mapp, "host", "The mapp object needs to have an host object"));
        codi.assertTrue(Object.hasOwn(mapp, "language", "The mapp object needs to have an language object"));
        codi.assertTrue(Object.hasOwn(mapp, "dictionaries", "The mapp object needs to have an dictionaries object"));
        codi.assertTrue(Object.hasOwn(mapp, "dictionary", "The mapp object needs to have an dictionary object"));
        codi.assertTrue(Object.hasOwn(mapp, "hooks", "The mapp object needs to have an hooks object"));
        codi.assertTrue(Object.hasOwn(mapp, "layer", "The mapp object needs to have an layer object"));
        codi.assertTrue(Object.hasOwn(mapp, "location", "The mapp object needs to have an location object"));
        codi.assertTrue(Object.hasOwn(mapp, "Mapview", "The mapp object needs to have an Mapview object"));
        codi.assertTrue(Object.hasOwn(mapp, "utils", "The mapp object needs to have an utils object"));
        codi.assertTrue(Object.hasOwn(mapp, "plugins", "The mapp object needs to have an plugins object"));
      });
    });
  }

  // tests/utils/view.js
  var views = {
    "default": {
      lat: "0",
      long: "-7.081154551613622e-10"
    },
    "london": {
      lat: "-14035.161399215933",
      long: "6708600.902178298"
    },
    "sandton": {
      lat: "3123319.665346",
      long: "-3012437.111737"
    }
  };
  async function setView(mapview, z, view) {
    await mapview.Map.getView().setZoom(z);
    await mapview.Map.getView().setCenter([views[view].lat, views[view].long]);
  }

  // tests/assets/layers/wkt/layer.json
  var layer_default = {
    group: "layer",
    format: "wkt",
    dbs: "NEON",
    table: "test.scratch",
    srid: "3857",
    geom: "geom_3857",
    qID: "id"
  };

  // tests/assets/layers/wkt/infoj.json
  var infoj_default = {
    infoj: [
      {
        title: "qID",
        field: "id",
        inline: true
      },
      {
        type: "key"
      },
      {
        type: "pin",
        label: "ST_PointOnSurface",
        field: "pin",
        fieldfx: "ARRAY[ST_X(ST_PointOnSurface(geom_3857)),ST_Y(ST_PointOnSurface(geom_3857))]"
      },
      {
        title: "textarea",
        field: "textarea",
        edit: true
      },
      {
        title: "char_field",
        field: "char_field"
      }
    ]
  };

  // tests/assets/layers/wkt/style.json
  var style_default = {
    style: {
      default: {
        strokeColor: "#333",
        fillColor: "#fff9",
        icon: {
          type: "dot"
        }
      },
      cluster: {
        clusterScale: 1
      },
      highlight: {
        scale: 1.3,
        strokeColor: "#090"
      }
    }
  };

  // tests/lib/layer/decorate.test.mjs
  async function decorateTest(mapview, layer, infoj, style) {
    layer ??= layer_default;
    infoj ??= infoj_default;
    style ??= style_default;
    await setView(mapview, 2, "default");
    await codi.describe("Layer: decorateTest", async () => {
      const infoj_skip = [
        "textarea"
      ];
      layer = {
        mapview,
        ...infoj,
        infoj_skip,
        ...style,
        ...layer
      };
      await mapp.layer.decorate(layer);
      await codi.it("Should have a draw object", async () => {
        codi.assertTrue(Object.hasOwn(layer, "draw"), "The layer should have a draw object by default");
      });
      await codi.it("Should have a show function", async () => {
        codi.assertTrue(Object.hasOwn(layer, "show"), "The layer should have a show method by default");
        codi.assertTrue(typeof layer.display === "undefined", "The layer shouldn't have a display flag");
        layer.show();
        codi.assertTrue(layer.display, "The layer should now display true after displaying");
      });
      await codi.it("Should have a hide function", async () => {
        codi.assertTrue(Object.hasOwn(layer, "hide"), "The layer should have a hide method by default");
        layer.hide();
        codi.assertFalse(layer.display, "The layer should display as false");
      });
      await codi.it("Should not have an edit object", async () => {
        codi.assertTrue(!layer.edit, "The layer should not have an edit object as its been deprecated.");
      });
      await codi.it("Should add the skipEntry flag to the textArea entry", async () => {
        layer.infoj.filter((entry) => entry.field === "textarea").forEach((entry) => {
          codi.assertTrue(entry.skipEntry, "The layer should have a hide method by default");
        });
      });
      await setView(mapview, 11, "london");
      await codi.it("Should get test.public table at zoom level 11", async () => {
        const table = layer.tableCurrent();
        codi.assertTrue(typeof table === "string");
      });
      await codi.it("Should get geom_3857 geom at zoom level 11", async () => {
        const geom = layer.geomCurrent();
        codi.assertTrue(typeof geom === "string", "The geometry should be returned from the layer");
      });
      await codi.it("Should be able to zoomToExtent", async () => {
        const success = await layer.zoomToExtent();
        codi.assertTrue(success, "We should see the layer zoom to extent");
      });
    });
  }

  // tests/lib/layer/fade.test.mjs
  async function fadeTest(mapview) {
    await setView(mapview, 2, "default");
    await codi.describe("TODO: Layer: fadeTest", async () => {
      await codi.it("Should should test for something", () => {
        console.warn("The Fade module needs to be re-reviewed.");
      });
    });
  }

  // tests/lib/layer/featureFields.test.mjs
  async function featureFieldsTest() {
    await codi.describe("TODO: Layer: featureFieldsTest", async () => {
      await codi.it("The fields array on on a theme should not be duplicated", () => {
        const layer = {
          params: {
            default_fields: ["zIndex"]
          },
          style: {
            theme: {
              field: "field_22",
              fields: [
                "field_00",
                "field_01",
                "field_02",
                "field_03",
                "field_04",
                "field_05",
                "field_06",
                "field_07",
                "field_08",
                "field_09",
                "field_10",
                "field_11",
                "field_12",
                "field_13",
                "field_14",
                "field_15",
                "field_16",
                "field_17",
                "field_18",
                "field_19",
                "field_20",
                "field_21",
                "field_22",
                "field_22",
                "field_23"
              ]
            },
            label: { field: "another_field" },
            icon_scaling: {
              field: "another_field"
            },
            cluser: {
              label: "another_field"
            }
          }
        };
        const featureArray = mapp.layer.featureFields.fieldsArray(layer);
        codi.assertNoDuplicates(featureArray);
      });
    });
  }

  // tests/lib/layer/featureFormats.test.mjs
  async function featureFormatsTest() {
    codi.describe("Layer: featureFormatsTest", () => {
      const mapview = {
        srid: "3857"
      };
      const layer = {
        format: "wkt",
        params: {
          fields: [
            "size"
          ]
        },
        style: {
          icon_scaling: {
            field: "size"
          },
          hover: {
            field: "id"
          }
        },
        mapview
      };
      const wktFeatures = [
        [
          1,
          "POINT(-14400 6710852)",
          null
        ],
        [
          2,
          "POINT(-14920 6711046)",
          10
        ],
        [
          3,
          "POINT(-15322 6710796)",
          15
        ]
      ];
      const geojsonFeatures = [
        {
          "type": "Feature",
          "id": 1,
          "properties": {
            "id": 1,
            "name": "Central Park",
            "type": "Park",
            "city": "New York",
            "size": 100
          },
          "geometry": {
            "type": "Polygon",
            "coordinates": [[
              [-73.968285, 40.785091],
              [-73.968285, 40.764891],
              [-73.949318, 40.764891],
              [-73.949318, 40.785091],
              [-73.968285, 40.785091]
            ]]
          }
        },
        {
          "type": "Feature",
          "id": 2,
          "properties": {
            "id": 2,
            "name": "Empire State Building",
            "type": "Building",
            "size": 200
          },
          "geometry": {
            "type": "Point",
            "coordinates": [-73.985428, 40.748817]
          }
        },
        {
          "type": "Feature",
          "id": 3,
          "properties": {
            "id": 3,
            "name": "Broadway",
            "type": "Road",
            "size": 300
          },
          "geometry": {
            "type": "LineString",
            "coordinates": [
              [-73.987381, 40.758896],
              [-73.98603, 40.757355],
              [-73.984442, 40.755823],
              [-73.98294, 40.754274]
            ]
          }
        }
      ];
      codi.it("WKT: Test style.icon_scaling", () => {
        mapp.layer.featureFormats[layer.format](layer, wktFeatures);
        codi.assertEqual(layer.style.icon_scaling.max, 15, "The Icon scaling max should equal to 15");
      });
      codi.it("WKT: featureFormats test", () => {
        const assertIDArray = [1, 2, 3];
        const assertSizeArray = [null, 10, 15];
        const features = mapp.layer.featureFormats[layer.format](layer, wktFeatures);
        features.forEach((feature, index) => {
          codi.assertEqual(feature.values_.id, assertIDArray[index]);
          codi.assertEqual(feature.values_.size, assertSizeArray[index]);
        });
      });
      codi.it("geojson: featureFormats test", () => {
        layer.format = "geojson";
        const assertIDArray = [1, 2, 3];
        const assertSizeArray = [100, 200, 300];
        const features = mapp.layer.featureFormats[layer.format](layer, geojsonFeatures);
        features.forEach((feature, index) => {
          codi.assertEqual(feature.values_.id, assertIDArray[index]);
          codi.assertEqual(feature.values_.size, assertSizeArray[index]);
        });
      });
    });
  }

  // tests/lib/layer/featureHover.test.mjs
  async function featureHoverTest() {
    codi.describe("TODO: Layer: featureHoverTest", () => {
      codi.it("Should should test for something", () => {
      });
    });
  }

  // tests/lib/layer/featureStyle.test.mjs
  async function featureStyleTest(mapview) {
    await codi.describe("TODO: Layer: featureStyleTest", async () => {
    });
  }

  // tests/lib/layer/styleParser.test.mjs
  async function styleParserTest(mapview) {
    await codi.describe("TODO: Layer: styleParserTest", async () => {
      console.warn("The Style parse modules need to be broken up and exported for easier testability");
    });
  }

  // tests/lib/layer/_layer.test.mjs
  var layerTest = {
    decorateTest,
    fadeTest,
    featureFieldsTest,
    featureFormatsTest,
    featureHoverTest,
    featureStyleTest,
    styleParserTest
  };

  // tests/lib/dictionaries/baseDictionary.test.mjs
  async function baseDictionaryTest() {
    await codi.describe("All languages should have the same base language entries", async () => {
      const base_dictionary = {
        save: "",
        cancel: "",
        confirm_delete: "",
        invalid_geometry: "",
        no_results: ""
      };
      for (const language of Object.keys(mapp.dictionaries)) {
        await codi.it(`${language} dictionary should have all the base keys`, () => {
          for (const key of Object.keys(base_dictionary)) {
            codi.assertTrue(!!mapp.dictionaries[language][key], `${language} should have ${key}`);
          }
        });
      }
    });
  }

  // tests/lib/dictionaries/keyValueDictionary.test.mjs
  async function keyValueDictionaryTest(mapview) {
    await codi.describe("Key Value Dictionary Tests", async () => {
      await codi.it("should replace the key value dictionary for default value on a layer", () => {
        const osm = mapview.locale.layers.find((layer) => layer.key === "OSM");
        codi.assertEqual(osm.name, "OpenStreetMap KeyValue Dictionary");
      });
      await codi.it("should replace the key value dictionary for default value in an infoj", () => {
        const changeEnd = mapview.locale.layers.find((layer) => layer.key === "changeEnd");
        const entry = changeEnd.infoj.find((entry2) => entry2.field === "textarea");
        codi.assertEqual(entry.title, "TextArea KeyValue Dictionary");
      });
      await codi.it("should not replace the key value dictionary for an array", () => {
        const changeEnd = mapview.locale.layers.find((layer) => layer.key === "changeEnd");
        const array = changeEnd.test_array;
        const expected = ["TEST KEYVALUE"];
        codi.assertEqual(array, expected);
      });
    });
  }

  // tests/lib/dictionaries/unknownLanguageTest.test.mjs
  async function unknownLanguageTest() {
    await codi.describe("Language TEST should default language to English", async () => {
      await codi.it("Should default to English", () => {
        codi.assertEqual(mapp.language, "en");
      });
    });
  }

  // tests/lib/dictionaries/_dictionaries.test.mjs
  var dictionaryTest = {
    baseDictionaryTest,
    keyValueDictionaryTest,
    unknownLanguageTest
  };

  // tests/lib/location/create.test.mjs
  async function createTest() {
  }

  // tests/lib/location/get.test.mjs
  async function getTest(mapview) {
    await codi.describe("Location: getTest", async () => {
      const location_layer = mapview.layers["location_get_test"];
      const location_layer_no_infoj = mapview.layers["location_get_test_no_infoj"];
      await codi.it("We should be able to mock a location get.", async () => {
        const location = await mapp.location.get({
          layer: location_layer,
          getTemplate: "get_location_mock",
          id: 6
        });
        codi.assertEqual(location.infoj.length, 4, "We expect to see three infoj entries");
        codi.assertEqual(location.record.hook, "location_get_test!6", "We expect a hook made up of layer key and id");
        codi.assertTrue(location.layer instanceof Object, "The location needs a layer object");
        location.removeCallbacks.push((_this) => delete _this.removeCallbacks);
        location.remove();
        codi.assertTrue(!location.record.hook, "The hook should be removed from the location record.");
        codi.assertTrue(!location.removeCallbacks, "removeCallbacks should have removed themselves.");
      });
      await codi.it("Location get should return undefined if location.layer.info is undefined.", async () => {
        const location = await mapp.location.get({
          layer: location_layer_no_infoj,
          getTemplate: "get_location_mock",
          id: 6
        });
        codi.assertEqual(location, void 0, "The Location should be undefined");
      });
      await codi.it("The getInfoj method should return an infoj if none is provided on the layer present.", async () => {
        const infoj = await mapp.location.getInfoj({
          layer: location_layer_no_infoj,
          getTemplate: "get_location_mock",
          id: 6
        });
        codi.assertTrue(infoj !== void 0, "The Location should be undefined");
      });
    });
  }

  // tests/lib/location/nnearest.test.mjs
  async function nnearestTest() {
    codi.describe("TODO: Location: nnearestTest", () => {
      codi.it("Should should test for something", () => {
      });
    });
  }

  // tests/lib/location/_location.test.mjs
  var locationTest = {
    createTest,
    getTest,
    nnearestTest
  };

  // tests/lib/mapview/addLayer.test.mjs
  async function addLayerTest(mapview) {
    await codi.describe("Mapview: addLayerTest", async () => {
      await codi.it("Add single layer to mapview.", async () => {
        const layer = {
          "format": "tiles",
          "URI": "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        };
        const layers = await mapview.addLayer(layer);
        codi.assertEqual(layers.length, 1, "We expect to see 1 layer being returned from getLayers method.");
        codi.assertTrue(layers[0].show instanceof Function, "The decorated layer has a show method.");
        codi.assertTrue(Object.hasOwn(mapview.layers, layers[0].key), "The layer has been added to the mapview.");
      });
      await codi.it("Add multiple layer to mapview.", async () => {
        const layer = {
          "format": "tiles",
          "URI": "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        };
        const layers = await mapview.addLayer([layer, layer]);
        codi.assertEqual(layers.length, 2, "We expect to see 2 layer being returned from getLayers method.");
        codi.assertTrue(layers[0].show instanceof Function, "The first decorated layer has a show method.");
        codi.assertTrue(Object.hasOwn(mapview.layers, layers[0].key), "The first layer has been added to the mapview.");
      });
    });
  }

  // tests/lib/mapview/allfeatures.test.mjs
  async function allfeaturesTest() {
  }

  // tests/lib/mapview/attribution.test.mjs
  async function attributionTest() {
  }

  // tests/lib/mapview/fitView.test.mjs
  async function fitViewTest() {
  }

  // tests/lib/mapview/geojson.test.mjs
  async function geoJSONTest() {
  }

  // tests/lib/mapview/geometry.test.mjs
  async function geometryTest() {
  }

  // tests/lib/mapview/getBounds.test.mjs
  async function getBoundsTest() {
  }

  // tests/lib/mapview/infotip.test.mjs
  async function infotipTest() {
  }

  // tests/lib/mapview/locate.test.mjs
  async function locateTest() {
  }

  // tests/lib/mapview/popup.test.mjs
  async function popupTest() {
  }

  // tests/lib/mapview/olcontrols.test.mjs
  async function olControlsTest(mapview) {
    await codi.describe("Mapview", async () => {
      await codi.it("The Mapview should have controls", () => {
        codi.assertTrue(mapview.controls.length >= 1, "The ol controls array should be greater or equal to 1");
      });
    });
  }

  // tests/lib/mapview/_mapview.test.mjs
  var mapviewTest = {
    olControlsTest,
    addLayerTest,
    allfeaturesTest,
    attributionTest,
    fitViewTest,
    geoJSONTest,
    geometryTest,
    getBoundsTest,
    infotipTest,
    locateTest,
    popupTest
  };

  // tests/plugins/link_button.test.mjs
  function linkButtonTest() {
    codi.describe("Link Button Test", () => {
      codi.it("Should add a link button to the mapButton panel", () => {
        const mapButton = document.getElementById("mapButton");
        const linkButton = mapButton.querySelector('a[title="TITLE HERE"]');
        codi.assertEqual(linkButton.getAttribute("href"), "/url/url");
      });
      codi.it("Should not add a button if no href is provided", () => {
        const mapButton = document.getElementById("mapButton");
        const linkButton = mapButton.querySelector('a[title="SHOULD NOT BE ADDED AS NO HREF"]');
        codi.assertTrue(!linkButton);
      });
      codi.it("Should add multiple buttons if the link_button config is an array", () => {
        const mapButton = document.getElementById("mapButton");
        const linkButton = mapButton.querySelector('a[title="TITLE HERE"]');
        const linkButton2 = mapButton.querySelector('a[title="WILL BE ADDED AS HREF"]');
        codi.assertEqual(linkButton.getAttribute("href"), "/url/url");
        codi.assertEqual(linkButton2.getAttribute("href"), "/url/url2");
      });
    });
  }

  // tests/plugins/_plugins.test.mjs
  var pluginsTest = {
    linkButtonTest
  };

  // tests/mod/workspace/_workspace.test.mjs
  async function workspaceTest(mapview) {
    await codi.describe("Workspace: Testing Workspace API", async () => {
      await codi.it("Workspace: Getting Locales", async () => {
        const locales = await mapp.utils.xhr(`/test/api/workspace/locales`);
        codi.assertEqual(locales[0].key, "locale", "Ensure that we are getting a locale back from the API");
      });
      await codi.it("Workspace: Getting a Locale", async () => {
        const locale = await mapp.utils.xhr(`/test/api/workspace/locale?locale=locale`);
        codi.assertTrue(!!locale.key, "The locale should have a key property");
        codi.assertTrue(!!locale.layers, "The locale should have layers");
        codi.assertTrue(!!locale.name, "The locale should have a name");
        codi.assertTrue(!!locale.plugins, "The locale should have plugins");
        codi.assertTrue(!!locale.syncPlugins, "The locale should have syncPlugins");
      });
      await codi.it("Workspace: Getting template_test Layer", async () => {
        let layer = await mapp.utils.xhr(`/test/api/workspace/layer?layer=template_test`);
        codi.assertEqual(layer.key, "template_test", "Ensure that we get the template_test layer from the API");
        codi.assertTrue(!!layer.table, "Ensure that the layer has a table");
        codi.assertTrue(!!layer.geom, "Ensure that the layer has a geom");
        codi.assertTrue(!!layer.group, "Ensure that the layer has a group");
        codi.assertEqual(layer.infoj.length, 7, "The infoj should always have 7 infoj entries");
        codi.assertTrue(!!layer.style, "The layer needs to have a style object from another template");
        layer = await mapp.utils.xhr(`/test/api/workspace/layer?layer=template_test`);
        codi.assertEqual(layer.infoj.length, 7, "The infoj should always have 7 infoj entries");
        codi.assertTrue(!!layer.style, "The layer needs to have a style object from another template");
        codi.assertTrue(!!layer.err, "The layer should have a error array");
        codi.assertEqual(layer.err.length, 1, "There should be on failure on the layer");
      });
      await codi.it("Workspace: Getting template_test_vanilla Layer", async () => {
        const layer = await mapp.utils.xhr(`/test/api/workspace/layer?layer=template_test_vanilla`);
        codi.assertEqual(layer.key, "template_test_vanilla", "Ensure that we get the template_test_vanilla layer from the API");
        codi.assertEqual(layer.infoj.length, 6, "The infoj should always have 6 infoj entries");
        codi.assertTrue(!!layer.style, "The layer needs to have a style object from another template");
      });
      await codi.it("Workspace: Getting Roles", async () => {
        const roles = await mapp.utils.xhr(`/test/api/workspace/roles`);
        const expected_roles = ["A", "B", "C", "test", "super_test"];
        codi.assertEqual(roles, expected_roles, "Ensure that we get the correct roles from the API");
      });
      await codi.it("Should return an array of roles as defined in the workspace", async () => {
        const response = await fetch("api/workspace/roles");
        const roles = await response.json();
        codi.assertTrue(Array.isArray(roles));
        await codi.it("Roles should contain A", async () => {
          codi.assertTrue(roles.includes("A"));
        });
        await codi.it("Roles should contain B", async () => {
          codi.assertTrue(roles.includes("B"));
        });
        await codi.it("Roles should contain C", async () => {
          codi.assertTrue(roles.includes("C"));
        });
        await codi.it("Roles should not contain *", async () => {
          codi.assertTrue(!roles.includes("*"));
        });
      });
      await codi.it("Should return an object of workspace roles with definitions", async () => {
        const response = await fetch("api/workspace/roles?detail=true");
        const roles = await response.json();
        codi.assertTrue(typeof roles === "object");
        await codi.it("Roles object should contain A with value = Text about A", async () => {
          codi.assertTrue(roles.A === "Text about A");
        });
        await codi.it("Roles object should contain B with value = Text about A", async () => {
          codi.assertTrue(roles.B === "Text about B");
        });
        await codi.it("Roles object should contain C with value = {}", async () => {
          codi.assertTrue(typeof roles.C === "object");
        });
        await codi.it("Roles object should not contain *", async () => {
          codi.assertTrue(!roles["*"]);
        });
      });
      await codi.it("Workspace: Testing the test endpoint", async () => {
        let workspace_test = await mapp.utils.xhr(`/test/api/workspace/test`);
        const counts = {
          errors: workspace_test.errors.length,
          overwritten_templates: workspace_test.overwritten_templates.length,
          unused_templates: workspace_test.unused_templates.length,
          usage: Object.keys(workspace_test.usage).length
        };
        codi.assertTrue(workspace_test.errors.length > 0, "The errors array needs to have more than 1 entry");
        codi.assertTrue(workspace_test.overwritten_templates.length > 0, "The overwritten templates array needs to have more than 1 entry");
        codi.assertTrue(workspace_test.unused_templates.length > 0, "The unsused templates array needs to have more than 1 entry");
        codi.assertTrue(Object.keys(workspace_test.usage).length > 0, "The usage object needs to have keys");
        workspace_test = await mapp.utils.xhr(`/test/api/workspace/test`);
        codi.assertEqual(workspace_test.errors.length, counts.errors, "The errors array needs to have the same number of entries we did the first run");
        codi.assertEqual(workspace_test.overwritten_templates.length, counts.overwritten_templates, "The overwritten templates array needs to have the same number of entries we did the first run");
        codi.assertEqual(workspace_test.unused_templates.length, counts.unused_templates, "The unused templates array needs to have the same number of entries we did the first run");
        codi.assertEqual(Object.keys(workspace_test.usage).length, counts.usage, "The usage templates object needs to have the same number of entries we did the first run");
      });
    });
  }

  // tests/mod/query.test.mjs
  async function queryTest() {
    await codi.describe("Query: Testing Query API", async () => {
      await codi.it("Query: Testing Query defined on infoj entry", async () => {
        const expected_result = [1, 2, 5, 3, 4];
        const results = await mapp.utils.xhr(`/test/api/query?template=data_array`);
        codi.assertEqual(results, expected_result, "We should be able to just call the template even if its not part of the workspace.templates object in configuration");
      });
      await codi.it("Query: Testing Module defined in templates", async () => {
        const expected_result = {
          "bar": "foo"
        };
        const results = await mapp.utils.xhr(`/test/api/query?template=module_test`);
        codi.assertEqual(results, expected_result, "The Module should return the basic query");
      });
      await codi.it("Query: Testing a query with a bogus dbs string via the req params", async () => {
        const expected_result = {
          "bar": "foo"
        };
        const results = await mapp.utils.xhr(`/test/api/query?template=module_test&dbs=bogus`);
        codi.assertEqual(results, expected_result, "The Module should return the basic query");
      });
      await codi.it("Query: Testing a query with a bogus dbs on the template", async () => {
        const results = await mapp.utils.xhr(`/test/api/query?template=bogus_data_array`);
        codi.assertTrue(results instanceof Error, "We should return an error for a bogus DBS connection");
      });
    });
  }

  // tests/mod/user/update.test.mjs
  async function updateTest() {
    if (mapp.user) {
      await codi.describe("User: update", async () => {
        await codi.it("update endpoint should be able to process a body", async () => {
          let params = {
            url: "/test/api/user/update",
            body: JSON.stringify(
              {
                email: "test@geolytix.co.uk",
                admin: false,
                approved: false,
                verified: false
              }
            )
          };
          await mapp.utils.xhr(params);
          params = {
            url: "/test/api/user/update",
            body: JSON.stringify(
              {
                email: "test@geolytix.co.uk",
                admin: true,
                approved: true,
                verified: false
              }
            )
          };
          await mapp.utils.xhr(params);
          const acl = await mapp.utils.xhr("/test/api/user/list");
          const test_user = acl.filter((user) => user.email === "test@geolytix.co.uk")[0];
          await codi.assertEqual(test_user.email, "test@geolytix.co.uk", "The users email address should be test@geolytix.co.uk");
          await codi.assertFalse(test_user.verified, "The user should be not verified");
          await codi.assertTrue(test_user.admin, "The user should an admin");
          await codi.assertTrue(test_user.approved, "The user should be approved");
        });
        await codi.it("update endpoint should be able to be just params", async () => {
          const url = `/test/api/user/update?email=test@geolytix.co.uk&field=admin&value=false`;
          await mapp.utils.xhr(url);
          const acl = await mapp.utils.xhr("/test/api/user/list");
          const test_user = acl.filter((user) => user.email === "test@geolytix.co.uk")[0];
          await codi.assertEqual(test_user.email, "test@geolytix.co.uk", "The users email address should be test@geolytix.co.uk");
          await codi.assertFalse(test_user.verified, "The user should be not verified");
          await codi.assertFalse(test_user.admin, "The user should an admin");
          await codi.assertTrue(test_user.approved, "The user should be approved");
        });
      });
    }
  }

  // tests/mod/user/_user.test.js
  var userTest = {
    updateTest
  };

  // tests/lib/ui/elements/slider.test.mjs
  async function sliderTest() {
    await codi.describe("UI elements: slider", async () => {
      await codi.it("Should return the slider", async () => {
        const workspace = await mapp.utils.xhr(`/test/tests/workspace.json`);
        const layer = workspace.locale.layers["input_slider"];
        const input_slider_params = layer.infoj.filter((entry) => entry.field === "integer_field");
        const input_slider = mapp.ui.elements.slider(input_slider_params[0]);
        const input_slider_element = input_slider.getElementsByTagName("input")[1];
        const assert_input = `<input data-id="a" name="rangeInput" type="range" min="-100000" max="10000" step="1">`;
        codi.assertEqual(input_slider_element.outerHTML, assert_input, "We expect to see the input defined in the test");
      });
    });
  }

  // tests/lib/ui/elements/layerStyle.test.mjs
  async function layerStyleTest(mapview) {
    await codi.describe("UI elements: layerStyle", async () => {
      const style = {
        opacitySlider: true,
        cluster: {
          clusterScale: 5
        },
        icon_scaling: {
          field: "size",
          icon: true,
          clusterScale: true,
          zoomInScale: true,
          zoomOutScale: true
        },
        hover: {
          display: true,
          title: "Hover title",
          field: "hover_1",
          label: "I am a hover label"
        },
        hovers: {
          hover_1: {
            title: "Hover title",
            field: "hover_1",
            display: true,
            label: "I am a hover label"
          },
          hover_2: {
            title: "Hover title 2",
            field: "hover_2",
            display: true,
            label: "I am a hover label"
          }
        },
        label: "label_2",
        labels: {
          label_1: {
            title: "Label title",
            display: true,
            field: "label_1",
            label: "I am labels label"
          },
          label_2: {
            title: "Label title 2",
            display: true,
            field: "label_2",
            label: "I am a labels label"
          }
        },
        theme: {
          title: "Theme title",
          type: "categorized",
          field: "foo",
          other: true,
          categories: [
            {
              key: "category_1",
              style: {
                strokeColor: "#000",
                fillColor: "#000",
                fillOpacity: 0.5,
                strokeWidth: 3
              }
            },
            {
              key: "category_2",
              style: {
                strokeColor: "#000",
                fillColor: "#000",
                fillOpacity: 0.5,
                strokeWidth: 3
              }
            },
            {
              key: "category_3",
              style: {
                strokeColor: "#000",
                fillColor: "#000",
                fillOpacity: 0.5,
                strokeWidth: 3
              }
            }
          ]
        },
        themes: {
          first_theme: {
            title: "Theme title",
            type: "categorized",
            field: "foo",
            other: true,
            categories: [
              {
                key: "category_1",
                style: {
                  strokeColor: "#000",
                  fillColor: "#000",
                  fillOpacity: 0.5,
                  strokeWidth: 3
                }
              },
              {
                key: "category_2",
                style: {
                  strokeColor: "#000",
                  fillColor: "#000",
                  fillOpacity: 0.5,
                  strokeWidth: 3
                }
              },
              {
                key: "category_3",
                style: {
                  strokeColor: "#000",
                  fillColor: "#000",
                  fillOpacity: 0.5,
                  strokeWidth: 3
                }
              }
            ]
          },
          second_theme: {
            title: "Theme title",
            type: "categorized",
            field: "foo",
            other: true,
            categories: [
              {
                key: "category_1",
                style: {
                  strokeColor: "#000",
                  fillColor: "#000",
                  fillOpacity: 0.5,
                  strokeWidth: 3
                }
              },
              {
                key: "category_2",
                style: {
                  strokeColor: "#000",
                  fillColor: "#000",
                  fillOpacity: 0.5,
                  strokeWidth: 3
                }
              },
              {
                key: "category_3",
                style: {
                  strokeColor: "#000",
                  fillColor: "#000",
                  fillOpacity: 0.5,
                  strokeWidth: 3
                }
              }
            ]
          }
        }
      };
      const layer = await mapview.layers["location_get_test"];
      delete layer.style.elements;
      layer.style = { ...layer.style, ...style };
      const panel = await mapp.ui.elements.layerStyle.panel(layer);
      await codi.it("The panel function should return a opacitySlider", async () => {
        const opacitySlider = panel.querySelector('[data-id="opacitySlider"]');
        codi.assertTrue(!!opacitySlider, "The panel should have a opacitySlider");
      });
      await codi.it("The panel function should return a hover check box", () => {
        const hoverCheckBox = panel.querySelector('[data-id="hoverCheckbox"]');
        codi.assertTrue(!!hoverCheckBox, "The panel should have a hoverCheckBox");
      });
      await codi.it("The panel function should return a hovers dropdown", () => {
        const hoversDropDown = panel.querySelector('[data-id="hoversDropdown"]');
        codi.assertTrue(!!hoversDropDown, "The panel should have a hoversDropdown");
      });
      await codi.it("The panel function should return a layerTheme", () => {
        const layerTheme = panel.querySelector('[data-id="layerTheme"]');
        codi.assertTrue(!!layerTheme, "The panel should have a layerTheme");
      });
      await codi.it("The panel function should return a themes dropdown", () => {
        const themesDropdown = panel.querySelector('[data-id="themesDropdown"]');
        codi.assertTrue(!!themesDropdown, "The panel should have a themes dropdown");
      });
      await codi.it("The panel function should return an icon scaling field checkbox", () => {
        const iconScalingFieldCheckBox = panel.querySelector('[data-id="iconScalingFieldCheckbox"]');
        codi.assertTrue(!!iconScalingFieldCheckBox, "The panel should have an icon scaling field check box");
      });
      await codi.it("The panel function should return an icon scaling slider", () => {
        const iconScalingSlider = panel.querySelector('[data-id="iconScalingSlider"]');
        codi.assertTrue(!!iconScalingSlider, "The panel should have an icon scaling slider");
      });
      await codi.it("The panel function should return an icon scaling cluster slider", () => {
        const iconScalingClusterSlider = panel.querySelector('[data-id="iconScalingClusterSlider"]');
        codi.assertTrue(!!iconScalingClusterSlider, "The panel should have an icon scaling cluser slider");
      });
      await codi.it("The panel function should return an icon scaling zoom in slider", () => {
        const iconScalingZoomInSlider = panel.querySelector('[data-id="iconScalingZoomInSlider"]');
        codi.assertTrue(!!iconScalingZoomInSlider, "The panel should have an icon scaling zoom in slider");
      });
      await codi.it("The panel function should return an icon scaling zoom out slider", () => {
        const iconScalingZoomOutSlider = panel.querySelector('[data-id="iconScalingZoomOutSlider"]');
        codi.assertTrue(!!iconScalingZoomOutSlider, "The panel should have an icon scaling zoom out slider");
      });
    });
  }

  // tests/lib/ui/elements/pills.test.mjs
  async function pillsTest() {
    await codi.describe("UI Elements: Pills", async () => {
      const pillsComponent = mapp.ui.elements.pills();
      await codi.it("Should create pills", () => {
        codi.assertTrue(typeof pillsComponent.add === "function", "The pills needs to have an add function");
        codi.assertTrue(typeof pillsComponent.remove === "function", "The pills needs to have an add function");
        codi.assertTrue(typeof pillsComponent.pills === "object", "The pills needs to have a pills object");
      });
      await codi.it("We should be able to add pills", () => {
        pillsComponent.add("pill");
        codi.assertTrue(pillsComponent.pills.size === 1, "We should have 1 pill in the pills set");
      });
      await codi.it("We should be able to remove pills", () => {
        pillsComponent.remove("pill");
        codi.assertTrue(pillsComponent.pills.size === 0, "We should have 1 pill in the pills set");
      });
    });
  }

  // tests/lib/ui/elements/alert.test.mjs
  async function alertTest() {
    await codi.describe("UI elements: Alert", async () => {
      await codi.describe("Should create an alert with params provided", async () => {
        const alert = await mapp.ui.elements.alert({ title: "ALERT TITLE", text: "ALERT TEXT" });
        codi.assertTrue(alert !== void 0, "We expect to see the alert element");
        await codi.it("Should have a title of ALERT TITLE", async () => {
          const alert_title = alert.title;
          codi.assertEqual(alert_title, "ALERT TITLE", "We expect to see the alert title");
        });
        await codi.it("Should have a text of ALERT TEXT", async () => {
          const alert_text = alert.text;
          codi.assertEqual(alert_text, "ALERT TEXT", "We expect to see the alert text");
        });
        alert.close();
      });
      await codi.describe("Should create an alert with no params provided", async () => {
        const alert = await mapp.ui.elements.alert({});
        codi.assertTrue(alert !== void 0, "We expect to see the alert element");
        await codi.it("Should have a title of Information", async () => {
          const alert_title = alert.title;
          codi.assertEqual(alert_title, "Information", "We expect to see the alert title");
        });
        await codi.it("Should have no text", async () => {
          const alert_text = alert.text;
          codi.assertEqual(alert_text, void 0, "We expect to see no alert text");
        });
        alert.close();
      });
    });
  }

  // tests/lib/ui/elements/confirm.test.mjs
  async function confirmTest() {
    await codi.describe("UI elements: Confirm", async () => {
      await codi.describe("Should create a confirm dialog with params provided", async () => {
        mapp.ui.elements.confirm({ title: "CONFIRM TITLE", text: "CONFIRM TEXT", data_id: "confirm-test" });
        const confirm = document.querySelector("[data-id=confirm-test]");
        codi.assertTrue(confirm !== void 0, "We expect to see the confirm element");
        await codi.it("Should have a title of CONFIRM TITLE", async () => {
          const confirm_title = confirm.querySelector("h4").textContent;
          codi.assertEqual(confirm_title, "CONFIRM TITLE", "We expect to see the confirm title");
        });
        await codi.it("Should have a text of CONFIRM TEXT", async () => {
          const confirm_text = confirm.querySelector("p").textContent;
          codi.assertEqual(confirm_text, "CONFIRM TEXT", "We expect to see the confirm text");
        });
        const confirm_buttons = confirm.querySelectorAll("button");
        await codi.it("Should have an OK button", async () => {
          codi.assertEqual(confirm_buttons[0].innerText, "OK", "We expect to see the OK button");
        });
        await codi.it("Should have a Cancel button", async () => {
          codi.assertEqual(confirm_buttons[1].innerText, "Cancel", "We expect to see the Cancel button");
        });
        confirm.remove();
      });
      await codi.describe("Should create a confirm dialog with no params provided", async () => {
        mapp.ui.elements.confirm({ data_id: "confirm-test" });
        const confirm = document.querySelector("[data-id=confirm-test]");
        codi.assertTrue(confirm !== void 0, "We expect to see the confirm element");
        await codi.it("Should have a title of Information", async () => {
          const confirm_title = confirm.querySelector("h4").textContent;
          codi.assertEqual(confirm_title, "Confirm", "We expect to see the confirm title");
        });
        await codi.it("Should have no text", async () => {
          const confirm_text = confirm.querySelector("p").textContent;
          codi.assertEqual(confirm_text, "", "We expect to see no confirm text");
        });
        const confirm_buttons = confirm.querySelectorAll("button");
        await codi.it("Should have an OK button", async () => {
          codi.assertEqual(confirm_buttons[0].innerText, "OK", "We expect to see the OK button");
        });
        await codi.it("Should have a Cancel button", async () => {
          codi.assertEqual(confirm_buttons[1].innerText, "Cancel", "We expect to see the Cancel button");
        });
        confirm.remove();
      });
    });
  }

  // tests/lib/ui/elements/dialog.test.mjs
  function dialogTest() {
    codi.describe("UI Elements: dialog/modal", () => {
      const params = {
        target: document.getElementById("Map"),
        closeBtn: true,
        data_id: "dialog-test",
        headerDrag: true,
        header: "I am a header",
        content: "I am so content",
        top: "5em",
        left: "5em",
        contained: true
      };
      codi.it("Should create a basic dialog", () => {
        const dialog = mapp.ui.elements.dialog({ ...params });
        codi.it("Dialog should be able to close", () => {
          dialog.close();
          const dialog_element = document.querySelector('[data-id="dialog-test"]');
          codi.assertEqual(dialog_element, null, "The dialog should be removed from the DOM on close");
        });
        codi.it("Dialog should be able to be shown again", () => {
          dialog.show();
          const dialog_element = document.querySelector('[data-id="dialog-test"]');
          codi.assertEqual(dialog_element, dialog.node, "The dialog should be in the DOM again");
        });
        dialog.close();
      });
      codi.it("Should recreate a basic dialog", () => {
        params.new = true;
        const new_params = { ...params };
        const dialog = mapp.ui.elements.dialog(new_params);
        dialog.close();
        const new_dialog = mapp.ui.elements.dialog(new_params);
        codi.assertEqual(dialog, new_dialog, "The dialog should be recreated");
        new_dialog.close();
      });
      codi.it("Should create a dialog that can minimize/maximize", () => {
        params.minimizeBtn = true;
        const new_params = { ...params };
        const dialog = mapp.ui.elements.dialog(new_params);
        dialog.node.querySelector("header > button.mask-icon.minimize-btn").dispatchEvent(new Event("click"));
        let minimized = dialog.node.classList.contains("minimized");
        codi.assertTrue(minimized, "The dialog content should not be visible");
        dialog.node.querySelector("header > button.mask-icon.minimize-btn").dispatchEvent(new Event("click"));
        minimized = dialog.node.classList.contains("minimized");
        codi.assertFalse(minimized, "The dialog content should not be visible");
        dialog.close();
      });
    });
  }

  // tests/lib/ui/elements/_elements.test.mjs
  var ui_elementsTest = {
    sliderTest,
    layerStyleTest,
    pillsTest,
    alertTest,
    confirmTest,
    dialogTest
  };

  // tests/lib/ui/layers/filters.test.mjs
  async function filtersTest(mapview) {
    await codi.describe("UI Layers: Filters test", async () => {
      const filter = {
        field: "id",
        minmax_query: "minmax_query"
      };
      const layer = mapview.layers["location_get_test"];
      await codi.it("Numeric Filter: minmax_query test", async () => {
        const numericFilter = await mapp.ui.layers.filters.numeric(layer, filter);
        const minInput = numericFilter.querySelector("div > input[type=range]:nth-child(3)");
        const maxInput = numericFilter.querySelector("div > input[type=range]:nth-child(4)");
        codi.assertEqual(minInput.value, "100", "The min should return 100.");
        codi.assertEqual(maxInput.value, "500", "The max should return 500");
      });
      await codi.it("Numeric Filter: min value specified", async () => {
        filter["min"] = 200;
        const numericFilter = await mapp.ui.layers.filters.numeric(layer, filter);
        const minInput = numericFilter.querySelector("div > input[type=range]:nth-child(3)");
        const maxInput = numericFilter.querySelector("div > input[type=range]:nth-child(4)");
        codi.assertEqual(minInput.value, "200", "The min should return 200.");
        codi.assertEqual(maxInput.value, "500", "The max should return 500");
        await mapp.ui.layers.filters.removeFilter(layer, filter);
        delete filter.min;
      });
      await codi.it("Numeric Filter: max value specified", async () => {
        filter["max"] = 1e3;
        const numericFilter = await mapp.ui.layers.filters.numeric(layer, filter);
        const minInput = numericFilter.querySelector("div > input[type=range]:nth-child(3)");
        const maxInput = numericFilter.querySelector("div > input[type=range]:nth-child(4)");
        codi.assertEqual(minInput.value, "100", "The min should return 100.");
        codi.assertEqual(maxInput.value, "1000", "The max should return 1000");
      });
      await codi.it("Numeric Filter: layer.current specified as `lte: 200` and `gte: 800`", async () => {
        layer.filter.current[filter.field].lte = 800;
        layer.filter.current[filter.field].gte = 200;
        const numericFilter = await mapp.ui.layers.filters.numeric(layer, filter);
        const minInput = numericFilter.querySelector("div > input[type=range]:nth-child(3)");
        const maxInput = numericFilter.querySelector("div > input[type=range]:nth-child(4)");
        codi.assertEqual(minInput.value, "200", "The min should return 200.");
        codi.assertEqual(maxInput.value, "800", "The max should return 800");
        await mapp.ui.layers.filters.removeFilter(layer, filter);
        codi.assertEqual(layer.filter.current, {}, "The filter of the layer should be cleared");
      });
    });
  }

  // tests/lib/ui/layers/panels/filter.test.mjs
  function panelFilterTest() {
    codi.describe("UI Layers Panels: Filter", () => {
      codi.it("Create a filter panel", () => {
        const layer = {
          reload: () => {
          },
          mapview: {
            Map: {
              getTargetElement: () => {
                return document.getElementById("Map");
              }
            }
          },
          key: "panel_test",
          filter: {
            current: {}
          },
          infoj: [
            {
              "field": "field_1",
              "filter": "like",
              "type": "text"
            },
            {
              "field": "field_2",
              "type": "numeric",
              "filter": {
                "type": "integer"
              }
            }
          ]
        };
        const filterPanel = mapp.ui.layers.panels.filter(layer);
        const filterPanelDropDown = filterPanel.querySelector("[data-id=panel_test-filter-dropdown]");
        const drop_down_elements = filterPanelDropDown.querySelector("ul");
        codi.assertEqual(drop_down_elements.children.length, 2, "We expect two entries into the dropdown from the infoj");
        filterPanel.querySelector("ul").children[0].dispatchEvent(new Event("click"));
        codi.assertEqual(filterPanel.querySelector("ul").children[0].classList.contains("selected"), true, "Expect an element to be selected");
        const resetButton = filterPanel.querySelector("[data-id=resetall]");
        layer.filter.current["field_1"] ??= { "like": "a" };
        resetButton.dispatchEvent(new Event("click"));
        codi.assertEqual(layer.filter.current, {}, " `layer.current.filter` should be empty");
      });
    });
  }

  // tests/utils/delay.js
  function delayFunction(delay) {
    return new Promise((resolve) => {
      setTimeout(resolve, delay);
    });
  }

  // tests/lib/ui/layers/view.test.mjs
  async function viewTest(mapview) {
    await setView(mapview, 2, "default");
    await codi.describe("UI Layers: viewTest", async () => {
      await codi.it("should dispatch the event and the layer should not display.", async () => {
        const layer = mapview.layers["changeEnd"];
        const changeEndEvent = new Event("changeEnd");
        const target = layer.mapview.Map.getTargetElement();
        target.dispatchEvent(changeEndEvent);
        await codi.assertFalse(layer.display, "The changeEnd() layer should not display at the default zoom level.");
        await delayFunction(1e3);
      });
      await codi.it("should display at zoom level 6", async () => {
        await setView(mapview, 11, "london");
        const layer = mapview.layers["changeEnd"];
        const changeEndEvent = new Event("changeEnd");
        const target = layer.mapview.Map.getTargetElement();
        target.dispatchEvent(changeEndEvent);
        codi.assertTrue(layer.display, "The changeEnd() layer should display at zoom level 6");
        await delayFunction(1e3);
      });
    });
  }

  // tests/lib/ui/layers/_layers.test.mjs
  var ui_layers = {
    filtersTest,
    panelFilterTest,
    viewTest
  };

  // tests/utils/location.js
  async function mockLocation(mapview) {
    const locationLayer = mapview.layers["location_get_test"];
    return await mapp.location.get({
      layer: locationLayer,
      getTemplate: "get_location_mock",
      id: 999
    });
  }

  // tests/lib/ui/locations/entries/pin.test.mjs
  async function pinTest(mapview) {
    await codi.describe("UI elements: pin", async () => {
      await codi.it("Needs to be able to create a pin element with a scale of 4", async () => {
        mapview.layers["location_get_test"].infoj.find((entry) => entry.type === "pin").style ??= { icon: { scale: 4 } };
        const location = await mockLocation(mapview);
        const pinEntry = location.infoj.filter((entry) => entry.type === "pin")[0];
        codi.assertTrue(!!pinEntry.style, "The pinEntry needs to have a style object");
        codi.assertTrue(!!pinEntry.style.icon, "The pinEntry needs to have an icon assigned to the style");
        codi.assertEqual(pinEntry.style.icon.scale, 4, "The pinEntry needs to have an scale property on the icon set to 4");
        location.removeCallbacks.push((_this) => delete _this.removeCallbacks);
        location.remove();
      });
    });
  }

  // tests/lib/ui/locations/entries/geometry.test.mjs
  async function geometryTest2(mapview) {
    await codi.describe("UI Entries: Geometry", async () => {
      const entry = {
        mapview,
        key: "geometry-test",
        value: {
          type: "Point",
          coordinates: "0101000020110F000065D98262C7490CC10DF78253F7B75D41"
        },
        srid: 3856,
        display: true,
        location: {
          layer: {
            mapview
          },
          Layers: []
        }
      };
      await codi.it("Should return geometry checkbox", async () => {
        const geometryCheckBox = mapp.ui.locations.entries.geometry(entry);
        codi.assertTrue(!!geometryCheckBox, "A checkbox needs to be returned");
      });
      await codi.it("Should return 0 if no entry value is provided", async () => {
        entry.value = null;
        const geometryCheckBox = await mapp.ui.locations.entries.geometry(entry);
        codi.assertTrue(typeof geometryCheckBox === "undefined", "We need to get no geometry checkbox returned");
      });
    });
  }

  // tests/lib/ui/locations/entries/layer.test.mjs
  async function layerTest2(mapview) {
    await codi.describe("Layer Entry Test", async () => {
      const entry = {
        mapview,
        zIndex: 99,
        location: {
          hook: "entry_layer!23",
          removeCallbacks: []
        },
        "key": "test_layer",
        "label": "entry_layer",
        "type": "layer",
        "display": "true",
        "layer": "mvt_test"
      };
      await codi.it("We should get a basic layer entry", async () => {
        await mapp.ui.locations.entries.layer(entry);
        await delayFunction(1e3);
        codi.assertTrue(Object.keys(mapview.layers[entry.key]).length > 0, "We should see the unique layer being added to the mapview");
        entry.location.removeCallbacks?.forEach((fn) => fn instanceof Function && fn(this));
        await delayFunction(1e3);
        codi.assertTrue(typeof mapview.layers[entry.key] === "undefined", "We should see the unique layer being removed from the mapview");
      });
      await codi.it("Layer entry should fail with warning", async () => {
        entry.layer = "bogus_layer";
        await mapp.ui.locations.entries.layer(entry);
        codi.assertTrue(!mapview.layers[entry.key], "Should warn about an undefined layer");
        entry.layer = "mvt_test";
      });
      await codi.it("Layer entry should adhere to zoom restrictions", async () => {
        const newEntry = {
          mapview,
          zIndex: 99,
          location: {
            hook: "entry_layer!23",
            removeCallbacks: []
          },
          "key": "test_layer",
          "label": "entry_layer",
          "type": "layer",
          "display": "true",
          "layer": "mvt_test",
          "tables": {
            "12": null,
            "13": "test.mvt_test"
          }
        };
        await setView(mapview, 11, "london");
        await mapp.ui.locations.entries.layer(newEntry);
        await delayFunction(1e3);
        codi.assertTrue(mapview.layers[newEntry.key].display_toggle.classList.contains("disabled"), "Toggle should be disabled");
        await setView(mapview, 14, "london");
        codi.assertFalse(!mapview.layers[newEntry.key].display_toggle.classList.contains("disabled"), "Toggle should be enabled");
      });
    });
  }

  // tests/lib/ui/locations/entries/_entries.test.mjs
  var entriesTest = {
    pinTest,
    geometryTest: geometryTest2,
    layerTest: layerTest2
  };

  // tests/lib/ui/Tabview.test.mjs
  async function Tabview() {
  }

  // tests/lib/ui/_ui.test.mjs
  var uiTest = {
    Tabview
  };

  // tests/lib/utils/numericFormatter.test.mjs
  function numericFormatterTest() {
    codi.describe("Utils: numericFormatter Test", () => {
      const params = {
        value: 654321.987,
        prefix: "$",
        formatterParams: {
          locale: "en-UK"
        }
      };
      const expected_unformated_value = 654321.99;
      let expected_formated_value = "$654,321.99";
      codi.it("Should format UK locale Numeric Values", () => {
        const formattedValue = mapp.utils.formatNumericValue(params);
        codi.assertEqual(formattedValue, expected_formated_value, `We expect the value to equal ${expected_formated_value}, we received ${formattedValue}`);
      });
      codi.it("Should unformat UK locale strings", () => {
        const unformattedString = mapp.utils.unformatStringValue(params);
        codi.assertEqual(unformattedString, expected_unformated_value, `We expect the value to equal ${expected_unformated_value}, we received ${unformattedString}`);
      });
      codi.it("Should format DE locale Numeric Values", () => {
        params.formatterParams.locale = "DE";
        expected_formated_value = "$654.321,99";
        const formattedValue = mapp.utils.formatNumericValue(params);
        codi.assertEqual(formattedValue, expected_formated_value, `We expect the value to equal ${expected_formated_value}, we received ${formattedValue}`);
      });
      codi.it("Should unformat DE locale strings", () => {
        const unformattedString = mapp.utils.unformatStringValue(params);
        codi.assertEqual(unformattedString, expected_unformated_value, `We expect the value to equal ${expected_unformated_value}, we received ${unformattedString}`);
      });
      codi.it("Should format PL locale Numeric Values", () => {
        params.formatterParams.locale = "PL";
        expected_formated_value = "$654\xA0321,99";
        const formattedValue = mapp.utils.formatNumericValue(params);
        codi.assertEqual(formattedValue, expected_formated_value, `We expect the value to equal ${expected_formated_value}, we received ${formattedValue}`);
      });
      codi.it("Should unformat PL locale strings", () => {
        mapp.utils.formatNumericValue(params);
        const unformattedString = mapp.utils.unformatStringValue(params);
        codi.assertEqual(unformattedString, expected_unformated_value, `We expect the value to equal ${expected_unformated_value}, we received ${unformattedString}`);
      });
      codi.it("Should format RUB locale Numeric Values", () => {
        params.formatterParams.locale = "RUB";
        expected_formated_value = "$654,321.99";
        const formattedValue = mapp.utils.formatNumericValue(params);
        codi.assertEqual(formattedValue, expected_formated_value, `We expect the value to equal ${expected_formated_value}, we received ${formattedValue}`);
      });
      codi.it("Should unformat RUB locale strings", () => {
        mapp.utils.formatNumericValue(params);
        const unformattedString = mapp.utils.unformatStringValue(params);
        codi.assertEqual(unformattedString, expected_unformated_value, `We expect the value to equal ${expected_unformated_value}, we received ${unformattedString}`);
      });
    });
  }

  // tests/lib/utils/merge.test.mjs
  async function mergeTest() {
    await codi.describe("Utils: mergeTest Test", async () => {
      await codi.it("Hobbies should be overwritten in the merge", async () => {
        const target = {
          name: "Rob",
          age: 28,
          address: {
            street: "6 fourteenth street",
            city: "Johannesburg"
          },
          hobbies: ["squash", "guitar"]
        };
        const source = {
          name: "Rob",
          age: 26,
          address: {
            street: "6 fourteenth street",
            city: "Johannesburg"
          },
          hobbies: ["cooking"]
        };
        const expected = {
          name: "Rob",
          age: 26,
          address: {
            street: "6 fourteenth street",
            city: "Johannesburg"
          },
          hobbies: ["cooking"]
        };
        const mergedObj = mapp.utils.merge(target, source);
        codi.assertEqual(mergedObj, expected);
      });
      await codi.it("should handle merging with null or undefined values", async () => {
        const target = {
          name: "John",
          age: 30
        };
        const source1 = null;
        const source2 = void 0;
        const expected = {
          name: "John",
          age: 30
        };
        const mergedObj1 = mapp.utils.merge(target, source1);
        const mergedObj2 = mapp.utils.merge(target, source2);
        codi.assertEqual(mergedObj1, expected);
        codi.assertEqual(mergedObj2, expected);
      });
      await codi.it("should prevent _proto merging", async () => {
        const target = {
          current: {
            "country": {
              "in": ["ROI"]
            }
          }
        };
        const source = {
          current: {
            "country": {
              "in": ["UK"]
            }
          },
          __proto__: {
            "polluted": "polluted"
          }
        };
        const expected = {
          current: {
            "country": {
              "in": ["ROI"]
            }
          }
        };
        const mergedObj1 = mapp.utils.merge(target, source);
        codi.assertEqual(mergedObj1, expected, "The merge should not happen if a __proto__ is found on an object");
      });
    });
  }

  // tests/lib/utils/paramString.test.mjs
  async function paramStringTest() {
    await codi.describe("Utils: paramString Test", async () => {
      await codi.it("Should return empty param string", async () => {
        const params = null;
        const formattedValue = mapp.utils.paramString(params);
        codi.assertEqual(formattedValue, "", `We expect the value to equal '', we received ${formattedValue}`);
      });
      await codi.it("Should return urlencoded string", async () => {
        const params = {
          id: 1,
          name: "test",
          age: "29 ",
          viewport: true,
          template: { "in": { "id": 1 } }
        };
        const expectedValue = "id=1&name=test&age=29%20&viewport=true&template=%7B%22in%22%3A%7B%22id%22%3A1%7D%7D";
        const formattedValue = mapp.utils.paramString(params);
        codi.assertEqual(formattedValue, expectedValue, `We expect the value to equal ${expectedValue}, we received ${formattedValue}`);
      });
      await codi.it("Should return urlencoded string, excluding null and undefined values", async () => {
        const params = {
          id: null,
          name: void 0,
          age: "29 ",
          viewport: [],
          template: {}
        };
        const expectedValue = "age=29%20";
        const formattedValue = mapp.utils.paramString(params);
        codi.assertEqual(formattedValue, expectedValue, `We expect the value to equal ${expectedValue}, we received ${formattedValue}`);
      });
    });
  }

  // tests/lib/utils/queryParams.test.mjs
  async function queryParamsTest(mapview) {
    await codi.describe("Utils: queryParams Test", async () => {
      const location_layer = mapview.layers["query_params_layer"];
      const location = await mapp.location.get({
        layer: location_layer,
        getTemplate: "get_location_mock",
        id: 6
      });
      const params = {
        layer: location_layer,
        queryparams: {
          layer: location_layer,
          table: "fake_table"
        }
      };
      await setView(mapview, 2, "default");
      await codi.it("Should return undefined with null queryparams", async () => {
        const null_params = {};
        const formattedValue = mapp.utils.queryParams(null_params);
        codi.assertEqual(formattedValue, void 0, `We expect the value to equal undefined, we received ${formattedValue}`);
      });
      await codi.it("Should return id, qID", async () => {
        params.queryparams.id = true;
        params.queryparams.qID = true;
        params.location = location;
        const queryParams = mapp.utils.queryParams(params);
        codi.assertEqual(queryParams.id, 6, `We expect the value to equal 6, we received ${queryParams.id}`);
        codi.assertEqual(queryParams.qID, "_id", `We expect the value to equal id, we received ${queryParams.qID}`);
      });
      await codi.it("Should return lat, lng, z", async () => {
        params.queryparams.center = true;
        params.queryparams.z = true;
        const queryParams = mapp.utils.queryParams(params);
        codi.assertEqual(queryParams.lng, 0, `We expect the value to equal 0, we received ${queryParams.lng}`);
        codi.assertEqual(queryParams.lat, 0, `We expect the value to equal 0, we received ${queryParams.lat}`);
        codi.assertTrue(!!queryParams.z, `We expect the zoom level to be returned from the method`);
      });
      await codi.it("Should return locale, template, layer", async () => {
        params.query = "not_real";
        const queryParams = mapp.utils.queryParams(params);
        codi.assertEqual(queryParams.template, params.query, `We expect the value to equal ${params.query}, we received ${queryParams.template}`);
        codi.assertEqual(queryParams.locale, "locale", `We expect the value to equal 0, we received ${queryParams.locale}`);
        codi.assertEqual(queryParams.layer, location_layer.key, `We expect the value to equal ${location_layer.key}, we received ${queryParams.layer}`);
      });
      await codi.it("Should return viewport, filter", async () => {
        params.viewport = true;
        params.queryparams.filter = true;
        const queryParams = mapp.utils.queryParams(params);
        codi.assertEqual(queryParams.viewport.length, 5, `We expect the value to have 5 params, we received ${queryParams.viewport.length}`);
        codi.assertEqual(queryParams.filter, {}, `We expect the value to equal {'id':{}}, we received ${JSON.stringify(queryParams.filter)}`);
      });
      location.removeCallbacks.push((_this) => delete _this.removeCallbacks);
      location.remove();
    });
  }

  // tests/lib/utils/compose.test.mjs
  function composeTest() {
    codi.describe("Compose Test", () => {
      codi.it("Should compose functions from left to right", () => {
        const addOne = (x) => x + 1;
        const double = (x) => x * 2;
        const square = (x) => x * x;
        const composed = mapp.utils.compose(addOne, double, square);
        codi.assertEqual(composed(3), 64, "We expect this order of opperation when composing functions left to right : ((3 + 1) * 2)^2 = 64");
      });
      codi.it("Should work with a single function", () => {
        const addTwo = (x) => x + 2;
        const composed = mapp.utils.compose(addTwo);
        codi.assertEqual(composed(5), 7, "Compose should also work with a single function");
      });
      codi.it("Should return the input if no functions are provided", () => {
        const composed = mapp.utils.compose();
        codi.assertEqual(composed(10), 10, "We should get the input as a return if no functions are provided");
      });
      codi.it("Should handle different data types", () => {
        const toUpperCase = (str) => str.toUpperCase();
        const addExclamation = (str) => str + "!";
        const composed = mapp.utils.compose(addExclamation, toUpperCase);
        codi.assertEqual(composed("hello"), "HELLO!", "We expect the string to change in the chain given.");
      });
    });
  }

  // tests/lib/utils/svgTemplates.test.mjs
  async function svgTemplatesTest() {
    await codi.describe("Utils: SVG Templates", async () => {
      await codi.it("We should load new svg templates once", async () => {
        const svgTemplates = {
          "dot_test": "I am a bogus svg and shouldnt be loaded"
        };
        await mapp.utils.svgTemplates(svgTemplates);
        const dot_test_svg = await mapp.utils.svgSymbols.templates["dot_test"];
        codi.assertNotEqual(dot_test_svg, "", "The svg template should not be overwriten");
      });
    });
  }

  // tests/lib/utils/versionCheck.mjs
  async function versionCheck() {
    await codi.describe("Utils: versionCheck Test", async () => {
      await codi.it("should return false if the major and minor are the same but version patch exceeds", async () => {
        mapp.version = "4.11.1";
        const result = await mapp.utils.versionCheck("4.11");
        codi.assertEqual(result, true);
      });
      await codi.it("should return true if the major version is more than", async () => {
        mapp.version = "4.9.1";
        const result = mapp.utils.versionCheck("3.9");
        codi.assertEqual(result, true);
      });
      await codi.it("should return false if the major version is the same and the minor version is less", async () => {
        mapp.version = "4.9.0";
        const result = mapp.utils.versionCheck("4.10.0");
        codi.assertEqual(result, false);
      });
      await codi.it("should return true if the major version is the same and the minor version is more", async () => {
        mapp.version = "4.11.0";
        const result = await mapp.utils.versionCheck("4.10.0");
        codi.assertEqual(result, true);
      });
      await codi.it("should return true if the major version is the same and the minor version is the same", async () => {
        mapp.version = "4.11.2";
        const result = await mapp.utils.versionCheck("4.11.1");
        codi.assertEqual(result, true);
      });
    });
  }

  // tests/lib/utils/_utils.test.mjs
  var utilsTest = {
    numericFormatterTest,
    mergeTest,
    paramStringTest,
    queryParamsTest,
    composeTest,
    svgTemplatesTest,
    versionCheck
  };

  // tests/assets/layers/cluster/layer.json
  var layer_default2 = {
    key: "cluster_test",
    display: true,
    group: "layer",
    format: "wkt",
    dbs: "NEON",
    table: "test.scratch",
    srid: "3857",
    geom: "geom_3857",
    qID: "id",
    cluster: {
      resolution: 5e-3,
      hexgrid: true
    },
    infoj: [
      {
        type: "pin",
        label: "ST_PointOnSurface",
        field: "pin",
        fieldfx: "ARRAY[ST_X(ST_PointOnSurface(geom_3857)),ST_Y(ST_PointOnSurface(geom_3857))]"
      }
    ],
    style: {
      default: {
        icon: {
          type: "dot",
          fillColor: "#13336B"
        }
      },
      cluster: {
        icon: {
          type: "target",
          fillColor: "#E6FFFF",
          layers: {
            "1": "#13336B",
            "0.85": "#E6FFFF"
          }
        }
      },
      highlight: {
        scale: 1.3
      },
      theme: {
        title: "theme_1",
        type: "graduated",
        field: "test_template_style",
        graduated_breaks: "greater_than",
        template: {
          key: "test_template_style",
          template: "100-99",
          value_only: true
        },
        cat_arr: [
          {
            value: 0,
            label: "0 to 5%",
            style: {
              icon: {
                fillColor: "#ffffcc",
                fillOpacity: 0.8
              }
            }
          }
        ]
      }
    }
  };

  // tests/lib/layer/format/vector.test.mjs
  async function vectorTest(mapview, layer) {
    layer ??= layer_default2;
    await codi.describe("Layer Format: Vector", async () => {
      await codi.it("Should create a cluster layer", async () => {
        const layer_params = {
          mapview,
          ...layer
        };
        const clusterLayer = await mapp.layer.decorate(layer_params);
        mapp.layer.formats.vector(clusterLayer);
        clusterLayer.show();
        codi.assertTrue(typeof clusterLayer.show === "function", "The layer should have a show function");
        codi.assertTrue(typeof clusterLayer.reload === "function", "The layer should have a reload function");
        codi.assertTrue(typeof clusterLayer.setSource === "function", "The layer should have a setSource function");
        codi.assertTrue(clusterLayer.format === "cluster", "The layer should have the format cluster");
        clusterLayer.hide();
      });
    });
  }

  // tests/assets/layers/mvt/layer.json
  var layer_default3 = {
    group: "layer",
    name: "mvt_test",
    format: "mvt",
    table: "test.mvt_test",
    geom: "geom_3857",
    srid: "3857",
    qID: "id",
    infoj: [
      {
        type: "pin",
        label: "ST_PointOnSurface",
        field: "pin",
        fieldfx: "ARRAY[ST_X(ST_PointOnSurface(geom_3857)),ST_Y(ST_PointOnSurface(geom_3857))]"
      }
    ],
    style: {
      default: {
        strokeWidth: "0",
        fillColor: "#fff",
        fillOpacity: 0.4,
        strokeColor: null
      },
      themes: {
        theme_1: {
          title: "theme_1",
          type: "categorized",
          field: "numeric_field",
          cat: {
            "1": {
              label: "Lowest",
              style: {
                fillColor: "#3193ED"
              }
            },
            "2": {
              label: "-",
              style: {
                fillColor: "#5DC29A"
              }
            },
            "3": {
              label: "-",
              style: {
                fillColor: "#8FE15A"
              }
            },
            "4": {
              label: "-",
              style: {
                fillColor: "#D8D758"
              }
            },
            "5": {
              label: "-",
              style: {
                fillColor: "#FFB956"
              }
            },
            "6": {
              label: "-",
              style: {
                fillColor: "#FE8355"
              }
            },
            "7": {
              label: "-",
              style: {
                fillColor: "#FA5652"
              }
            },
            "8": {
              label: "Highest",
              style: {
                fillColor: "#F0304D"
              }
            }
          }
        },
        theme_2: {
          title: "theme_2",
          type: "categorized",
          field: "numeric_field",
          cat: {
            "1": {
              label: "Lowest",
              style: {
                fillColor: "#6B2E94"
              }
            },
            "2": {
              label: "-",
              style: {
                fillColor: "#8B44B8"
              }
            },
            "3": {
              label: "-",
              style: {
                fillColor: "#9B6FCD"
              }
            },
            "4": {
              label: "-",
              style: {
                fillColor: "#89A7D6"
              }
            },
            "5": {
              label: "-",
              style: {
                fillColor: "#70C1C9"
              }
            },
            "6": {
              label: "-",
              style: {
                fillColor: "#52C4A3"
              }
            },
            "7": {
              label: "-",
              style: {
                fillColor: "#38B77C"
              }
            },
            "8": {
              label: "Highest",
              style: {
                fillColor: "#1FA855"
              }
            }
          }
        }
      }
    }
  };

  // tests/lib/layer/format/mvt.test.mjs
  function mvtTest(mapview, layer) {
    layer ??= layer_default3;
    codi.describe("Layer Format: MVT", () => {
      codi.it("MVT: Create basic layer", () => {
        mapp.layer.formats[layer.format]?.(layer);
        codi.assertTrue(Object.hasOwn(layer, "reload"), "The mvt layer needs to have a reload function");
        codi.assertTrue(Object.hasOwn(layer, "featureSource"), "The mvt layer needs to have a featureSource");
        codi.assertTrue(Object.hasOwn(layer, "source"), "The mvt layer needs to have a source");
        codi.assertTrue(Object.hasOwn(layer, "L"), "The mvt layer needs to have an openlayer object");
      });
      codi.it("MVT: Reload should remove sourceTiles", () => {
        mapp.layer.formats[layer.format]?.(layer);
        layer.source.sourceTiles_ = { tile: "foo" };
        layer.reload();
        codi.assertEqual(layer.source.sourceTiles_, {}, "The sourceTiles needs to be cleared");
      });
    });
  }

  // tests/lib/layer/format/_format.test.mjs
  var formatTest = {
    vectorTest,
    mvtTest
  };

  // tests/lib/ui/locations/infoj.test.mjs
  function infojTest() {
    codi.describe("UI Locations: infojTest", () => {
      codi.it("It should create an infoj with certain order", () => {
        const location = {
          infoj: [
            {
              field: "field_1",
              key: "key_1",
              label: "test_1",
              value: "test 1 value"
            },
            {
              field: "field_2",
              label: "test_2",
              value: "value_2"
            },
            {
              field: "field_3",
              label: "test_3",
              value: "value_3"
            },
            {
              key: "key_4",
              value: "value_4"
            },
            {
              query: "query_5",
              value: "value_5",
              location: {}
            }
          ]
        };
        const infoj_order = [
          "_field_1",
          "field_2",
          "field_3",
          "key_4",
          "query_5",
          {
            field: "field6",
            value: "value_6"
          }
        ];
        const infoj = mapp.ui.locations.infoj(location, infoj_order);
        const results = Array.from(infoj.children).map((el) => el.firstChild.innerText.trim());
        const expected = [
          "value_2",
          "value_3",
          "value_4",
          "value_5",
          "value_6"
        ];
        codi.assertEqual(results, expected, "The infoj order needs to be as defined in the expected");
      });
    });
  }

  // tests/lib/ui/locations/_locations.test.mjs
  var ui_locations = { infojTest };

  // tests/_mapp.test.mjs
  self._mappTest = {
    base,
    coreTest,
    mappTest,
    layerTest,
    dictionaryTest,
    locationTest,
    mapviewTest,
    pluginsTest,
    workspaceTest,
    queryTest,
    userTest,
    ui_elementsTest,
    ui_layers,
    entriesTest,
    uiTest,
    utilsTest,
    formatTest,
    ui_locations
  };
})();
//# sourceMappingURL=_mapp.test.js.map
