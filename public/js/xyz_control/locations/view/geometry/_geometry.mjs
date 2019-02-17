import catchment from './catchment.mjs';
import isoline from './isoline.mjs';
import additionalGeom from './additionalGeom.mjs';

export default (_xyz, location, entry) => {

  location.style = entry.style || {
    stroke: true,
    color: '#009900',
    fillColor: '#ccff99',
    weight: 2,
    fill: true,
    fillOpacity: 0.3
  };

  if (entry.edit && entry.edit.catchment) catchment(_xyz, location, entry);
  
  if (entry.edit && entry.edit.isoline) isoline(_xyz, location, entry);

  if(!entry.edit && entry.value) additionalGeom(_xyz, location, entry);
  
  if (!entry.value) return;
  
  const geom = _xyz.locations.drawGeoJSON({
    json: {
      type: 'Feature',
      geometry: JSON.parse(entry.value)
    },
    pane: 'select_display',
    style: style
  });
    
  location.geometries.additional.push(geom);

};
