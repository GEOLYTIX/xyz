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

  if (_xyz.tableview.node && _xyz.tableview.tables.length > 0) {
  	document.querySelectorAll('#tableview li')[_xyz.tableview.tables.length-1].classList.add('tab-current');
  	return _xyz.tableview.tables[_xyz.tableview.tables.length-1].activate();
  }

  if (_xyz.tableview.node) {
    _xyz.tableview.node.style.display = 'none';
    _xyz.mapview.node.style.height = '100%';
  }

};