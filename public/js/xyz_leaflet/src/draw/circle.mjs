import circle from '@turf/circle';
import distance from '@turf/distance';
import helpers from '@turf/helpers';

export default _xyz => {

  return layer => {

    if(!layer.display) layer.show();
    
    layer.header.classList.add('edited');
    _xyz.map_dom.style.cursor = 'crosshair';
    
    layer.edit.vertices = _xyz.L.featureGroup().addTo(_xyz.map);
    layer.edit.trail = _xyz.L.featureGroup().addTo(_xyz.map);
    layer.edit.path = _xyz.L.featureGroup().addTo(_xyz.map);

    // Options for circle construction.
    const options = {units: 'metres', steps: 128};

    // Define origin outside click event.
    let
      origin_lnglat,
      radius;
    
    _xyz.map.on('click', e => {
        
    // First point is origin.
      if(!origin_lnglat){

      // Define circle origin.
        origin_lnglat = [e.latlng.lng, e.latlng.lat];

        // Add circle marker to vertices layer.
        layer.edit.vertices.addLayer(_xyz.L.circleMarker(e.latlng, _xyz.style.defaults.vertex));

        // Set mousemove event to show trail.
        _xyz.map.on('mousemove', e => {

        // Remove trail layer on mouse move.
          layer.edit.trail.clearLayers();

          // Calculate radius from distance between origin and current location.
          radius = distance(
            helpers.point(origin_lnglat),
            helpers.point([e.latlng.lng, e.latlng.lat]),
            options
          ).toFixed(2);
        
          // Create new trail layer from origin and radius.
          layer.edit.trail.addLayer(
            _xyz.L.circle(
              [origin_lnglat[1],origin_lnglat[0]],
              Object.assign(
                _xyz.style.defaults.trail,
                {radius: parseFloat(radius)}
              )
            )
          );

        });

        return;
      }
               
      const xhr = new XMLHttpRequest();
      xhr.open('POST', _xyz.host + '/api/location/edit/draw?token=' + _xyz.token);
      xhr.setRequestHeader('Content-Type', 'application/json');

      xhr.onload = e => {

        layer.loaded = false;
        layer.get();
                
        if (e.target.status !== 200) return;
      
        // Select circle when post request returned 200.
        _xyz.locations.select({
          layer: layer.key,
          table: layer.table,
          id: e.target.response,
          marker: origin_lnglat,
          edit: layer.edit
        });

      };
    
      // Send circle geometry to endpoint.
      xhr.send(JSON.stringify({
        locale: _xyz.locale,
        layer: layer.key,
        table: layer.table,
        geometry: circle(origin_lnglat, radius, options).geometry
      }));

      _xyz.state.finish();

    });

  };

};