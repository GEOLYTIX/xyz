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

  find.addEventListener('click', () => {
    _xyz.gazetteer.search(input.value, {
      source: 'GOOGLE',
      callback: json => {
        if (json.length === 0) return alert('No results for this search.');
        _xyz.gazetteer.select(json[0]);
      }
    });
  });

  input.addEventListener('keydown', e => {
    let key = e.keyCode || e.charCode;
    if(key === 13) _xyz.gazetteer.search(input.value, {
      source: 'GOOGLE',
      callback: json => {
        if (json.length === 0) return alert('No results for this search.');
        _xyz.gazetteer.select(json[0]);
      }
    });
  });

}
