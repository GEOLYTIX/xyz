export default (_xyz, params) => {

  if (!params.btn) return;

  if (params.btn.tableViewport) {
    params.btn.tableViewport.onclick = () => {
    
      _xyz.tableview.current_table.viewport = !_xyz.tableview.current_table.viewport;

      if (_xyz.tableview.current_table.viewport) {
        params.btn.tableViewport.classList.add('active');

      } else {
        params.btn.tableViewport.classList.remove('active');
      }

      _xyz.tableview.current_table.update();
    
    };
  }

  return {
    toggleTableview: toggleTableview(params),
    tableViewport: params.btn.tableViewport,
  };

  function toggleTableview(params) {

    if (!params.btn.toggleTableview) return;

    params.btn.toggleTableview.onclick = () => {
  
      if (params.btn.toggleTableview.textContent === 'vertical_align_bottom') {
  
        params.btn.toggleTableview.textContent = 'vertical_align_top';
        document.body.style.gridTemplateRows = 'minmax(0, 1fr) 40px';
        _xyz.map.updateSize();
        return;
  
      }
  
      params.btn.toggleTableview.textContent = 'vertical_align_bottom';

      document.body.style.gridTemplateRows = `minmax(0, 1fr) ${window.innerHeight}px`;

      _xyz.tableview.current_table.Tabulator.redraw(true);

      _xyz.map.updateSize();

    };

  }

};