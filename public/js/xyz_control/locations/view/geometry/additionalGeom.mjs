export default (_xyz, location, entry) => {

  let tr = _xyz.utils.createElement({ tag: 'tr', appendTo: location.view.node });
  let td = _xyz.utils.createElement({ tag: 'td', style: {'paddingTop': '5px'}, appendTo: tr });

  _xyz.utils.createCheckbox({
    label: entry.name || 'Additional geometries',
    appendTo: td,
    checked: !!entry.value,
    onChange: e => {
      e.target.checked ? e.target.parentNode.classList.add('changed') : e.target.parentNode.classList.remove('changed');
      e.target.checked ? showAddGeom(location, entry) : hideAddGeom(location, entry);
    }
  });

  td = _xyz.utils.createElement({tag: 'td', appendTo: tr});

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