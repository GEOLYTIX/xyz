export default _xyz => params => {

  params.table.tab.remove();

  let idx = _xyz.tableview.tables.indexOf(params.table);

  _xyz.tableview.tables.splice(idx, 1);

  _xyz.tableview.current_table = null;

  if (_xyz.tableview.tables.length > 0) {
  	if(_xyz.tableview.nav_bar.children) {
  		_xyz.tableview.nav_bar.children[_xyz.tableview.tables.length-1].classList.add('tab-current');
  	}
  	return _xyz.tableview.tables[_xyz.tableview.tables.length-1].activate();
  }

  if (_xyz.tableview.node) {
    _xyz.tableview.node.style.display = 'none';
    _xyz.mapview.node.style.height = '100%';
  }

};