export default _xyz => entry => {

  let td = _xyz.utils.createElement({
    tag: 'td',
    style: { 
      paddingTop: '5px'
    },
    options: { 
      colSpan: '2',
      classList: entry.class || ''
    },
    appendTo: entry.row
  });

  entry.checkbox = _xyz.utils.createCheckbox({
    	label: entry.title || 'Show dashboard',
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
      //console.log(entry.target);
      //console.log(_xyz.tableview.node);
      //console.log(_xyz.tableview.node.querySelector('.table'));
      //console.log(_xyz.tableview.node && _xyz.tableview.node.querySelector('.table'));
    	//entry.target = _xyz.tableview.node && _xyz.tableview.node.querySelector('.table') || document.getElementById(entry.target_id);
      entry.target = _xyz.tableview.node && _xyz.tableview.node.querySelector('.tab-content') || document.getElementById(entry.target_id);
      //console.log(entry.target);
      //console.log(entry.target);
    	if (entry.target) _xyz.tableview.dashboard(entry);

      //console.log(entry.location);
  }

  function removeTab() {

    	let idx = entry.location.tables.indexOf(entry);

    	if (idx < 0) return;

    	entry.location.tables.splice(idx, 1);

    	_xyz.tableview.removeTab(entry);
  }
};