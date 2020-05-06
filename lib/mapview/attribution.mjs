export default _xyz => {

  const attribution = {

    create: create,

    check: check,

    set: set,

    remove: remove,

  };

  return attribution;

  function create(params) {

    attribution.container && attribution.container.remove();
   
    attribution.container = _xyz.utils.wire()`<div class="attribution">`;

    _xyz.mapview.node.appendChild(attribution.container);

    attribution.scalebar = _xyz.utils.wire()`<div id="ol-scale">`;

    attribution.container.appendChild(attribution.scalebar);

    params.logo && attribution.container.appendChild(params.logo);

    attribution.links = _xyz.utils.wire()`
    <div>
      <a target="_blank" href="https://geolytix.github.io/xyz">XYZ v${_xyz.version}</a>
      <a target="_blank" href="https://openlayers.org">Openlayers</a>`;

    attribution.container.appendChild(attribution.links);
    
    if (_xyz.workspace.locale.attribution) {
      Object.entries(_xyz.workspace.locale.attribution).forEach(entry => {
        attribution.links.appendChild(_xyz.utils.wire()`
        <a target="_blank" href="${entry[1]}">${entry[0]}`);
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
      if (attribution.layer && !attribution.layer[entry[0]]) {

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