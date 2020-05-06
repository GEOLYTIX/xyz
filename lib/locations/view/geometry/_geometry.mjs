import _isoline_mapbox from './isoline_mapbox.mjs';

import _isoline_here from './isoline_here.mjs';

import _geometryCollection from './geometryCollection.mjs';

export default _xyz => {

  const isoline_here = _isoline_here(_xyz);

  const isoline_mapbox = _isoline_mapbox(_xyz);

  const geometryCollection = _geometryCollection(_xyz);

  return entry => {

    if (!entry.value && !entry.edit) return;

    // Merge location style with entry style.
    entry.style = Object.assign(
      {},
      entry.location.style,
      entry.style
    );

    entry.container = _xyz.utils.wire()`
    <div 
      class=${'lv-' + (entry.level || 0) + ' ' + (entry.class || '')}
      style="grid-column: 1 / 3; position: relative; display: flex; align-items: center;">`;

    entry.listview.appendChild(entry.container);

    function drawGeom() {

      if(entry.value.type === 'FeatureCollection'){

        geometryCollection(entry);

      } else {

      entry.geometry = entry.value && _xyz.mapview.geoJSON({
        geometry: typeof entry.value === 'object' && entry.value || JSON.parse(entry.value),
        dataProjection: '4326',
        zIndex: entry.location.layer.L.getZIndex()-1,
        style: new _xyz.mapview.lib.style.Style({
          stroke: entry.style.strokeColor && new _xyz.mapview.lib.style.Stroke({
            color: _xyz.utils.Chroma(entry.style.color || entry.style.strokeColor).alpha(1),
            width: entry.style.strokeWidth || 1,
          }),
          fill: new _xyz.mapview.lib.style.Fill({
            color: _xyz.utils.Chroma(entry.style.fillColor || entry.style.strokeColor).alpha(entry.style.fillOpacity === undefined ? 1 : parseFloat(entry.style.fillOpacity) || 0).rgba()
          })
        })
      });
      entry.geometry && entry.location.geometries.push(entry.geometry);
      entry.display = true;
    }

    }

    function hideGeom() {

      entry.geometry && entry.location.geometries.splice(entry.location.geometries.indexOf(entry.geometry), 1) && _xyz.map.removeLayer(entry.geometry);

      entry.location.geometryCollection && entry.location.geometries.splice(entry.location.geometries.indexOf(entry.geometryCollection), 1) && entry.location.geometryCollection.map(f => _xyz.map.removeLayer(f));

      entry.display = false;

      if(entry.legend) entry.legend.remove();
    };

    function createGeom() {

      if (entry.edit.isoline_mapbox) return isoline_mapbox.create(entry);

      if (entry.edit.isoline_here) return isoline_here.create(entry);
    }

    entry.container.appendChild(_xyz.utils.wire()`
    <label class="input-checkbox">
    <input type="checkbox"
      checked=${(entry.edit && entry.value) || !!entry.display}
      onchange=${e => {
        entry.display = e.target.checked;
        if (entry.display && entry.edit) return createGeom();
        if (entry.display && !entry.edit) return drawGeom();
        if (!entry.display && entry.edit) {
          entry.newValue = null
          entry.location.update();
          return
        };
        if (!entry.display && !entry.edit) return hideGeom();
      }}>
    </input>
    <div></div>
    <span>${entry.name || 'Geometry'}<span>`);

    !entry.style.theme && entry.container.appendChild(_xyz.utils.wire()`
    <div class="sample-circle"
      style="${`
        background-color: ${_xyz.utils.Chroma(entry.style.fillColor || entry.style.strokeColor).alpha(entry.style.fillOpacity === undefined ? 1 : (parseFloat(entry.style.fillOpacity) || 0))};
        border-color: ${_xyz.utils.Chroma(entry.style.color || entry.style.strokeColor).alpha(1)};
        border-style: solid;
        border-width: ${entry.style.strokeWidth || 1}px;
        margin-left: auto;`}">`);

    if (entry.edit && entry.edit.isoline_mapbox) entry.container.appendChild(isoline_mapbox.settings(entry));

    if (entry.edit && entry.edit.isoline_here) entry.container.appendChild(isoline_here.settings(entry));

    if (entry.value && (entry.display || entry.edit)) return drawGeom();

    if (!entry.value && entry.display) createGeom();

  };

}