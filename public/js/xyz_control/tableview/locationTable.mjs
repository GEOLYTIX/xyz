export default _xyz => params => {

  //console.log(params);

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

};