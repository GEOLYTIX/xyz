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
    console.log('test0')

    if (!params.btn.toggleDataview) return;
  
    console.log('test1')

    params.btn.toggleDataview.onclick = () => {
  
      if (params.btn.toggleDataview.classList.contains('icons-vertical-align-bottom')) {
        console.log('test2');

        params.btn.toggleDataview.className = 'icons-vertical-align-top';
        document.body.style.gridTemplateRows = 'minmax(0, 1fr) 40px';
        _xyz.map.updateSize();
        return;
  
      }
  

      params.btn.toggleDataview.className = 'icons-vertical-align-bottom';
      console.log('test3');


      document.body.style.gridTemplateRows = `minmax(0, 1fr) ${window.innerHeight}px`;

      if(_xyz.dataview.current_table.Tabulator) _xyz.dataview.current_table.Tabulator.redraw(true);
      console.log('test');


      _xyz.map.updateSize();

    };

  }

};