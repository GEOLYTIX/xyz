export default (_xyz, panel, layer) => _xyz.utils.createElement({
  tag: 'div',
  options: {
    className: 'btn_wide cursor noselect',
    textContent: 'Run Output',
  },
  style: {
    display: 'none'
  },
  appendTo: panel,
  eventListener: {
    event: 'click',
    funct: () => {
    
      const xhr = new XMLHttpRequest();

      // Create filter from legend and current filter.
      const filter = Object.assign({},layer.filter.current,layer.filter.legend);
    
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

        const json = JSON.parse(e.target.response);
    
        const record = _xyz.locations.listview.getFreeRecord();

        if (!record) return;

        record.location = {
          geometry: JSON.parse(json.geomj),
          infoj: json.infoj,
          layer: layer.key,
          marker: _xyz.utils.turf.pointOnFeature(JSON.parse(json.geomj)).geometry.coordinates,
          style: {
            color: record.color,
            letter: record.letter,
            stroke: true,
            fill: true,
            fillOpacity: 0
          }
        };

        // Draw the record to the map.
        record.location.draw();

        // List the record
        _xyz.locations.listview.add(record);

      };
    
      xhr.send();
    }
  }
});