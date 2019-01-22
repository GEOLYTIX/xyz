import catchment from './catchment.mjs';

export default (_xyz, record, entry) => {

  if (entry.edit && entry.edit.catchment) catchment(_xyz, record, entry);

  if (!entry.value) return;

  const style = entry.style || {
    stroke: true,
    color: record.color,
    weight: 2,
    fill: true,
    fillOpacity: 0.3
  };
  
  const geom = _xyz.layers.geoJSON({
    json: {
      type: 'Feature',
      geometry: JSON.parse(entry.value)
    },
    pane: 'select_display',
    style: style
  });

  if (entry.edit && entry.edit.catchment) entry.edit.catchment.geometry = geom;

  record.location.geometries.push(geom);

};