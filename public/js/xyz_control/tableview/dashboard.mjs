export default _xyz => (entry, callback) => {

  console.log(entry);

  if (!entry || !entry.location) return;

  if (_xyz.tableview.node) {
    // _xyz.tableview.node.style.display = 'block';
    //_xyz.mapview.node.style.height = 'calc(100% - 40px)';
    document.body.style.gridTemplateRows = 'minmax(0, 1fr) 40px';

  }

  if (_xyz.tableview.tables.indexOf(entry) < 0) _xyz.tableview.tables.push(entry);

  if (_xyz.tableview.nav_bar) _xyz.tableview.addTab(entry);

  entry.update = () => {

    entry.target.innerHTML = '';

    //console.log('update dashboard');
    let flex_container = _xyz.utils.createElement({
      tag: 'div',
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        position: 'relative'/*,
        backgroundColor: 'steelblue' */
      },
      appendTo: entry.target
    });

    Object.values(entry.location.infoj).map(val => {

      if(val.type === 'group' && val.chart && val.dashboard){

        entry.group = Object.assign({}, val);

        let container = _xyz.utils.createElement({
          tag: 'div',
          style: {
          backgroundColor: 'white',
          /*width: '48%',
          margin: '1%',*/
          width: '450px',
          height: '300px',
          margin: '10px'/*,
          border: 'dashed 1px red',*/
          },
          appendTo: flex_container
        });

        //console.log(val);
        entry.group.fields = entry.location.infoj.filter(_entry => _entry.group === entry.group.label);

        //flex_container.appendChild(val.chartElem);
        let chartElem = _xyz.utils.chart(entry.group);
        //console.log(entry.group);

        container.appendChild(chartElem);

      }
    });


    /*for(let i = 1; i < 18; i++){
      _xyz.utils.createElement({
        tag: 'div',
        style: {
          backgroundColor: 'white',
          /*width: '48%',
          margin: '1%',*/
          /*width: '450px',
          margin: '10px',
          border: 'dashed 1px red',
          textAlign: 'center',
          lineHeight: '75px',
          fontSize: '30px'
        },
        options: {
          textContent: i
        },
        appendTo: flex_container
      });
    }*/

  	/*const xhr = new XMLHttpRequest();

  	xhr.open('GET', _xyz.host + '/api/location/list?' + _xyz.utils.paramString({
      locale: _xyz.workspace.locale.key,
      layer: table.location.layer,
      table: _xyz.workspace.locale.layers[table.location.layer].tables ? _xyz.workspace.locale.layers[table.location.layer].tableMax() : null,
      id: table.location.id,
      tableDef: table.title,
      token: _xyz.token
    }));

    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = 'json';

    xhr.onload = e => {
      if (e.target.status !== 200) return;

      table.Tabulator.setData(e.target.response);
      table.Tabulator.redraw(true);
      if (callback) callback(e.target.response);
    };

    xhr.send();*/
    //table.target.textContent = 'Hi I am a dashboard';

  };

  entry.activate = () => {

    console.log('activate dashboard');

    //table.target.textContent = 'Hi I am a dashboard';

    /*table.Tabulator = new _xyz.utils.Tabulator(
      table.target, {
        columns: columns,
        // autoResize: true,
        layout: 'fitDataFill',
        height: 'auto'
      });*/

    entry.update();

    _xyz.tableview.current_table = entry;

  };

  // active only if displayed in the navbar 
  if(!entry.tab || !entry.tab.classList.contains('folded')) entry.activate();

};