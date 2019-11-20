export default _xyz => {

  const attribution = {

    create: create,

    check: check,

    set: set,

    remove: remove,

    layer: {},

    links: _xyz.utils.wire()`<div></div>`

  };

  return attribution;

  function create(mapAttribution) {

    if (!mapAttribution) return;

    if (attribution.container) attribution.container.remove();
   
    attribution.container = _xyz.utils.wire()`<div class="attribution"></div>`;

    _xyz.mapview.node.appendChild(attribution.container);

    attribution.container.appendChild(
      _xyz.utils.wire()`
      <a class="logo" target="_blank" href="https://geolytix.co.uk">GEOLYTIX</a>`);

    attribution.container.appendChild(attribution.links);

    attribution.links.innerHTML = '';

    if (typeof mapAttribution === 'object') {
      Object.entries(mapAttribution).forEach(entry => {
        attribution.links.appendChild(_xyz.utils.wire()`
        <a target="_blank" href="${entry[1]}">${entry[0]}</a>`);
      });
    }

    if (_xyz.workspace.locale.attribution) {
      Object.entries(_xyz.workspace.locale.attribution).forEach(entry => {
        attribution.links.appendChild(_xyz.utils.wire()`
        <a target="_blank" href="${entry[1]}">${entry[0]}</a>`);
      });
    };
    
    attribution.layer = {};
  
    check();
  };

  function check() {

    Object.values(_xyz.layers.list).forEach(layer => {
      if (layer.display && layer.attribution) set(layer.attribution);
    });
  };

  function set(attribution_entries) {

    Object.entries(attribution_entries).forEach(entry => {

      // Create new attribution for layer if the same attribution does not exist yet.
      if (!attribution.layer[entry[0]]) {

        attribution.layer[entry[0]] = _xyz.utils.wire()`
        <a target="_blank" href="${entry[1]}">${entry[0]}</a>`;

        attribution.links.appendChild(attribution.layer[entry[0]]);

      }

    });
  };

  function remove(attribution_entries) {

    Object.entries(attribution_entries).forEach(entry => {

      // Create new attribution for layer if the same attribution does not exist yet.
      if (attribution.layer[entry[0]]) {
        attribution.layer[entry[0]].remove();
        delete attribution.layer[entry[0]];
      }

    });
  };

};