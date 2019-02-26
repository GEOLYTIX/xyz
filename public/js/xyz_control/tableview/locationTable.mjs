export default _xyz => params => {


	  if (!params.target) return;

	  if (_xyz.tableview.node) {
	  	_xyz.tableview.node.style.display = 'block';
	  	_xyz.mapview.node.style.height = 'calc(100% - 40px)';
	  }

	  _xyz.tableview.table = params.target;

	  if (!params.record) return;

	  _xyz.tableview.current_layer = params.record.location.layer;

	  if (!params.table) return;


	  function formatColumns(params){
	  	let columns = [{'field': 'rows', 'title': params.table.title}];

	  	params.table.columns.map(col => {
	  		if(!col.aspatial) columns.push({'field': col.field, 'title': (col.label ? col.label : col.field)});
	  	});

	  	if(params.table.agg){
	  		Object.keys(params.table.agg).map(key => {
	  			columns.push({'field': key, 'title': params.table.agg[key].label || key});
	  		});
	  	}
	  	return columns;
	  }

	  function formatRows(params, json){
	  	for(let i = 0; i < json.length; i++){
	  		if(params.table.rows[i].label) json[i].rows = params.table.rows[i].label;
	  	}
	  	return json;
	  }


  params.table.update = () => {

    const xhr = new XMLHttpRequest();

    xhr.open('GET', _xyz.host + '/api/location/table?' + _xyz.utils.paramString({

	  		locale: _xyz.workspace.locale.key,
	  		layer: params.record.location.layer,
	  		id: params.record.location.id,
	  		token: _xyz.token,
	  		tableDef: encodeURIComponent(params.table.title)
	  	}));
  
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = 'json';
    
    xhr.onload = e => {
    
      if (e.target.status !== 200) return;
      
      params.table.Tabulator.setData(formatRows(params, e.target.response));
  
      params.table.Tabulator.redraw(true);
  
    };
  
    xhr.send();

  };

  params.table.activate = () => {

    params.table.Tabulator =
    new _xyz.utils.Tabulator(_xyz.tableview.table, {
      columns: formatColumns(params),
      autoResize: true,
      height: _xyz.tableview.height || '100%'
    });

    params.table.update();

    _xyz.tableview.current_table = params.table;

  };

  params.table.activate();

  if(!params.table.checked) {

  	if (_xyz.tableview.tables) _xyz.tableview.tables.push(params.table);
  	if (_xyz.tableview.nav_bar) _xyz.tableview.addTab(params);
  
  }

};