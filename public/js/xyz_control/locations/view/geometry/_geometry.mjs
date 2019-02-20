import isoline_mapbox from './isoline_mapbox.mjs';

import isoline_here from './isoline_here.mjs';

import delete_geom from './delete.mjs';

export default _xyz => entry => {

  entry.ctrl = {

    isoline_here: isoline_here(_xyz),

    isoline_mapbox: isoline_mapbox(_xyz),

    delete_geom: delete_geom(_xyz),

  };
  
  if (!entry.value && !entry.edit) return;

  entry.style = entry.style || {
    stroke: true,
    color: '#009900',
    fillColor: '#ccff99',
    weight: 2,
    fill: true,
    fillOpacity: 0.3
  };

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
  
  _xyz.utils.createCheckbox({
    label: entry.name || 'Additional geometries',
    appendTo: td,
    checked: !!entry.value,
    onChange: e => {

      e.target.checked ?
        entry.ctrl.isoline_here(entry) :
        entry.ctrl.delete_geom(entry);

    }
  });

  // if (entry)
  
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
      'borderColor': _xyz.utils.hexToRGBA(entry.style.color, entry.style.fillOpacity),
      'borderStyle': 'solid',
      'borderWidth': _xyz.utils.setStrokeWeight(entry)
    },
    appendTo: td
  });
  
  if (!entry.value) return;
  
  const geom = _xyz.locations.drawGeoJSON({
    json: {
      type: 'Feature',
      geometry: JSON.parse(entry.value)
    },
    pane: 'select_display',
    style: entry.style
  });

  console.log(geom);
    
  entry.location.geometries.push(geom);

  // function showAddGeom(){
  //   const geom = _xyz.locations.drawGeoJSON({
  //     json: {
  //       type: 'Feature',
  //       geometry: JSON.parse(entry.value)
  //     },
  //     pane: 'select_display',
  //     style: entry.style
  //   });
  //   entry.location.geometries.push(geom);
  // }
    
  // function hideAddGeom(){
  //   location.geometries.forEach(geom => {
  //     if(geom === entry._geom) _xyz.map.removeLayer(geom);
  //   });
  // }

};