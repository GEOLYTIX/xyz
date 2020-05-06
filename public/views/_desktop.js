window.onload = () => {

const desktop = {
  tabview: document.getElementById('tabview'),
  listviews: document.getElementById('listviews'),
  vertDivider: document.getElementById('vertDivider'),
  hozDivider: document.getElementById('hozDivider'),
  touch: () => ('ontouchstart' in window) || (navigator.maxTouchPoints > 0)
}


desktop.tabview.addEventListener('click', e => e.stopPropagation());

document.getElementById('mapButton').addEventListener(
  'mousemove', e => e.stopPropagation(), true);

// Resize while holding mousedown on vertDivider.
desktop.vertDivider.addEventListener('mousedown', e => {
  e.preventDefault();
  document.body.style.cursor = 'grabbing';
  window.addEventListener('mousemove', resize_x);
  window.addEventListener('mouseup', stopResize_x);
});

// Resize while touching vertDivider.
desktop.vertDivider.addEventListener('touchstart', () => {
  window.addEventListener('touchmove', resize_x);
  window.addEventListener('touchend', stopResize_x);
}, { passive: true });

function resize_x(e) {
  let pageX = (e.touches && e.touches[0].pageX) || e.pageX;

  if (pageX < 333) return;

  // Half width snap.
  if (pageX > (window.innerWidth / 2)) pageX = window.innerWidth / 2;

  document.body.style.gridTemplateColumns = `${pageX}px 10px auto`;
}

// Remove eventListener after resize event.
function stopResize_x() {
  document.body.style.cursor = 'auto';
  window.removeEventListener('mousemove', resize_x);
  window.removeEventListener('touchmove', resize_x);
  window.removeEventListener('mouseup', stopResize_x);
  window.removeEventListener('touchend', stopResize_x);
}

// Resize tabview while holding mousedown on hozDivider.
desktop.hozDivider.addEventListener('mousedown', e => {
  e.preventDefault();
  document.body.style.cursor = 'grabbing';
  window.addEventListener('mousemove', resize_y);
  window.addEventListener('mouseup', stopResize_y);
}, true);

// Resize dataview while touching hozDivider.
desktop.touch() && desktop.hozDivider.addEventListener('touchstart', e => {
  window.addEventListener('touchmove', resize_y);
  window.addEventListener('touchend', stopResize_y);
}, { passive: true });

// Resize the dataview container
function resize_y(e) {
  //e.stopPropagation();
  e.preventDefault();
  let pageY = (e.touches && e.touches[0].pageY) || e.pageY;

  if (pageY < 0) return;

  let height = window.innerHeight - pageY;

  // Min height snap.
  if (height < 40) return;

  // Full height snap.
  if (height > (window.innerHeight - 10)) height = window.innerHeight;

  desktop.tabview.style.maxHeight = height + 'px';

  if (height > 65 && document.querySelector('.attribution')) document.querySelector('.attribution').style.bottom = height + 'px';
}

// Remove eventListener after resize event.
function stopResize_y() {
  document.body.style.cursor = 'auto';
  window.removeEventListener('mousemove', resize_y);
  window.removeEventListener('touchmove', resize_y);
  window.removeEventListener('mouseup', stopResize_y);
  window.removeEventListener('touchend', stopResize_y);
}


_xyz({
  host: document.head.dataset.dir || new String(''),
  token: document.body.dataset.token,
  log: document.body.dataset.log,
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
          style="background-image: url('https://cdn.jsdelivr.net/gh/GEOLYTIX/geolytix/public/geolytix.svg');">`
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

  document.querySelector('.btn-column').appendChild(_xyz.utils.wire()`
    <button
      title="Zoom to area"
      onclick=${e => {

        e.stopPropagation();
        e.target.classList.toggle('enabled');

        if (e.target.classList.contains('enabled')) {

          return _xyz.mapview.interaction.zoom.begin({
            callback: () => {
              e.target.classList.remove('enabled')
            }
          })
        }
        
        _xyz.mapview.interaction.zoom.cancel();

      }}>
      <div class="xyz-icon icon-area off-black-filter">`);
 

  _xyz.mapview.node.addEventListener('changeEnd', () => {
    const z = _xyz.map.getView().getZoom();
    btnZoomIn.disabled = z >= _xyz.workspace.locale.maxZoom;
    btnZoomOut.disabled = z <= _xyz.workspace.locale.minZoom;
  });

  document.querySelector('.btn-column').appendChild(_xyz.utils.wire()`
    <button
      title="Current location"
      onclick=${e => {
        _xyz.mapview.locate.toggle();
        e.target.classList.toggle('enabled');
      }}>
      <div class="xyz-icon icon-gps-not-fixed off-black-filter">`);

  _xyz.dataviews.tabview.init({
    target: document.getElementById('tabview'),
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
    }
  });

  document.getElementById('clear_locations').onclick = e => {
    e.preventDefault();
    _xyz.locations.list
      .filter(record => !!record.location)
      .forEach(record => record.location.remove());
  };

  // Create locales dropdown if length of locales array is > 1.
  if (_xyz.workspace.locales.length > 1) {

    const localeDropdown = _xyz.utils.wire()`
    <div>
      <div class="listview-title secondary-colour-bg">Locales</div>
      <div>Show layers for the following locale:</div>
      <button
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
        <ul>${_xyz.workspace.locales.map(
          locale => _xyz.utils.wire()`<li><a href="${_xyz.host + '?locale=' + locale}">${locale}`
        )}`

    desktop.listviews.querySelector('div').insertBefore(localeDropdown, desktop.listviews.querySelector('div').firstChild);
  }

  if (_xyz.workspace.locale.gazetteer) {

    const gazetteer = _xyz.utils.wire()`
    <div>
      <div class="listview-title secondary-colour-bg">Search</div>
      <div class="input-drop">
        <input type="text" placeholder="Search places">
        <ul>`

    desktop.listviews.querySelector('div').insertBefore(gazetteer, desktop.listviews.querySelector('div').firstChild);

    _xyz.gazetteer.init({
      group: gazetteer.querySelector('.input-drop')
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

  _xyz.user && _xyz.user.admin_user && document.querySelector('.btn-column').appendChild(_xyz.utils.wire()`
    <a
      title="Open account admin view"
      class="enabled" style="cursor: pointer;"
      href="${_xyz.host + '/view/admin_user'}">
      <div class="xyz-icon icon-supervisor-account">`);

  _xyz.user && _xyz.user.admin_workspace && document.querySelector('.btn-column').appendChild(_xyz.utils.wire()`
    <a
      title="Open workspace configuration view"
      class="enabled" style="cursor: pointer;"
      href="${_xyz.host + '/view/admin_workspace'}">
      <div class="xyz-icon icon-settings">`);

  if (document.body.dataset.login) {
    document.querySelector('.btn-column').appendChild(_xyz.utils.wire()`
    <a
      title="${_xyz.user ? `Logout ${_xyz.user.email}` : 'Login'}"
      class="enabled" style="cursor: pointer;"
      href="${_xyz.host + (_xyz.user ? '/logout' : '/login')}">
      <div class="${'xyz-icon ' + (_xyz.user ? 'icon-logout' : 'icon-lock-open')}">`);
  }

}

}