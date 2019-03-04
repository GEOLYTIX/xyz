export default _xyz => (entry) => {

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
		
      e.target.checked ?
        showTab() : hideTab();
        
    }
  });

  if (entry.display) showTab();

  function showTab(){

    entry.location.tables.push(entry);

    entry.target = _xyz.tableview.node.querySelector('.table');

  	_xyz.tableview.locationTable(entry);
	  
  }

  function hideTab(){
    _xyz.tableview.removeTab(entry);
    if(entry.chart && entry.chart.tr) entry.location.view.node.removeChild(entry.chart.tr);
  }

};