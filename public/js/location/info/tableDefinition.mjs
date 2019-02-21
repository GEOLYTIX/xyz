export default (_xyz, record, entry) => {

  let tr = _xyz.utils.createElement({ tag: 'tr', appendTo: record.table });

  let td = _xyz.utils.createElement({ tag: 'td', style: {'paddingTop': '5px'}, appendTo: tr });


  _xyz.utils.createCheckbox({
    label: entry.title || 'Show table',
    appendTo: td,
    checked: !!entry.checked,
    onChange: e => {
    	e.target.checked ?  showTab(record, entry) : hideTab(record, entry);
    }
  });

  function showTab(record, entry){
  	_xyz.tableview.current_table = entry;

  	entry.target = _xyz.tableview.locationTable({
  		target: _xyz.tableview.node.querySelector('.table'),
  		record: record,
  		table: entry
  	});
  }
  
  function hideTab(record, entry){
  	
  	_xyz.tableview.removeTab({
  		record: record,
  		table: entry
  	});

  }

};