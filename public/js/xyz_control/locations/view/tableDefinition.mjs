export default _xyz => entry => {

  entry.row.classList.add('tr_tableview');

  const td = _xyz.utils.hyperHTML.wire()`<td colspan=2 style="padding-top: 5px;">`;

  entry.row.appendChild(td);

  _xyz.utils.createCheckbox({
    label: entry.title || 'Show table',
    appendTo: td,
    checked: !!entry.display,
    onChange: e => {

      entry.display = e.target.checked;
		
      e.target.checked ?
        showTab() :
        _xyz.tableview.removeTab(entry);
        
    }
  });

  if (entry.display && _xyz.tableview.node) showTab();

  function showTab(){

    entry.location.tables.push(entry);

    entry.target = _xyz.tableview.node.querySelector('.table');

  	_xyz.tableview.locationTable(entry);
	  
  }

};