export default _xyz => entry => {

  let td = _xyz.utils.createElement({
	  tag: 'td',
	  style: { paddingTop: '5px' },
	  options: { colSpan: '2' },
	  appendTo: entry.row
  });

  _xyz.utils.createCheckbox({
    label: entry.title || 'Show table',
    appendTo: td,
    checked: !!entry.display,
    onChange: e => {

      entry.display = e.target.checked;
		
      e.target.checked ?  showTab() : hideTab();
    }
  });

  if (entry.display) showTab();

  function showTab(){

  	_xyz.tableview.locationTable({
  		target: _xyz.tableview.node.querySelector('.table'),
  		table: entry
    });
	  
  }
  
  function hideTab(){
  	
  	_xyz.tableview.removeTab({ table: entry });

  }

};