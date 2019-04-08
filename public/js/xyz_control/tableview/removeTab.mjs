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


  if(document.querySelectorAll('#tableview ul.nav_bar-nav li').length < _xyz.tableview.max_tabs){
    console.log(document.querySelectorAll('#tableview ul.nav_bar-nav li').length);
    console.log(_xyz.tableview.tables.length);
    console.log('unfold a tab!');
    
    if(_xyz.tableview.nav_dropdown.firstChild){
      _xyz.tableview.nav_dropdown.firstChild.classList.remove('folded');
      _xyz.tableview.nav_bar.appendChild(_xyz.tableview.nav_dropdown.firstChild);
    }
  }

  if (_xyz.tableview.node && _xyz.tableview.tables.length > 0) {

  	document.querySelectorAll('#tableview li')[_xyz.tableview.tables.length-1].classList.add('tab-current');
  	return _xyz.tableview.tables[_xyz.tableview.tables.length-1].activate();
  }

  if (_xyz.tableview.node) {
    _xyz.tableview.node.style.display = 'none';
    _xyz.mapview.node.style.height = '100%';
  }

};