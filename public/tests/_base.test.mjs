export async function base() {
    let mapview = {};
    await codi.describe('Mapview test', async () => {

        console.log(`MAPP v${mapp.version}`)
        // Set Openlayers node in order to move map object.
        const OL = document.getElementById('OL');
        const locationsTab = document.getElementById('locations');
        const layersTab = document.getElementById('layers');

        const tabs = document.querySelectorAll('#ctrl-tabs > div');
        const tabPanels = document.querySelectorAll('#ctrl-panel > div');
        const tabview = document.getElementById('Tabview');

        //Testcase: Merge Dictionaries
        await codi.it('should merge dictionaries correctly', () => {
            // Store the initial length of the English dictionary
            const initialLength = Object.keys(mapp.dictionaries.en).length;

            // Merge the dictionaries
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
                    no_locales: 'Your account has been verified and approved, but you do not have access to any locales. This is likely as an administrator has not given you the required roles. Please contact an administrator to resolve this.',
                    no_layers: 'No accessible layers in locale.',
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
                zh: {
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
                zh_tw: {
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
                esp: {
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

            // Assert that the English dictionary has been updated with new entries
            const updatedLength = Object.keys(mapp.dictionaries.en).length;
            codi.assertTrue(updatedLength > initialLength, 'English dictionary should have new entries');

            // Assert that the merged dictionaries have the expected properties
            codi.assertEqual(mapp.dictionaries.en.toolbar_zoom_in, 'Zoom in', 'English dictionary should have the correct value for toolbar_zoom_in');
            codi.assertEqual(mapp.dictionaries.de.toolbar_zoom_in, 'Zoom rein', 'German dictionary should have the correct value for toolbar_zoom_in');

        });

        //Testcase: Ensure User refreshes cookie
        await codi.it('should refresh cookie and get user with updated credentials', async () => {
            // Store the current user object
            const currentUser = mapp.user;

            // Refresh cookie and get user with updated credentials
            mapp.user = await mapp.utils.xhr(`${mapp.host}/api/user/cookie`);

            if (mapp.user !== null) {
                // Assert that the user object has been updated
                codi.assertNotEqual(mapp.user, currentUser, 'User object should be updated after refreshing cookie');

                // Assert that the user object has the expected properties
                codi.assertTrue(mapp.user.hasOwnProperty('email'), 'User object should have the "email" property');
                codi.assertTrue(mapp.user.hasOwnProperty('language'), 'User object should have the "language" property');
                codi.assertTrue(mapp.user.hasOwnProperty('roles'), 'User object should have the "roles" property');
            }
        });

        //Testcase: Ensure language is set correctly.
        await codi.it('should set the language correctly', () => {
            // Store the current language
            const currentLanguage = mapp.language;

            // Set the language based on the specified priority
            mapp.language = mapp.hooks.current.language || mapp.user?.language || mapp.language;

            // Assert that the language has been set correctly
            if (mapp.hooks.current.language) {
                codi.assertEqual(mapp.language, mapp.hooks.current.language, 'Language should be set to the value from mapp.hooks.current.language');
            } else if (mapp.user?.language) {
                codi.assertEqual(mapp.language, mapp.user.language, 'Language should be set to the value from mapp.user.language');
            } else {
                codi.assertEqual(mapp.language, currentLanguage, 'Language should remain unchanged if no overrides are present');
            }
        });

        //Testcase: ensure restore scroll is supported
        await codi.it('should restore scroll if supported', () => {
            // Check if scroll restoration is supported
            if ('scrollRestoration' in history) {
                // Set scroll restoration to 'auto'
                history.scrollRestoration = 'auto';

                // Assert that scroll restoration is set to 'auto'
                codi.assertEqual(history.scrollRestoration, 'auto', 'Scroll restoration should be set to "auto"');
            } else {
                // Assert that scroll restoration is not supported
                codi.assertFalse('scrollRestoration' in history, 'Scroll restoration is not supported');
            }
        });

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

                const pageY = (e.touches && e.touches[0].pageY) || e.pageY;

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
                    const gazetteerInput = document.getElementById('gazetteerInput')
                    gazetteerInput && window.innerWidth > 768 && gazetteerInput.focus()
                }
            }
        });

        //Testcase: Set help tesxt from dictionary
        await codi.it('should set help text from dictionary', () => {
            tabs.forEach((tab) => {
                // Set help text from dictionary
                tab.title = mapp.dictionary[tab.dataset.id];

                // Assert that the title is set correctly
                codi.assertEqual(tab.title, mapp.dictionary[tab.dataset.id], 'Title should be set from the dictionary');
            });
        });

        //Tesecase: Handle tab click events
        await codi.it('should handle tab click events', () => {
            tabs.forEach((tab) => {
                // Simulate a click event on the tab
                tab.click();

                // Assert that the active class is added to the clicked tab
                codi.assertTrue(tab.classList.contains('active'), 'Clicked tab should have the active class');

                // Assert that the active class is removed from other tabs
                tabs.forEach((otherTab) => {
                    if (otherTab !== tab) {
                        codi.assertFalse(otherTab.classList.contains('active'), 'Other tabs should not have the active class');
                    }
                });

                // Get the corresponding panel for the clicked tab
                const panel = document.getElementById(tab.dataset.id);

                // Assert that the active class is added to the corresponding panel
                codi.assertTrue(panel.classList.contains('active'), 'Corresponding panel should have the active class');

                // Assert that the active class is removed from other panels
                tabPanels.forEach((otherPanel) => {
                    if (otherPanel !== panel) {
                        codi.assertFalse(otherPanel.classList.contains('active'), 'Other panels should not have the active class');
                    }
                });

            });

            const layersTab = Array.from(tabs).find((tab) => tab.dataset.id === 'layers');
            //Simulate a click event on the layers tab
            layersTab.click();
        });


        //Tests for this are at the bottom
        const testTabView = mapp.ui.Tabview({
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

            // Create the helpDialog.node
            mapp.ui.elements.dialog({
                css_style: 'padding: 1em; border-color: #000',
                content: mapp.dictionary.no_locales,
                top: '50%',
                left: '10%'
            });
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
                    window.location.assign(`${mapp.host}?template=test_view&integrity=true&locale=${entry.key}`);
                },
            });

            layersTab.appendChild(mapp.utils.html.node`${localesDropdown}`);
        }

        //Testcase: Retrieve accesible locales
        await codi.it('should retrieve accessible locales from Workspace API', async () => {
            // Assert that locales is an array
            codi.assertTrue(Array.isArray(locales), 'Locales should be an array');

            // Assert that locales array is not empty
            codi.assertNotEqual(locales.length, 0, 'Locales array should not be empty');
        });

        //Testcase: Retrieve locale with list of layers
        await codi.it('should retrieve locale with list of layers from Workspace API', async () => {
            // Assert that locale is not an instance of Error
            codi.assertFalse(locale instanceof Error, 'Locale should not be an instance of Error');

            // Assert that locale has the expected properties
            codi.assertTrue(locale.hasOwnProperty('name'), 'Locale should have a "name" property');
            codi.assertTrue(locale.hasOwnProperty('key'), 'Locale should have a "key" property');
            codi.assertTrue(locale.hasOwnProperty('layers'), 'Locale should have a "layers" property');
        });

        //Testcase: Should error if no locales accsible
        if (locale instanceof Error) {
            await codi.it('should display an error dialog if locale is an instance of Error', async () => {

                // Assert that the error dialog is appended to the document body
                const errorDialog = document.querySelector('.dialog-modal');
                codi.assertNotEqual(errorDialog, null, 'Error dialog should be appended to the document body');

                // Assert that the error dialog contains the correct message
                codi.assertEqual(errorDialog.textContent.trim(), mapp.dictionary.no_locales, 'Error dialog should display the correct message');
            });
        }

        //Testcase: Dropdown for locales should be present if locales are present.
        if (locales.length > 1) {
            await codi.it('should add locale dropdown to layers panel if multiple locales are accessible', async () => {
                // Assert that the locale dropdown is appended to the layers tab
                const dropdown = layersTab.querySelector('[data-id="locales-dropdown"]');
                codi.assertNotEqual(dropdown, null, 'Locale dropdown should be appended to the layers tab');
            });
        }


        if (!window.ol) await mapp.utils.olScript()

        locale.syncPlugins ??= ['zoomBtn', 'admin', 'login']

        // Create mapview
        mapview = await mapp.Mapview({
            host: mapp.host,
            target: OL,
            locale: locale,
            hooks: false,
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
            syncPlugins: locale.syncPlugins
        });


        if (!locale.layers?.length) {

            mapp.ui.elements.dialog({
                css_style: 'padding: 1em; border-color: #000;',
                content: mapp.dictionary.no_layers,
                target: document.getElementById('Map'),
                top: '50%',
                left: '50%'
            });

        }

        // Add layers to mapview.
        await mapview.addLayer(locale.layers);

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

        //Testcase: Create mapview
        await codi.it('should create a mapview', async () => {
            // Assert that mapview is created
            codi.assertNotEqual(mapview, undefined, 'Mapview should be created');

            // Assert that mapview has the expected properties
            codi.assertTrue(mapview.hasOwnProperty('host'), 'Mapview should have a "host" property');
            codi.assertTrue(mapview.hasOwnProperty('target'), 'Mapview should have a "target" property');
            codi.assertTrue(mapview.hasOwnProperty('locale'), 'Mapview should have a "locale" property');
            codi.assertTrue(mapview.hasOwnProperty('hooks'), 'Mapview should have a "hooks" property');
            codi.assertTrue(mapview.hasOwnProperty('scrollWheelZoom'), 'Mapview should have a "scrollWheelZoom" property');
            codi.assertTrue(mapview.hasOwnProperty('attribution'), 'Mapview should have an "attribution" property');
        });

        //Testcase: Add layers to mapview
        await codi.it('should add layers to mapview', async () => {
            // Assert that layers are added to mapview
            codi.assertTrue(Object.keys(mapview.layers).length > 0, 'Mapview should have layers');
        });

        //Testcase: Create a gazetteer if in locale
        await codi.it('should create a gazetteer if available in the locale', async () => {
            if (mapview.locale.gazetteer) {
                const gazetteer = locationsTab.querySelector('div');
                codi.assertNotEqual(gazetteer, null, 'Gazetteer should be created');
            } else {
                // Assert that the locations tab is hidden
                const locationsTabElement = document.querySelector('[data-id=locations]');
                codi.assertEqual(locationsTabElement.style.display, 'none', 'Locations tab should be hidden');
            }
        });

        //Testcase: Should create a layers listview
        await codi.it('should create a layers listview', async () => {
            // Assert that the layers listview is created
            const listview = layersTab.querySelector('div');
            codi.assertNotEqual(listview, null, 'Layers listview should be created');
        });

        //Testcase: Check for locations list view if gazetteer is present or if there is a selection
        if (mapview.locale.gazetteer) {
            await codi.it('should create a locations listview', async () => {
                // Assert that the locations listview is created
                const listview = locationsTab.querySelector('div');
                codi.assertNotEqual(listview, null, 'Locations listview should be created');
            });
        }

        //Testcase: Ensure mapview has highlight interaction.
        await codi.it('should begin highlight interaction', async () => {
            // Assert that highlight interaction is added to mapview
            codi.assertTrue(mapview.interactions.hasOwnProperty('highlight'), 'Mapview should have a "highlight" interaction');
        });

        // Configure idle mask if set in locale.
        mapp.user &&
            mapview.locale.idle &&
            mapp.ui.utils.idleLogout({
                host: mapp.host,
                idle: mapview.locale.idle,
            });

        // Append spacer for tableview
        btnColumn.appendChild(mapp.utils.html.node`
<div class="mobile-display-none" style="height: 60px;">`);

        //Tests that have to run after everything else.

        //Testcase: Should show the tabview.
        await codi.it('should show the tabview when showTab is called', () => {
            // Add the 'desktop-display-none' class to the tabview
            tabview.classList.add('desktop-display-none');

            // Call the showTab function
            testTabView.showTab();

            // Assert that the 'desktop-display-none' class is removed from the tabview
            codi.assertFalse(tabview.classList.contains('desktop-display-none'), 'Tabview should not have the "desktop-display-none" class after showTab is called');

            // Assert that the grid template rows of the document body are set correctly
            codi.assertEqual(document.body.style.gridTemplateRows, 'auto 10px 50px', 'Grid template rows should be set to "auto 10px 50px" after showTab is called');
        });

        //Testcase: Should hide the tabview
        await codi.it('should hide the tabview when removeLastTab is called', () => {
            // Remove the 'desktop-display-none' class from the tabview
            tabview.classList.remove('desktop-display-none');

            // Call the removeLastTab function
            testTabView.removeLastTab();

            // Assert that the 'desktop-display-none' class is added to the tabview
            codi.assertTrue(tabview.classList.contains('desktop-display-none'), 'Tabview should have the "desktop-display-none" class after removeLastTab is called');



            // Assert that the grid template rows of the document body are set correctly
            codi.assertEqual(document.body.style.gridTemplateRows, 'auto 0px 0px', 'Grid template rows should be set to "auto 0 0" after removeLastTab is called');

            // Assert that the margin top of the map target element is set to 0
            codi.assertEqual(mapview.Map.getTargetElement().style.marginTop, '0px', 'Margin top of the map target element should be set to 0 after removeLastTab is called');
        });

    });

    return mapview;
}