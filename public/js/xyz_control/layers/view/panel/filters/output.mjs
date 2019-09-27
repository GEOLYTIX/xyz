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
    
        _xyz.locations.select({
          _new: true,
          geometry: JSON.parse(e.target.response.geomj),
          infoj: e.target.response.infoj,
          layer: layer,
        });

      };
    
      xhr.send();
    }
  }
});