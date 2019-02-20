import isoline_mapbox from './isoline_mapbox.mjs';

import isoline_here from './isoline_here.mjs';

import delete_geom from './delete.mjs';

export default _xyz => {

  return {

    ctrl: ctrl,

    isoline_here: isoline_here(_xyz),

    isoline_mapbox: isoline_mapbox(_xyz),

    delete_geom: delete_geom(_xyz),

  };
  
  function ctrl (location, entry) {

    if (!entry.value && !entry.edit) return;

    location.style = entry.style || {
      stroke: true,
      color: '#009900',
      fillColor: '#ccff99',
      weight: 2,
      fill: true,
      fillOpacity: 0.3
    };

    let tr = _xyz.utils.createElement({
      tag: 'tr',
      appendTo: location.view.node
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
          location.view.geometry.isoline_here(location, entry) :
          location.view.geometry.delete_geom(location, entry);

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
        'backgroundColor': _xyz.utils.hexToRGBA(location.style.fillColor, location.style.fillOpacity),
        'borderColor': _xyz.utils.hexToRGBA(location.style.color, location.style.fillOpacity),
        'borderStyle': 'solid',
        'borderWidth': _xyz.utils.setStrokeWeight(entry)
      },
      appendTo: td
    });

    //if (entry.edit && entry.edit.catchment) catchment(_xyz, location, entry);
  
    //if (entry.edit && entry.edit.isoline) location.view.geometry.isoline(location, entry);

    //if(!entry.edit && entry.value) additionalGeom(_xyz, location, entry);
  
    if (!entry.value) return;
  
    const geom = _xyz.locations.drawGeoJSON({
      json: {
        type: 'Feature',
        geometry: JSON.parse(entry.value)
      },
      pane: 'select_display',
      style: location.style
    });
    
    location.geometries.push(geom);

  };

  function showAddGeom(location, entry){
    const geom = _xyz.locations.drawGeoJSON({
      json: {
        type: 'Feature',
        geometry: JSON.parse(entry.value)
      },
      pane: 'select_display',
      style: entry.style || {
        stroke: true,
        color: location.style.color,
        weight: 2,
        fill: true,
        fillOpacity: 0.3
      }
    });
    location.geometries.additional.push(geom);
  }
	
  function hideAddGeom(location, entry){
    location.geometries.additional.forEach(geom => {
      if(geom === entry._geom) _xyz.map.removeLayer(geom);
    });
  }

};