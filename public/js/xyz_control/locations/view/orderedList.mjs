export default _xyz => entry => {

  let td = _xyz.utils.createElement({
    tag: 'td',
    style: { paddingTop: '5px' },
    options: { colSpan: '2' },
    appendTo: entry.row
  });

  entry.checkbox = _xyz.utils.createCheckbox({
    	label: entry.title || 'Show table',
    	appendTo: td,
    	checked: !!entry.display,
    	onChange: e => {
    		entry.display = e.target.checked;

    		entry.display ? showTab() : removeTab();
    	}
  });

  if (entry.display) showTab();

    
  function showTab() {

    entry.location.tables.push(entry);

    entry.target = _xyz.tableview.node && _xyz.tableview.node.querySelector('.table') || document.getElementById(entry.target_id);

    if (entry.target) _xyz.tableview.orderedList(entry);
  
  }

  function removeTab() {

    	let idx = entry.location.tables.indexOf(entry);

    	if (idx < 0) return;

    	entry.location.tables.splice(idx, 1);

    	_xyz.tableview.removeTab(entry);
  }
};