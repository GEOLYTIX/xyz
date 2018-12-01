import _xyz from '../../_xyz.mjs';

import catchment from './catchment.mjs';

export default (record, entry) => {

  if (entry.edit.catchment) catchment(record, entry);

  if (!entry.value) return;

  const style = entry.style || {
    stroke: true,
    color: record.color,
    weight: 2,
    fill: true,
    fillOpacity: 0.3
  };

  //const geometry = L.geoJson(
  entry.edit.catchment.geometry = L.geoJson(
    {
      type: 'Feature',
      geometry: JSON.parse(entry.value)
    }, {
      interactive: false,
      pane: 'select_display',
      style: style
    }).addTo(_xyz.map);

  record.location.geometries.push(entry.edit.catchment.geometry);

};