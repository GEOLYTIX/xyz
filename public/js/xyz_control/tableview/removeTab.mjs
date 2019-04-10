export default _xyz => table => {

  if (table.tab) {
    table.tab.remove();
  } else {
    table.target.innerHTML = '';
  }

  let idx = _xyz.tableview.tables.indexOf(table);

  if (idx < 0) return;
  
  _xyz.tableview.tables.splice(idx, 1);

  _xyz.tableview.current_table = null;

  if(idx <= _xyz.tableview.max_tabs && _xyz.tableview.nav_dropdown.firstChild) _xyz.tableview.nav_bar.appendChild(_xyz.tableview.nav_dropdown.firstChild);

  if(!_xyz.tableview.nav_dropdown.firstChild) _xyz.tableview.nav_dropdown_btn.style.display = 'none';

  if (_xyz.tableview.node && _xyz.tableview.tables.length > 0) {

    Object
      .values(_xyz.tableview.nav_bar.children)
      .forEach(tab => tab.classList.remove('tab-current'));
      
      let nodes = document.querySelectorAll('#tableview ul.nav_bar-nav li');
      nodes[nodes.length-1].classList.add('tab-current');
      return _xyz.tableview.tables[nodes.length-1].activate();

  }

  if (_xyz.tableview.node) {
    _xyz.tableview.node.style.display = 'none';
    _xyz.mapview.node.style.height = '100%';
  }

};