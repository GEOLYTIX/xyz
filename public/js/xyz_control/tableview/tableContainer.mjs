export default _xyz => (show_toolbars) => {

  if(_xyz.tableview.node) _xyz.tableview.node.querySelector('.tab-content').innerHTML = '';

  if(show_toolbars){
  	
  	let toolbar = _xyz.utils.createElement({
  		tag: 'div',
  		style: {
  			marginRight: '10px',
  			textAlign: 'right'
  		},
  		appendTo: _xyz.tableview.node.querySelector('.tab-content')
  	});

  	_xyz.utils.createElement({
  		tag: 'div',
  		options: {
  			classList: "btn_subtext",
  			textContent: "CSV",
  			title: "Download as CSV"
  		},
  		style: {
  			cursor: 'pointer',
  			display: "inline-block",
  			marginRight: '6px'
  		},
  		eventListener: {
  			event: 'click',
  			funct: () => {
  				_xyz.tableview.current_table.Tabulator.download("csv", `${_xyz.tableview.current_table.title}.csv`);
  			}
  		},
  		appendTo: toolbar
  	});

  	 _xyz.utils.createElement({
  		tag: 'div',
  		options: {
  			classList: "btn_subtext",
  			textContent: "JSON",
  			title: "Download as JSON"
  		},
  		style: {
  			cursor: 'pointer',
  			display: "inline-block",
  			marginRight: '6px'
  		},
  		eventListener: {
  			event: 'click',
  			funct: () => {
  				_xyz.tableview.current_table.Tabulator.download("json", `${_xyz.tableview.current_table.title}.json`);
  			}
  		},
  		appendTo: toolbar
  	});

  	}

  return _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'table'
    },
    appendTo: _xyz.tableview.node.querySelector('.tab-content')
  });

};