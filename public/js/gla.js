_xyz({
  host: document.head.dataset.dir,
  //hooks: true,
  callback: _xyz => {

    _xyz.mapview.create({
      target: document.getElementById('Map'),
      scrollWheelZoom: true,
      btn: {
        Locate: document.getElementById('btnLocate'),
      }
    });

    _xyz.locations.select = location => gla_select(_xyz, location);

    const layer = _xyz.layers.list['Advice Center'];

    layer.filter.current = {};

    const tableShow = () => _xyz.tableview.layerTable({
      layer: layer,
      target: document.getElementById('List'),
      key: 'gla',
      visible: ['organisation_short'],
      groupBy: 'borough',
      initialSort: [
        {
          column: 'organisation_short', dir: 'asc'
        },
        {
          column: 'borough', dir: 'asc'
        }
      ],
      groupStartOpen: false,
      groupToggleElement: 'header',
      rowClick: (e, row) => {
        const rowData = row.getData();

        if (!rowData.qid) return;

        _xyz.locations.select({
          locale: _xyz.workspace.locale.key,
          layer: layer.key,
          table: layer.table,
          id: rowData.qid,
        });
      }
    });

    tableShow();

    _xyz.utils.dropdownCustom({
      appendTo: document.getElementById('select-borough'),
      placeholder: 'Search by the borough where you live or work',
      field: 'borough',
      entries: [
        'Show all boroughs',
        'Barking and Dagenham',
        'Barnet',
        'Bexley',
        'Brent',
        'Bromley',
        'Camden',
        'City of London',
        'Croydon',
        'Ealing',
        'Enfield',
        'Greenwich',
        'Hackney',
        'Hammersmith and Fulham',
        'Haringey',
        'Harrow',
        'Havering',
        'Hillingdon',
        'Hounslow',
        'Islington',
        'Kensington and Chelsea',
        'Kingston upon Thames',
        'Lambeth',
        'Lewisham',
        'Merton',
        'Newham',
        'Redbridge',
        'Richmond-upon-Thames',
        'Southwark',
        'Sutton',
        'Tower Hamlets',
        'Wandsworth',
        'Westminster'
      ],
      callback: e => {
        e.stopPropagation();
        if(e.target.textContent === 'Show all boroughs') {
          delete layer.filter.current[e.target.parentNode.previousSibling.dataset.field];
          layer.zoomToExtent();
          tableShow();
          return;
        }
        layer.filter.current[e.target.parentNode.previousSibling.dataset.field] = {};
        layer.filter.current[e.target.parentNode.previousSibling.dataset.field].match = e.target.textContent;
        layer.zoomToExtent();
        tableShow();
      }
    });

    _xyz.utils.dropdownCustom({
      appendTo: document.getElementById('select-advice'),
      placeholder: 'Search by type of advice/support',
      field: 'advice',
      entries: [
        { 'all': 'Show all' }, 
        { 'service_initial_advice': 'Initial Advice' },
        { 'service_written_advice': 'Written Advice' },
        { 'service_form_filling': 'Form Filling' },
        { 'service_case_work': 'Casework' },
        { 'service_representation': 'Representation' }
      ],
      callback: (e) => {
        e.stopPropagation();
        // Reset previous boolean filters
        Object.keys(layer.filter.current).map(key => {
          if(layer.filter.current[key].boolean){
            delete layer.filter.current[key];
            layer.zoomToExtent();
            tableShow();
          }
        });

        if(e.target.textContent === 'Show all'){
          delete layer.filter.current[e.target.dataset.field];
          layer.zoomToExtent();
          tableShow();
          return;
        }

        layer.filter.current[e.target.dataset.field] = {};
        layer.filter.current[e.target.dataset.field]['boolean'] = true;
        layer.zoomToExtent();
        tableShow();
      }
    });

    searchPostcode(_xyz);
  }
});



function searchPostcode(_xyz){

  const input = document.querySelector('#postcode-search input');

  const find = document.querySelector('#postcode-find');
  
  input.addEventListener('focus', e => {
    document.getElementById('postcode-find').classList.remove('darkish');
    document.getElementById('postcode-find').classList.add('pink-bg');
    e.target.parentNode.classList.add('pink-br');
  });

  input.addEventListener('blur', e => {
    document.getElementById('postcode-find').classList.add('darkish');
    document.getElementById('postcode-find').classList.remove('pink-bg');
    e.target.parentNode.classList.remove('pink-br');
  });

  find.addEventListener('click', () => search());

  input.addEventListener('keydown', e => {
    let key = e.keyCode || e.charCode;
    if(key === 13) search();
  });

  function search(){

    // Create abortable xhr.
    _xyz.gazetteer.xhr = new XMLHttpRequest();

    if (_xyz.gazetteer.xhr) _xyz.gazetteer.xhr.abort();

    // Send gazetteer query to backend.
    _xyz.gazetteer.xhr.open('GET',
      _xyz.host +
      '/api/gazetteer/autocomplete?' +
      _xyz.utils.paramString({
        locale: _xyz.workspace.locale.key,
        source: 'GOOGLE',
        q: encodeURIComponent(input.value)
      }));

    _xyz.gazetteer.xhr.setRequestHeader('Content-Type', 'application/json');

    _xyz.gazetteer.xhr.responseType = 'json';

    _xyz.gazetteer.xhr.onload = e => {

      // List results or show that no results were found
      if (e.target.status !== 200) return;

      // Parse the response as JSON and check for results length.
      const json = e.target.response;

      if (json.length === 0) {
        alert('No results for this search.');
        return;
      }

      const xhr = new XMLHttpRequest();

      xhr.open('GET', _xyz.host + `/api/gazetteer/googleplaces?id=${json[0].id}`);

      xhr.responseType = 'json';

      xhr.onload = e => {
        if (e.target.status === 200) _xyz.gazetteer.createFeature(e.target.response);
      };

      xhr.send();
    };

    _xyz.gazetteer.xhr.send();
  }

}

function toLayerExtent(_xyz, layer){

  const xhr = new XMLHttpRequest();

  xhr.open('GET', _xyz.host + '/api/layer/extent?' + _xyz.utils.paramString({
    locale: _xyz.workspace.locale.key,
    layer: layer.key,
    filter: JSON.stringify(layer.filter.current),
    token: _xyz.token
  }));

  xhr.onload = e => {
    if (e.target.status !== 200) return;

    // Show the layer on map.
    layer.show();

    // Split the bounds from response.
    const bounds = e.target.responseText.split(',');

    const fGroup = [_xyz.L.polygon([
      [bounds[1], bounds[0]],
      [bounds[1], bounds[2]],
      [bounds[3], bounds[2]],
      [bounds[3], bounds[0]],
    ])];

    //if (_xyz.mapview && _xyz.mapview.locate && _xyz.mapview.locate.active) fGroup.push(_xyz.mapview.locate.L);

    // Fly to the bounds.
    _xyz.map.flyToBounds(_xyz.L.featureGroup(fGroup).getBounds(),{
      padding: [25, 25]
    });
    
  };

  xhr.send();
}



