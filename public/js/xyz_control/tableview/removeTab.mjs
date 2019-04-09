export default _xyz => table => {

  if (table.tab) {
    table.tab.remove();
  } else {
    table.target.innerHTML = '';
  }

  console.log("hi i'm a remove tab " + table.title);

  let idx = _xyz.tableview.tables.indexOf(table);

  if (idx < 0) return;
  
  _xyz.tableview.tables.splice(idx, 1);

  _xyz.tableview.current_table = null;


  if(document.querySelectorAll('#tableview ul.nav_bar-nav li').length <= _xyz.tableview.max_tabs){

    if(!_xyz.tableview.nav_dropdown.firstChild) _xyz.tableview.nav_dropdown_btn.style.display = 'none';
  
  }

  if (_xyz.tableview.node && _xyz.tableview.tables.length > 0) {

    Object
      .values(_xyz.tableview.nav_bar.children)
      .forEach(tab => tab.classList.remove('tab-current'));

      document.querySelectorAll('#tableview ul.nav_bar-nav li')[_xyz.tableview.max_tabs-1].classList.add('tab-current');
      return _xyz.tableview.tables[_xyz.tableview.max_tabs-1].activate();
  }

  if (_xyz.tableview.node) {
    _xyz.tableview.node.style.display = 'none';
    _xyz.mapview.node.style.height = '100%';
  }

};