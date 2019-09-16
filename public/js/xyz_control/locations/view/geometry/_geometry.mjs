import isoline_mapbox from './isoline_mapbox.mjs';

import isoline_here from './isoline_here.mjs';

import delete_geom from './delete_geom.mjs';

export default _xyz => entry => {

  entry.ctrl = {

    isoline_here: isoline_here(_xyz),

    isoline_mapbox: isoline_mapbox(_xyz),

    deleteGeom: delete_geom(_xyz),

  };

  if (!entry.value && !entry.edit) return;

  entry.style = Object.assign(
    {},
    entry.location.style,
    entry.style
  );

  let td = _xyz.utils.wire()`
  <td style="padding-top: 5px; position: relative;" colSpan=2>`;

  entry.row.appendChild(td);



  entry.ctrl.geometry = _xyz.mapview.geoJSON({
    geometry: JSON.parse(entry.value),
    pane: entry.location.layer,
    style: entry.style
  });
  entry.location.geometries.push(entry.ctrl.geometry);
};

entry.ctrl.showGeom = drawGeom;

if (entry.edit && entry.edit.isoline_mapbox) entry.ctrl.drawGeom = entry.ctrl.isoline_mapbox;


entry.ctrl.hideGeom = () => {

  entry.location.geometries.splice(
    entry.location.geometries.indexOf(entry.ctrl.geometry),
    1
  );

  if (_xyz.map.hasLayer(entry.ctrl.geometry)) _xyz.map.removeLayer(entry.ctrl.geometry);
};

if (entry.edit) {
  entry.ctrl.hideGeom = entry.ctrl.delete_geom;
}


td.appendChild(_xyz.utils.wire()`
  <td style="padding-top: 5px;" colSpan=2>
  <label class="checkbox">${entry.name || 'Additional geometries'}
  <input type="checkbox"
    checked=${!!entry.display}
    onchange=${e => {
    entry.display = e.target.checked;
    entry.display ?
      entry.ctrl.showGeom(entry) :
      entry.ctrl.hideGeom(entry);
  }}>
  <div class="checkbox_i">`);


if (entry.value) {
  entry.display = true;
  entry.ctrl.showGeom(entry);
}

_xyz.utils.createElement({
  tag: 'div',
  options: {
    classList: 'sample-circle'
  },
  style: {
    //backgroundColor: _xyz.utils.chroma(entry.style.fillColor).alpha(entry.style.fillOpacity === 0 ? 0 : parseFloat(entry.style.fillOpacity) || 1).rgba(),
    //borderColor: _xyz.utils.chroma(entry.style.color).alpha(1).rgba(),
    borderStyle: 'solid',
    //borderWidth: _xyz.utils.setStrokeWeight(entry),
    position: 'absolute',
    right: 0,
    top: '5px'
  },
  appendTo: td
});

if (entry.edit) {

  entry.edit.container = _xyz.utils.wire()`
    <div style="padding: 4px;" class="table-section expandable">`;


  _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'btn_subtext cursor noselect',
      textContent: 'Isoline settings'
    },
    style: {
      textAlign: 'left',
      fontStyle: 'italic',
      fontSize: 'small'
    },
    appendTo: entry.edit.container,
    eventListener: {
      event: 'click',
      funct: e => {
        if (e) e.stopPropagation();
        _xyz.utils.toggleExpanderParent({
          expandable: entry.edit.container,
          accordeon: true,
          scrolly: _xyz.desktop && _xyz.desktop.listviews
        });
      }
    }
  });


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