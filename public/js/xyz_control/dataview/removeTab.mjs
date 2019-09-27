export default _xyz => table => {

  if (table.tab) {
    table.tab.remove();
  } else {
    table.target.innerHTML = '';
  }

  let idx = _xyz.dataview.tables.indexOf(table);

  if (idx < 0) return;
  
  _xyz.dataview.tables.splice(idx, 1);

  _xyz.dataview.current_table = null;

  if(idx <= _xyz.dataview.max_tabs && _xyz.dataview.nav_dropdown.firstChild) _xyz.dataview.nav_bar.appendChild(_xyz.dataview.nav_dropdown.firstChild);

  if (_xyz.dataview.nav_dropdown && !_xyz.dataview.nav_dropdown.firstChild) _xyz.dataview.nav_dropdown_btn.style.display = 'none';

  if (_xyz.dataview.node && _xyz.dataview.tables.length > 0) {

    Object
      .values(_xyz.dataview.nav_bar.children)
      .forEach(tab => tab.classList.remove('tab-current'));
      
    const nodes = document.querySelectorAll('#dataview ul.nav_bar-nav li');

    nodes[nodes.length-1].classList.add('tab-current');

    return _xyz.dataview.tables[nodes.length-1].activate();

  }

  document.body.style.gridTemplateRows = 'minmax(0, 1fr) 0';

};