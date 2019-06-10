import assignBtn from './assignBtn.mjs';

export default _xyz => params => {

  if (!params.target) return;

  _xyz.tableview.tables = [];

 
  // Set tableview node.
  _xyz.tableview.node = params.target;

   
  // Load locale if defined in params or if no locale is yet loaded.
  if (!_xyz.workspace.locale || params.locale) _xyz.workspace.loadLocale(params);
                
      
  _xyz.tableview.nav_bar = _xyz.tableview.node.querySelector('.nav_bar > ul.nav_bar-nav');
  _xyz.tableview.nav_dropdown = _xyz.tableview.node.querySelector('.nav_bar .tab-dropdown-content ul'); 
  _xyz.tableview.nav_dropdown_content = _xyz.tableview.node.querySelector('.nav_bar .tab-dropdown-content');
  _xyz.tableview.nav_dropdown_btn = _xyz.tableview.node.querySelector('.nav_bar .tab-dropdown');

  _xyz.tableview.nav_bar.innerHTML = '';

  _xyz.tableview.btn = assignBtn(_xyz, params);


  if (_xyz.mapview.node) {

    _xyz.mapview.node.addEventListener('changeEnd', ()=>{
      _xyz.tableview.current_table &&
      _xyz.tableview.current_table.viewport &&
      _xyz.tableview.current_table.update();
    });

  }


  // Show or hide dropdown with collapsed tabs
  _xyz.tableview.nav_dropdown_btn.addEventListener('click', e => {
    _xyz.tableview.nav_dropdown_content.classList.toggle('show');
  });

  _xyz.tableview.resizeObserve();
     
};