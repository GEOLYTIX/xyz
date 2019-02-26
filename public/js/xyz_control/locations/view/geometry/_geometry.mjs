import isoline_mapbox from './isoline_mapbox.mjs';

import isoline_here from './isoline_here.mjs';

import delete_geom from './delete_geom.mjs';

export default _xyz => entry => {

  entry.ctrl = {

    isoline_here: isoline_here(_xyz),

    isoline_mapbox: isoline_mapbox(_xyz),

    delete_geom: delete_geom(_xyz),

  };

  if (!entry.value && !entry.edit) return;

  entry.style = Object.assign(
    {},
    entry.location.style,
    entry.style
  );

  let tr = _xyz.utils.createElement({
    tag: 'tr',
    appendTo: entry.location.view.node
  });

  let td = _xyz.utils.createElement({
    tag: 'td',
    style: {
      paddingTop: '5px'
    },
    appendTo: tr
  });

  entry.ctrl.showGeom = () => {
    entry.ctrl.geometry = _xyz.mapview.draw.geoJSON({
      json: {
        type: 'Feature',
        geometry: JSON.parse(entry.value)
      },
      pane: 'select_display',
      style: entry.style
    });
    entry.location.geometries.push(entry.ctrl.geometry);
  };

  if (entry.edit && entry.edit.isoline_here) entry.ctrl.showGeom = entry.ctrl.isoline_here;

  if (entry.edit && entry.edit.isoline_mapbox) entry.ctrl.showGeom = entry.ctrl.isoline_mapbox;

  entry.ctrl.hideGeom = () => {

    entry.location.geometries.splice(
      entry.location.geometries.indexOf(entry.ctrl.geometry),
      1
    );

    _xyz.map.removeLayer(entry.ctrl.geometry);
  };

  if (entry.edit) {
    entry.ctrl.hideGeom = entry.ctrl.delete_geom;
  }

  entry.ctrl.toggle = _xyz.utils.createCheckbox({
    label: entry.name || 'Additional geometries',
    appendTo: td,
    onChange: () => {

      entry.ctrl.toggle.checked ?
        entry.ctrl.showGeom(entry) :
        entry.ctrl.hideGeom(entry);

    }
  });

  if (entry.value && !entry.edit) {
    entry.ctrl.toggle.checked = true;
    entry.ctrl.toggle.onchange();
  }

  if (entry.value && entry.edit) {
    entry.ctrl.toggle.checked = true;

    entry.ctrl.geometry = _xyz.mapview.draw.geoJSON({
      json: {
        type: 'Feature',
        geometry: JSON.parse(entry.value)
      },
      pane: 'select_display',
      style: entry.style
    });
    entry.location.geometries.push(entry.ctrl.geometry);
  }

  td = _xyz.utils.createElement({
    tag: 'td',
    appendTo: tr
  });

  _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'sample-circle'
    },
    style: {
      'backgroundColor': _xyz.utils.hexToRGBA(entry.style.fillColor, entry.style.fillOpacity),
      'borderColor': _xyz.utils.hexToRGBA(entry.style.color, 1),
      'borderStyle': 'solid',
      'borderWidth': _xyz.utils.setStrokeWeight(entry)
    },
    appendTo: td
  });

};