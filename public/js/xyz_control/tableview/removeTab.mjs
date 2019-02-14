export default _xyz => params => {

  params.table.tab.remove();

  let idx = _xyz.tableview.tables.indexOf(params.table);

  _xyz.tableview.tables.splice(idx, 1);

  if (_xyz.tableview.tables.length > 0) return _xyz.tableview.tables[_xyz.tableview.tables.length -1].activate();

  if (_xyz.tableview.node) {
    _xyz.tableview.node.style.display = 'none';
    _xyz.mapview.node.style.height = '100%';
  }

};