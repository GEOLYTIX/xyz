export default _xyz => {

  return {
    create: create,
    check: check,
    set: set,
    remove: remove
  };

  function create() {

    if (_xyz.mapview.attribution.container) _xyz.mapview.attribution.container.remove();
   
    _xyz.mapview.attribution.container = _xyz.utils.hyperHTML.wire()`<div class="attribution"></div>`;

    _xyz.mapview.node.appendChild(_xyz.mapview.attribution.container);

    _xyz.mapview.attribution.container.appendChild(
      _xyz.utils.hyperHTML.wire()`
        <a class="logo" target="_blank" href="https://geolytix.co.uk">GEOLYTIX</a>`);

    _xyz.mapview.attribution.links = _xyz.utils.hyperHTML.wire()`<div></div>`;
    _xyz.mapview.attribution.container.appendChild(_xyz.mapview.attribution.links);

    if (_xyz.workspace.locale.attribution) {

      Object.entries(_xyz.workspace.locale.attribution).forEach(entry => {

        _xyz.mapview.attribution.links.appendChild(
          _xyz.utils.hyperHTML.wire()`
            <a target="_blank" href="${entry[1]}"> ${entry[0]}</a>`);
  
      });

    };
    
    _xyz.mapview.attribution.layer = {};
  
    _xyz.mapview.attribution.check();

  };

  function check() {

    Object.values(_xyz.layers.list).forEach(layer => {
      if (layer.display && layer.attribution) _xyz.mapview.attribution.set(layer.attribution);
    });

  };

  function set(attribution) {

    Object.entries(attribution).forEach(entry => {

      // Create new attribution for layer if the same attribution does not exist yet.
      if (!_xyz.mapview.attribution.layer[entry[0]]) {

        _xyz.mapview.attribution.layer[entry[0]] = _xyz.utils.hyperHTML.wire()`
        <a target="_blank" href="${entry[1]}"> ${entry[0]}</a>`;

        _xyz.mapview.attribution.links.appendChild(_xyz.mapview.attribution.layer[entry[0]]);

      }

    });

  };

  function remove(attribution) {

    Object.entries(attribution).forEach(entry => {

    // Create new attribution for layer if the same attribution does not exist yet.
      if (_xyz.mapview.attribution.layer[entry[0]]) {
        _xyz.mapview.attribution.layer[entry[0]].remove();
        delete _xyz.mapview.attribution.layer[entry[0]];
      }

    });

  };

};