const desktop = {};


_xyz({
  host: document.head.dataset.dir || new String(''),
  token: document.body.dataset.token,
  log: document.body.dataset.log,
  nanoid: document.body.dataset.nanoid,
  hooks: true,
  callback: init,
});

function init(_xyz) {



  desktop.listviews = document.querySelector('.listviews > .scrolly');

  // reset scrollbar on control container after window resize.
  window.addEventListener('resize', () => desktop.listviews.dispatchEvent(new CustomEvent('scrolly')));

  const vertDivider = document.getElementById('vertDivider');

  // Resize dataview while holding mousedown on resize_bar.
  vertDivider.addEventListener('mousedown', e => {

    // Prevent text selection.
    e.preventDefault();

    document.body.style.cursor = 'grabbing';
    window.addEventListener('mousemove', resize_x);
    window.addEventListener('mouseup', stopResize_x);
  });

  // Resize dataview while holding mousedown on resize_bar.
  vertDivider.addEventListener('touchstart', e => {

    window.addEventListener('touchmove', resize_x);
    window.addEventListener('touchend', stopResizeTouch_x);
  }, { passive: true });

  // Resize the dataview container
  function resize_x(e) {

    let width;

    if (e.touches) {

      if (e.touches[0].pageX < 333) return;

      // Get height from window height minus first finger touch position.
      width = e.touches[0].pageX;

    } else {

      if (e.pageX < 333) return;

      // Get height from window height minus cursor position.
      width = e.pageX;
    }

    // Full width snap.
    if (width > (window.innerWidth / 2)) width = window.innerWidth / 2;

    document.body.style.gridTemplateColumns = `${width}px 10px auto`;

  }

  // Remove eventListener after resize event.
  function stopResize_x() {

    _xyz.map.updateSize();

    document.body.style.cursor = 'auto';
    window.removeEventListener('mousemove', resize_x);
    window.removeEventListener('mouseup', stopResize_x);
  }

  // Remove eventListener after resize event.
  function stopResizeTouch_x() {

    _xyz.map.updateSize();

    window.removeEventListener('touchmove', resize_x);
    window.removeEventListener('touchend', stopResizeTouch_x);
  }


  const hozDivider = document.getElementById('hozDivider');

  // Resize dataview while holding mousedown on resize_bar.
  hozDivider.addEventListener('mousedown', e => {

    // Prevent text selection.
    e.preventDefault();

    document.body.style.cursor = 'grabbing';
    window.addEventListener('mousemove', resize_y);
    window.addEventListener('mouseup', stopResize_y);
  });

  // Resize dataview while holding mousedown on resize_bar.
  hozDivider.addEventListener('touchstart', e => {

    window.addEventListener('touchmove', resize_y);
    window.addEventListener('touchend', stopResizeTouch_y);
  }, { passive: true });

  // Resize the dataview container
  function resize_y(e) {

    let height;

    if (e.touches) {

      if (e.touches[0].pageY < 0) return;

      // Get height from window height minus first finger touch position.
      height = window.innerHeight - e.touches[0].pageY;

    } else {

      if (e.pageY < 0) return;

      // Get height from window height minus cursor position.
      height = window.innerHeight - e.pageY;
    }

    // Min height snap.
    if (height < 40) return;

    // Full height snap.
    if (height > (window.innerHeight - 10)) height = window.innerHeight;

    document.body.style.gridTemplateRows = `minmax(0, 1fr) ${height}px`;
  }

  // Remove eventListener after resize event.
  function stopResize_y() {

    _xyz.map.updateSize();

    document.body.style.cursor = 'auto';
    window.removeEventListener('mousemove', resize_y);
    window.removeEventListener('mouseup', stopResize_y);

    if (_xyz.dataview.current_table.Tabulator) _xyz.dataview.current_table.Tabulator.redraw(true);
  }

  // Remove eventListener after resize event.
  function stopResizeTouch_y() {

    _xyz.map.updateSize();

    window.removeEventListener('touchmove', resize_y);
    window.removeEventListener('touchend', stopResizeTouch_y);

    if (_xyz.dataview.current_table.Tabulator) _xyz.dataview.current_table.Tabulator.redraw(true);
  }





  createMap(_xyz);

  // Create locales dropdown if length of locales array is > 1.
  if (Object.keys(_xyz.workspace.locales).length > 1) {

    let entries = [];

    Object.values(_xyz.workspace.locales).map(locale => {
      entries.push(locale.key);
    });

    document.getElementById('localeDropdown').appendChild(_xyz.utils.wire()`
      <div class="pretty"><small>Show layers for the following locale
      `);

    document.getElementById('localeDropdown').appendChild(
      _xyz.utils.dropdownCustom({
        singleSelect: true,
        entries: entries,
        selectedIndex: entries.indexOf(_xyz.workspace.locale.key),
        callback: e => {
          _xyz.hooks.removeAll();
          _xyz.hooks.set({ locale: e.target.dataset.field });
          _xyz.workspace.loadLocale({ locale: _xyz.hooks.current.locale });
          document.getElementById('localeDropdown').querySelector('.head').textContent = e.target.dataset.field;
          createMap(_xyz);
        }
      }));
  }


  const btnWorkspace = document.getElementById('btnWorkspace');

  if (btnWorkspace) btnWorkspace.onclick = () => _xyz.workspace.admin();


  // Select locations from hooks.
  _xyz.hooks && _xyz.hooks.current.locations.forEach(_hook => {

    let hook = _hook.split('!');

    _xyz.locations.select({
      locale: _xyz.workspace.locale.key,
      layer: _xyz.layers.list[decodeURIComponent(hook[0])],
      table: hook[1],
      id: hook[2]
    });

  });


  if (_xyz.log) console.log(_xyz);

}

function createMap(_xyz) {

  document.body.style.gridTemplateRows = 'minmax(0, 1fr) 0';

  const attribution = {};

  attribution[_xyz.version] = _xyz.release;

  attribution['Openlayers'] = 'https://openlayers.org';

  // Create mapview control.
  _xyz.mapview.create({
    target: document.getElementById('Map'),
    attribution: attribution,
    view: {
      lat: _xyz.hooks.current.lat,
      lng: _xyz.hooks.current.lng,
      z: _xyz.hooks.current.z
    },
    scrollWheelZoom: true,
    btn: {
      ZoomIn: document.getElementById('btnZoomIn'),
      ZoomOut: document.getElementById('btnZoomOut'),
      Locate: document.getElementById('btnLocate'),
    }
  });

  _xyz.dataview.create({
    target: document.getElementById('dataview'),
    btn: {
      toggleDataview: document.getElementById('toggleDataview'),
      dataViewport: document.getElementById('btnDataViewport')
    }
  });

  _xyz.layers.listview.init({
    target: document.getElementById('layers')
  });

  _xyz.locations.listview.init({
    target: document.getElementById('locations'),
    callbackInit: () => {
      _xyz.locations.listview.node.parentElement.style.display = 'none';
    },
    callbackAdd: () => {
      setTimeout(() => {
        desktop.listviews.scrollTop = desktop.listviews.clientHeight;
      }, 500);
    }
  });



  // add scrollbar on the left to control container.
  _xyz.utils.scrolly(desktop.listviews);



  document.getElementById('clear_locations').onclick = () => {
    //_xyz.hooks.remove('locations');

    _xyz.locations.list
      .filter(record => !!record.location)
      .forEach(record => record.location.remove());
  };

  _xyz.gazetteer.init({
    target: document.getElementById('gazetteer'),
    toggle: document.getElementById('btnGazetteer'),
  });

};