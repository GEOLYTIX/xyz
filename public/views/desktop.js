const desktop = {
  map: document.getElementById('Map'),
  dataview: document.getElementById('dataview'),
  listviews: document.getElementById('listviews'),
  scrolly: document.getElementById('listviews').querySelector('.scrolly'),
  vertDivider: document.getElementById('vertDivider'),
  hozDivider: document.getElementById('hozDivider'),
}

// Reset scrolly height after window resize.
window.addEventListener('resize', () => {
  desktop.map.dispatchEvent(new CustomEvent('updatesize'));
  desktop.dataview.dispatchEvent(new CustomEvent('updatesize'));
  desktop.scrolly.dispatchEvent(new CustomEvent('scrolly'));
});

// Resize dataview while holding mousedown on resize_bar.
desktop.vertDivider.addEventListener('mousedown', e => {
  e.preventDefault();
  document.body.style.cursor = 'grabbing';
  window.addEventListener('mousemove', resize_x);
  window.addEventListener('mouseup', stopResize_x);
});

// Resize dataview while holding mousedown on resize_bar.
desktop.vertDivider.addEventListener('touchstart', () => {
  window.addEventListener('touchmove', resize_x);
  window.addEventListener('touchend', stopResize_x);
}, { passive: true });

// Resize the dataview container
function resize_x(e) {
  let pageX = (e.touches && e.touches[0].pageX) || e.pageX;

  if (pageX < 333) return;

  // Half width snap.
  if (pageX > (window.innerWidth / 2)) pageX = window.innerWidth / 2;

  document.body.style.gridTemplateColumns = `${pageX}px 10px auto`;
}

// Remove eventListener after resize event.
function stopResize_x() {
  desktop.map.dispatchEvent(new CustomEvent('updatesize'));
  document.body.style.cursor = 'auto';
  window.removeEventListener('mousemove', resize_x);
  window.removeEventListener('touchmove', resize_x);
  window.removeEventListener('mouseup', stopResize_x);
  window.removeEventListener('touchend', stopResize_x);
}

// Resize dataview while holding mousedown on resize_bar.
desktop.hozDivider.addEventListener('mousedown', e => {
  e.preventDefault();
  document.body.style.cursor = 'grabbing';
  window.addEventListener('mousemove', resize_y);
  window.addEventListener('mouseup', stopResize_y);
});

// Resize dataview while holding mousedown on resize_bar.
desktop.hozDivider.addEventListener('touchstart', e => {
  window.addEventListener('touchmove', resize_y);
  window.addEventListener('touchend', stopResize_y);
}, { passive: true });

// Resize the dataview container
function resize_y(e) {
  let pageY = (e.touches && e.touches[0].pageY) || e.pageY;

  if (pageY < 0) return;

  let height = window.innerHeight - pageY;

  // Min height snap.
  if (height < 40) return;

  // Full height snap.
  if (height > (window.innerHeight - 10)) height = window.innerHeight;

  document.body.style.gridTemplateRows = `minmax(0, 1fr) ${height}px`;
}

// Remove eventListener after resize event.
function stopResize_y() {
  document.body.style.cursor = 'auto';
  window.removeEventListener('mousemove', resize_y);
  window.removeEventListener('touchmove', resize_y);
  window.removeEventListener('mouseup', stopResize_y);
  window.removeEventListener('touchend', stopResize_y);
  desktop.map.dispatchEvent(new CustomEvent('updatesize'));
  desktop.dataview.dispatchEvent(new CustomEvent('updatesize'));
}


_xyz({
  host: document.head.dataset.dir || new String(''),
  token: document.body.dataset.token,
  log: document.body.dataset.log,
  nanoid: document.body.dataset.nanoid,
  hooks: true,
  callback: init,
});

