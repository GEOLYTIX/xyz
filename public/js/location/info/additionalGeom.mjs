export default (_xyz, record, entry) => {

  let tr = _xyz.utils.createElement({ tag: 'tr', appendTo: record.table });
  let td = _xyz.utils.createElement({ tag: 'td', style: {'paddingTop': '5px'}, appendTo: tr });

  _xyz.utils.createCheckbox({
    label: entry.name || 'Additional geometries',
    appendTo: td,
    checked: !!entry.value,
    onChange: e => {
      e.target.checked ? e.target.parentNode.classList.add('changed') : e.target.parentNode.classList.remove('changed');
      e.target.checked ? showAddGeom(record, entry) : hideAddGeom(record, entry);
    }
  });

  td = _xyz.utils.createElement({tag: 'td', appendTo: tr});

  _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'sample-circle'
    },
    style: {
      'backgroundColor': entry.style && entry.style.fillColor ? _xyz.utils.hexToRGBA(entry.style.fillColor || entry.style.color, entry.style.fillOpacity || 0.3) : _xyz.utils.hexToRGBA(entry.style ? entry.style.color : record.color, entry.style && entry.style.fillOpacity ? entry.style.fillOpacity : 0.3),
      'borderColor': entry.style && entry.style.color ? _xyz.utils.hexToRGBA(entry.style.color, entry.style.opacity ? entry.style.opacity : 1) : _xyz.utils.hexToRGBA(record.color, entry.style && entry.style.opacity ?  entry.style.opacity : 1),
      'borderStyle': 'solid',
      'borderWidth': _xyz.utils.setStrokeWeight(entry)
    },
    appendTo: td
  });

  function showAddGeom(record, entry){
    entry._geom = _xyz.locations.drawGeoJSON({
      json: {
        type: 'Feature',
        geometry: JSON.parse(entry.value)
      },
      pane: 'select_display',
      style: entry.style || {
        stroke: true,
        color: record.color,
        weight: 2,
        fill: true,
        fillOpacity: 0.3
      }
    });
    record.location.geometries.additional.push(entry._geom);
  }
	
  function hideAddGeom(record, entry){
    record.location.geometries.additional.forEach(geom => {
      if(geom === entry._geom) _xyz.map.removeLayer(geom);
    });
  }


};