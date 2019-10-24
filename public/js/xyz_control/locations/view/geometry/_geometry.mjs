import isoline_mapbox from './isoline_mapbox.mjs';

import isoline_here from './isoline_here.mjs';

import delete_geom from './delete_geom.mjs';

export default _xyz => entry => {

  entry.ctrl = {

    isoline_here: isoline_here(_xyz),

    isoline_mapbox: isoline_mapbox(_xyz),

    deleteGeom: delete_geom(_xyz)

  };

  if (!entry.value && !entry.edit) return;

  // Merge location style with entry style.
  entry.style = Object.assign(
    {},
    entry.location.style,
    entry.style
  );

  let td = _xyz.utils.wire()`<td style="padding-top: 5px; position: relative;" colSpan=2>`;

  entry.row.appendChild(td);
 
  entry.ctrl.geometry = entry.value && _xyz.mapview.geoJSON({
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

  entry.ctrl.geometry && entry.location.geometries.push(entry.ctrl.geometry);

  if (entry.edit && entry.edit.isoline_mapbox) entry.ctrl.showGeom = entry.ctrl.isoline_mapbox;

  if (entry.edit && entry.edit.isoline_here) entry.ctrl.showGeom = entry.ctrl.isoline_here;


  entry.ctrl.hideGeom = () => {

    entry.location.geometries.splice(
      entry.location.geometries.indexOf(entry.ctrl.geometry),
      1
    );

    _xyz.map.removeLayer(entry.ctrl.geometry);

  };

  if (entry.edit) entry.ctrl.hideGeom = entry.ctrl.deleteGeom;

  if (entry.value) entry.display = true;

  if (entry.display && entry.edit && !entry.value) entry.ctrl.showGeom(entry); // allow isoline to be automatically created

  td.appendChild(_xyz.utils.wire()`
  <td style="padding-top: 5px;" colSpan=2>
  <label class="checkbox">
  <input type="checkbox"
    checked=${!!entry.display}
    onchange=${e => {
    entry.display = e.target.checked;
    entry.display ?
      entry.ctrl.showGeom(entry) :
      entry.ctrl.hideGeom(entry);
  }}></input><span>${entry.name || 'Additional geometries'}`);

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

  if (entry.edit) {

    entry.edit.container = _xyz.utils.wire()`
    <div class="table-section expandable">`;

    entry.edit.container.appendChild(_xyz.utils.wire()`
      <div class="btn_subtext cursor noselect pretty"
      style="text-align: left; font-style: italic; font-size: small;"
      onclick=${
        e => {
          if (e) e.stopPropagation();
          _xyz.utils.toggleExpanderParent({
            expandable: entry.edit.container,
            accordeon: true,
          });
        }
      }
      >Isoline settings
    `);


    if (entry.edit.isoline_here && entry.edit.isoline_here.slider) {

      if (!entry.display) td.appendChild(entry.edit.container);

      _xyz.ctrl.isoline_here({
        entry: entry,
        container: entry.edit.container
      });
    }

    if (entry.edit.isoline_mapbox && entry.edit.isoline_mapbox.slider) {

      if (!entry.display) td.appendChild(entry.edit.container);

      _xyz.ctrl.isoline_mapbox({
        entry: entry,
        container: entry.edit.container
      });
    }

  };

};