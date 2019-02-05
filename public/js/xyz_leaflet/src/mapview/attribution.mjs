export default _xyz => {

  _xyz.attribution.create = () => {

    if (_xyz.attribution.container) _xyz.attribution.container.remove();
   
    _xyz.attribution.container = _xyz.utils.hyperHTML.wire()`<div class="attribution"></div>`;

    _xyz.mapview.node.appendChild(_xyz.attribution.container);

    _xyz.attribution.container.appendChild(
      _xyz.utils.hyperHTML.wire()`
        <a class="logo" target="_blank" href="https://geolytix.co.uk">GEOLYTIX</a>`);

    _xyz.attribution.links = _xyz.utils.hyperHTML.wire()`<div></div>`;
    _xyz.attribution.container.appendChild(_xyz.attribution.links);

    if (_xyz.ws.locales[_xyz.locale].attribution) {

      Object.entries(_xyz.ws.locales[_xyz.locale].attribution).forEach(entry => {

        _xyz.attribution.links.appendChild(
          _xyz.utils.hyperHTML.wire()`
            <a target="_blank" href="${entry[1]}"> ${entry[0]}</a>`);
  
      });

    };
    
    _xyz.attribution.layer = {};
  
    _xyz.attribution.check();

  };

  _xyz.attribution.check = () => {

    Object.values(_xyz.layers.list).forEach(layer => {
      if (layer.display && layer.attribution) _xyz.attribution.set(layer.attribution);
    });

  };

  _xyz.attribution.set = attribution => {

    Object.entries(attribution).forEach(entry => {

      // Create new attribution for layer if the same attribution does not exist yet.
      if (!_xyz.attribution.layer[entry[0]]) {

        _xyz.attribution.layer[entry[0]] = _xyz.utils.hyperHTML.wire()`
        <a target="_blank" href="${entry[1]}"> ${entry[0]}</a>`;

        _xyz.attribution.links.appendChild(_xyz.attribution.layer[entry[0]]);

      }

    });

  };

  _xyz.attribution.remove = attribution => {

    Object.entries(attribution).forEach(entry => {

    // Create new attribution for layer if the same attribution does not exist yet.
      if (_xyz.attribution.layer[entry[0]]) {
        _xyz.attribution.layer[entry[0]].remove();
        delete _xyz.attribution.layer[entry[0]];
      }

    });

  };

};