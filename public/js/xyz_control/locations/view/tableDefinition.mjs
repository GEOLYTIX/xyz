export default _xyz => entry => {

//   let tr = _xyz.utils.createElement({ tag: 'tr', appendTo: entry.row });

  let td = _xyz.utils.createElement({
	  tag: 'td',
	  style: {'paddingTop': '5px'},
	  appendTo: entry.row
  });

  _xyz.utils.createCheckbox({
    label: entry.title || 'Show table',
    appendTo: td,
    checked: !!entry.checked,
    onChange: e => {
    	e.target.checked ?  showTab() : hideTab();
    }
  });

  function showTab(){

  	_xyz.tableview.current_table = entry;

  	if(_xyz.tableview.tables){
  		let tabs = document.querySelectorAll('#tableview li');
  		tabs.forEach(tab => {
  			if(tab.textContent === entry.title) tab.classList.add('tab-current');
  		});
  	}

  	entry.target = _xyz.tableview.locationTable({
  		target: _xyz.tableview.node.querySelector('.table'),
  		location: entry.location,
  		table: entry
  	});
  }
  
  function hideTab(){
  	
  	_xyz.tableview.removeTab({
  		location: entry.location,
  		table: entry
  	});

  }

};