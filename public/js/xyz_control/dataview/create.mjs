import assignBtn from './assignBtn.mjs';

export default _xyz => params => {

  if (!params.target) return;

  _xyz.dataview.tables = [];

 
  // Set dataview node.
  _xyz.dataview.node = params.target;

  // Redraw current table
  _xyz.mapview.node.addEventListener('updatesize', ()=>{
    _xyz.dataview.current_table && _xyz.dataview.current_table.Tabulator && _xyz.dataview.current_table.Tabulator.redraw(true);
  });

   
  // Load locale if defined in params or if no locale is yet loaded.
  if (!_xyz.workspace.locale || params.locale) _xyz.workspace.loadLocale(params);
                
      
  _xyz.dataview.nav_bar = _xyz.dataview.node.querySelector('.nav_bar > ul.nav_bar-nav');
  _xyz.dataview.nav_dropdown = _xyz.dataview.node.querySelector('.nav_bar .tab-dropdown-content ul'); 
  _xyz.dataview.nav_dropdown_content = _xyz.dataview.node.querySelector('.nav_bar .tab-dropdown-content');
  _xyz.dataview.nav_dropdown_btn = _xyz.dataview.node.querySelector('.nav_bar .tab-dropdown');

  _xyz.dataview.nav_bar.innerHTML = '';

  _xyz.dataview.btn = assignBtn(_xyz, params);


  if (_xyz.mapview.node) {

    _xyz.mapview.node.addEventListener('changeEnd', ()=>{
      _xyz.dataview.current_table &&
      _xyz.dataview.current_table.viewport &&
      _xyz.dataview.current_table.update();
    });

  }


  // Show or hide dropdown with collapsed tabs
  _xyz.dataview.nav_dropdown_btn.addEventListener('click', e => {
    _xyz.dataview.nav_dropdown_content.classList.toggle('show');
  });

  _xyz.dataview.resizeObserve();
     
};