function init(_xyz) {

  if (document.body.dataset.token) {
    _xyz.user = _xyz.utils.JWTDecode(document.body.dataset.token);
  }

  _xyz.mapview.create({
    target: document.getElementById('Map'),
    attribution: {
      logo: _xyz.utils.wire()`
          <a
            class="logo"
            target="_blank"
            href="https://geolytix.co.uk"
            style="background-image: url('https://cdn.jsdelivr.net/gh/GEOLYTIX/geolytix@master/public/geolytix.svg');">`
    },
    view: {
      lat: _xyz.hooks.current.lat,
      lng: _xyz.hooks.current.lng,
      z: _xyz.hooks.current.z
    },
    scrollWheelZoom: true,
  });

  const btnZoomIn = _xyz.utils.wire()`
  <button
    disabled=${_xyz.map.getView().getZoom() >= _xyz.workspace.locale.maxZoom}
    class="enabled"
    title="Zoom in"
    onclick=${e => {
      const z = parseInt(_xyz.map.getView().getZoom() + 1);
      _xyz.map.getView().setZoom(z);
      e.target.disabled = (z >= _xyz.workspace.locale.maxZoom);
    }}><div class="xyz-icon icon-add">`;

  document.querySelector('.btn-column').appendChild(btnZoomIn);

  const btnZoomOut = _xyz.utils.wire()`
  <button
    disabled=${_xyz.map.getView().getZoom() <= _xyz.workspace.locale.minZoom}
    class="enabled"
    title="Zoom out"
    onclick=${e => {
      const z = parseInt(_xyz.map.getView().getZoom() - 1);
      _xyz.map.getView().setZoom(z);
      e.target.disabled = (z <= _xyz.workspace.locale.minZoom);
    }}><div class="xyz-icon icon-remove">`;

  document.querySelector('.btn-column').appendChild(btnZoomOut);  

  _xyz.mapview.node.addEventListener('changeEnd', () => {
    const z = _xyz.map.getView().getZoom();
    btnZoomIn.disabled = z >= _xyz.workspace.locale.maxZoom;
    btnZoomOut.disabled = z <= _xyz.workspace.locale.minZoom;
  });


  if(_xyz.workspace.locale.locate) {

    document.querySelector('.btn-column').appendChild(_xyz.utils.wire()`
    <button title="Current location"
      onclick=${e=>{
        _xyz.mapview.locate.toggle();
        e.target.classList.toggle('enabled');
      }}><div class="xyz-icon icon-gps-not-fixed off-black-filter">`);
  }


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
      _xyz.locations.listview.node.parentElement.style.display = 'block';
      setTimeout(() => {
        desktop.listviews.scrollTop = desktop.listviews.offsetHeight;
      }, 500);
    }
  });

  // Initialise scrolly on listview element.
  _xyz.utils.scrolly(desktop.scrolly);

  document.getElementById('clear_locations').onclick = e => {
    e.preventDefault();
    _xyz.locations.list
      .filter(record => !!record.location)
      .forEach(record => record.location.remove());
    if (_xyz.dataview.node) _xyz.map.updateSize();
  };

  // Create locales dropdown if length of locales array is > 1.
  if (Object.keys(_xyz.workspace.locales).length > 1) {

    const localeDropdown = _xyz.utils.wire()`
    <div>
      <div class="listview-title secondary-colour-bg">Locales</div>
      <div>Show layers for the following locale:</div>
      <button
        style="margin-bottom: 10px;"
        class="btn-drop">
        <div
          class="head"
          onclick=${e => {
            e.preventDefault();
            e.target.parentElement.classList.toggle('active');
          }}>
          <span>${_xyz.workspace.locale.key}</span>
          <div class="icon"></div>
        </div>
        <ul>${Object.values(_xyz.workspace.locales).map(
          locale => _xyz.utils.wire()`<li><a href="${_xyz.host + '?locale=' + locale.key}">${locale.key}`
        )}`


    desktop.scrolly.insertBefore(localeDropdown, desktop.scrolly.firstChild);

  }

  if (_xyz.workspace.locale.gazetteer) {

    const gazetteer = _xyz.utils.wire()`
    <div>
      <div class="listview-title secondary-colour-bg">Search</div>
      <div class="input-drop">
        <input type="text" placeholder="Search places">
        <ul>`

    desktop.scrolly.insertBefore(gazetteer, desktop.scrolly.firstChild);

    _xyz.gazetteer.init({
      group: gazetteer.querySelector('.input-drop'),
    });
  }


  // Select locations from hooks.
  _xyz.hooks.current.locations.forEach(_hook => {

    let hook = _hook.split('!');

    _xyz.locations.select({
      locale: _xyz.workspace.locale.key,
      layer: _xyz.layers.list[decodeURIComponent(hook[0])],
      table: hook[1],
      id: hook[2]
    });
  });

  if (document.body.dataset.login) {
    document.querySelector('.btn-column').appendChild(_xyz.utils.wire()`
    <a
      title="${_xyz.user ? _xyz.user.email : 'Login'}"
      class="enabled"
      href="${_xyz.host + '/login'}">
      <div class="${'xyz-icon ' + (_xyz.user ? 'icon-face' : 'icon-lock-open')}">`);
  }

  if (_xyz.user) {

    _xyz.user.admin_user && document.querySelector('.btn-column').appendChild(_xyz.utils.wire()`
    <a
      title="Open account admin view"
      class="enabled"
      href="${_xyz.host + '/user/admin'}">
      <div class="xyz-icon icon-supervisor-account">`);

    _xyz.user.admin_workspace && document.body.dataset.pgworkspace && document.querySelector('.btn-column').appendChild(_xyz.utils.wire()`
    <button
      title="Open workspace configuration view"
      class="enabled"
      onclick=${_xyz.workspace.admin}>
      <div class="xyz-icon icon-settings">`);
  }

  if (_xyz.log) console.log(_xyz);
}