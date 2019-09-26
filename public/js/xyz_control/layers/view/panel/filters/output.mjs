export default (_xyz, panel, layer) => _xyz.utils.createElement({
  tag: 'button',
  options: {
    className: 'btn_wide noselect',
    textContent: 'Run Output',
    disabled: true
  },
  appendTo: panel,
  eventListener: {
    event: 'click',
    funct: e => {

      if (e.target.disabled) return;

      // Create filter from legend and current filter.
      const filter = Object.assign({}, layer.filter.legend, layer.filter.current);
    
      const xhr = new XMLHttpRequest();
          
      xhr.open(
        'GET',
        _xyz.host + '/api/location/select/aggregate?' +
        _xyz.utils.paramString({
          locale: _xyz.workspace.locale.key,
          layer: layer.key,
          table: layer.table,
          filter: JSON.stringify(filter),
          token: _xyz.token
        }));

      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.responseType = 'json';
    
      xhr.onload = e => {
  
        if (e.target.status !== 200) return;
    
   
        //const json = JSON.parse(e.target.response);
       
        const location = _xyz.locations.decorate({
          geometry: JSON.parse(e.target.response.geomj),
          infoj: e.target.response.infoj,
          layer: layer,
          // style: {
          //   color: record.color,
          //   fillColor: record.color,
          //   letter: record.letter,
          //   stroke: true,
          //   fill: false
          // }
        });
       
        
        location.view();

        location.Layer = _xyz.mapview.geoJSON({
          geometry: location.geometry,
          style: [
            new _xyz.mapview.lib.style.Style({
              stroke: new _xyz.mapview.lib.style.Stroke({
                color: 'rgba(255, 255, 255, 0.2)',
                width: 8
              }),
            }),
            new _xyz.mapview.lib.style.Style({
              stroke: new _xyz.mapview.lib.style.Stroke({
                color: 'rgba(255, 255, 255, 0.2)',
                width: 6
              }),
            }),
            new _xyz.mapview.lib.style.Style({
              stroke: new _xyz.mapview.lib.style.Stroke({
                color: 'rgba(255, 255, 255, 0.2)',
                width: 4
              }),
            }),
            new _xyz.mapview.lib.style.Style({
              stroke: location.style.strokeColor && new _xyz.mapview.lib.style.Stroke({
                color: location.style.strokeColor,
                width: location.style.strokeWidth || 1
              }),
              fill: location.style.fillColor && new _xyz.mapview.lib.style.Fill({
                color: _xyz.utils.Chroma(location.style.fillColor).alpha(location.style.fillOpacity === 0 ? 0 : parseFloat(location.style.fillOpacity) || 1).rgba()
              }),
              // The default callback does not assign an image style for selected point locations.
            })
          ],
          dataProjection: location.layer.srid,
          featureProjection: _xyz.mapview.srid
        });
      
    
        
        // Draw the location to the map.
        //location.draw();

        // if(!location.geometry.coordinates.length){
        //   alert('Not enough features found to calculate aggregate data. Try zooming to layer extent.');
        //   return;
        // }
    
        // location.Marker = _xyz.mapview.geoJSON({
        //   geometry: {
        //     type: 'Point',
        //     coordinates: _xyz.utils.turf.pointOnFeature(location.geometry).geometry.coordinates
        //   },
        //   pane: 'select_marker',
        //   style: {
        //     icon: {
        //       url: _xyz.utils.svg_symbols({
        //         type: 'markerLetter',
        //         letter: record.letter,
        //         color: record.color,
        //       }),
        //       size: 40,
        //       anchor: [20, 40]
        //     }
        //   }
        // });
    
        //location.flyTo();
    
    
      };
    
      xhr.send();
    }
  }
});