import _xyz from '../../_xyz.mjs';

import catchment from './catchment.mjs';
import isoline from './isoline.mjs';

export default (record, entry) => {

  const style = entry.style || {
    stroke: true,
    color: record.color,
    weight: 2,
    fill: true,
    fillOpacity: 0.3
  };

  if (entry.edit.catchment) {
    
    catchment(record, entry);

    if (!entry.value) return;

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
  }
    
  if (entry.edit.isoline) {

    isoline(record, entry);

    if (!entry.value) return;

    entry.edit.isoline.geometry = L.geoJson(
      {
        type: 'Feature',
        geometry: JSON.parse(entry.value)
      }, {
        interactive: false,
        pane: 'select_display',
        style: style
      }).addTo(_xyz.map);
      
    record.location.geometries.push(entry.edit.isoline.geometry);
  }
  

};