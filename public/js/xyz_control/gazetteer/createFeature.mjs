export default _xyz => function(geom){

  const gazetteer = this;

  // Parse json if geom is string
  geom = typeof (geom) === 'string' ? JSON.parse(geom) : geom;

  // Remove existing layer.
  if (gazetteer.layer) _xyz.map.removeLayer(gazetteer.layer);
  
  gazetteer.layer = _xyz.mapview.geoJSON({
    geometry: geom.geometry,
    pane: 'gazetteer',
    // dbauszus *** style needs to be OL object
    style: {
      icon: {
        url: gazetteer.icon,
        size: 40,
        anchor: [20, 40]
      }
    }
  });
  
  // Zoom to the extent of the gazetteer layer
  _xyz.map.fitBounds(gazetteer.layer.getBounds());

};