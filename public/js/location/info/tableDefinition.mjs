export default (_xyz, record, entry) => {

  //console.log(record);
  //console.log(entry);

  let tr = _xyz.utils.createElement({ tag: 'tr', appendTo: record.table });

  let td = _xyz.utils.createElement({ tag: 'td', style: {'paddingTop': '5px'}, appendTo: tr });

  _xyz.utils.createCheckbox({
    label: entry.title || 'Show table',
    appendTo: td,
    checked: !!entry.value,
    onChange: e => {
    	e.target.checked ?  showTab(record, entry) : hideTab(record, entry);
    }
  });

  function showTab(record, entry){
  	_xyz.tableview.locationTable({
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