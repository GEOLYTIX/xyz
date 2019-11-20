import _isoline_mapbox from './isoline_mapbox.mjs';

import _isoline_here from './isoline_here.mjs';

import _delete_geom from './delete_geom.mjs';

export default _xyz => {

  const isoline_here = _isoline_here(_xyz);

  const isoline_mapbox = _isoline_mapbox(_xyz);

  const deleteGeom = _delete_geom(_xyz);

  return entry => {

    if (!entry.value && !entry.edit) return;

    // Merge location style with entry style.
    entry.style = Object.assign(
      {},
      entry.location.style,
      entry.style
    );

    let td = _xyz.utils.wire()`<td style="padding-top: 5px; position: relative;" colSpan=2>`;

    entry.row.appendChild(td);

    function drawGeom() {
      entry.geometry = entry.value && _xyz.mapview.geoJSON({
        geometry: JSON.parse(entry.value),
        dataProjection: '4326',
        style: new _xyz.mapview.lib.style.Style({
          stroke: entry.style.strokeColor && new _xyz.mapview.lib.style.Stroke({
            color: _xyz.utils.Chroma(entry.style.color || entry.style.strokeColor).alpha(1),
            width: entry.style.strokeWidth || 1
          }),
          fill: new _xyz.mapview.lib.style.Fill({
            color: _xyz.utils.Chroma(entry.style.fillColor || entry.style.strokeColor).alpha(parseFloat(entry.style.fillOpacity) ? entry.style.fillOpacity : 0).rgba()
          })
        })
      });
      entry.geometry && entry.location.geometries.push(entry.geometry);
      entry.display = true;
    }

    function hideGeom() {

      entry.location.geometries.splice(entry.location.geometries.indexOf(entry.geometry), 1);

      _xyz.map.removeLayer(entry.geometry);

      entry.display = false;
    };

    function createGeom() {

      if (entry.edit.isoline_mapbox) return isoline_mapbox.create(entry);

      if (entry.edit.isoline_here) return isoline_here.create(entry);
    }

    td.appendChild(_xyz.utils.wire()`
    <td style="padding-top: 5px;" colSpan=2>
    <label class="input-checkbox">
    <input type="checkbox"
      checked=${entry.value || !!entry.display}
      onchange=${e => {
        entry.display = e.target.checked;
        if (entry.display && entry.edit) return createGeom();
        if (entry.display && !entry.edit) return drawGeom();
        if (!entry.display && entry.edit) return deleteGeom(entry);
        if (!entry.display && !entry.edit) return hideGeom();
      }}>
    </input>
    <div></div><span>${entry.name || 'Additional geometries'}`);

    td.appendChild(_xyz.utils.wire()`
    <div class="sample-circle"
      style="${
        'background-color:' + _xyz.utils.Chroma(entry.style.fillColor || entry.style.strokeColor).alpha(parseFloat(entry.style.fillOpacity) ? entry.style.fillOpacity : 0) + ';' +
        'border-color:' + _xyz.utils.Chroma(entry.style.color || entry.style.strokeColor).alpha(1) + ';'+
        'border-style: solid;' +
        'border-width:' + (entry.style.strokeWidth || 1) + 'px;' +
        'position: absolute;' +
        'right:0;' +
        'top:5px;'
      }">`)

    if (entry.edit && entry.edit.isoline_mapbox) td.appendChild(isoline_mapbox.settings(entry));

    if (entry.edit && entry.edit.isoline_here) td.appendChild(isoline_here.settings(entry));

    if (entry.value) drawGeom();

    if (!entry.value && entry.display) createGeom();

  };

}