export default (_xyz, params) => {

  if (!params.btn) return;

  if (params.btn.dataViewport) {
    params.btn.dataViewport.onclick = () => {
    
      _xyz.dataview.current_table.viewport = !_xyz.dataview.current_table.viewport;

      if (_xyz.dataview.current_table.viewport) {
        params.btn.dataViewport.classList.add('active');

      } else {
        params.btn.dataViewport.classList.remove('active');
      }

      _xyz.dataview.current_table.update();
    
    };
  }

  return {
    toggleDataview: toggleDataview(params),
    dataViewport: params.btn.dataViewport,
  };

  function toggleDataview(params) {

    if (!params.btn.toggleDataview) return;
  
    params.btn.toggleDataview.onclick = () => {
  
      if (params.btn.toggleDataview.classList.contains('icon-vertical-align-bottom')) {

        params.btn.toggleDataview.className = 'xyz-icon icon-vertical-align-top';
        document.body.style.gridTemplateRows = 'minmax(0, 1fr) 40px';
        _xyz.map.updateSize();
        return;
  
      }
  
      params.btn.toggleDataview.className = 'xyz-icon icon-vertical-align-bottom';

      document.body.style.gridTemplateRows = `minmax(0, 1fr) ${window.innerHeight}px`;

      if(_xyz.dataview.current_table.Tabulator) _xyz.dataview.current_table.Tabulator.redraw(true);

      _xyz.map.updateSize();

    };

  }

};