export default _xyz => params => {

  //console.log(params);
  console.log('hello location table');


	  if (!params.target) return;

	  if (_xyz.tableview.node) _xyz.tableview.node.style.display = 'block';

	  _xyz.tableview.table = params.target;

	  if (!params.record) return;

	  _xyz.tableview.current_layer = params.record.location.layer;

	  if (!params.table) return;

	  params.table.columns.forEach(col => {
	  	
	  	/*col.title = col.title || col.field;
	  	
	  	if(col.type === 'date') col.formatter = _xyz.utils.formatDate;
	  	if(col.type === 'datetime') col.formatter = _xyz.utils.formatDateTime;*/

	  	params.table.rows.forEach(row => {
	  		console.log({col: col, row: row});
	  	});

  });

	  params.table.update = () => {

	  	const xhr = new XMLHttpRequest();

	  	xhr.open('GET', _xyz.host + '/api/location/table?' + _xyz.utils.paramString({
	  		// here parameters that need to be sent to location_table endpoint
	  		// turned into query on server side
	  		// sent back and visualized
	  		locale: _xyz.workspace.locale.key,
	  		layer: params.record.location.layer.key,
	  		table: params.record.location.layer.tableMax(),
	  		id: record.location.id,
	  		token: _xyz.token
	  	}));

	  	xhr.setRequestHeader('Content-Type', 'application/json');
	  	xhr.responseType = 'json';

	  	xhr.onload = e => {
	  		if (e.target.status !== 200) return;

	  		console.log(e.response);
	  	};

	  	xhr.send();

	  };

};