import catchment from './catchment.mjs';
import isoline from './isoline.mjs';

export default (_xyz, record, entry) => {

  const style = entry.style || {
    stroke: true,
    color: record.color,
    weight: 2,
    fill: true,
    fillOpacity: 0.3
  };

  if (entry.edit && entry.edit.catchment) catchment(_xyz, record, entry);
  
  if (entry.edit && entry.edit.isoline) isoline(_xyz, record, entry);
  
  if (!entry.value) return;
  
  entry._geom = _xyz.layers.geoJSON({
    json: {
      type: 'Feature',
      geometry: JSON.parse(entry.value)
    },
    pane: 'select_display',
    style: style
  });
    
  record.location.geometries.additional.push(entry._geom);

};
