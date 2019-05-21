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
    
      const xhr = new XMLHttpRequest();

      // Create filter from legend and current filter.
      const filter = Object.assign({}, layer.filter.legend, layer.filter.current);
          
      xhr.open(
        'GET',
        _xyz.host +
        '/api/location/select/aggregate?' +
        _xyz.utils.paramString({
          locale: _xyz.workspace.locale.key,
          layer: layer.key,
          table: layer.table,
          filter: JSON.stringify(filter),
          token: _xyz.token
        }));
    
      xhr.onload = e => {
  
        if (e.target.status !== 200) return;
    
        const record = _xyz.locations.listview.getFreeRecord();
    
        if (!record) return;
    
        const json = JSON.parse(e.target.response);
       
        const location = _xyz.locations.location({
          geometry: JSON.parse(json.geomj),
          infoj: json.infoj,
          layer: layer.key,
          style: {
            color: record.color,
            fillColor: record.color,
            letter: record.letter,
            stroke: true,
            fill: false
          }
        });
       
        
        _xyz.locations.view(location);
    
        
        // Draw the location to the map.
        location.draw();

        if(!location.geometry.coordinates.length){
          alert('Not enough features found to calculate aggregate data. Try zooming to layer extent.');
          return;
        }
    
        location.Marker = _xyz.geom.geoJSON({
          json: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: _xyz.utils.turf.pointOnFeature(location.geometry).geometry.coordinates,
            }
          },
          pane: 'select_marker',
          style: {
            icon: {
              url: _xyz.utils.svg_symbols({
                type: 'markerLetter',
                style: {
                  letter: record.letter,
                  color: record.color,
                }
              }),
              size: 40,
              anchor: [20, 40]
            }
          }
        });
    
        location.flyTo();
    
        record.location = location;
    
        // List the record
        _xyz.locations.listview.add(record);
    
      };
    
      xhr.send();
    }
  }
});