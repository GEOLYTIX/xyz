_xyz({
  host: document.head.dataset.dir,
  //hooks: true,
  callback: _xyz => {
  
    _xyz.mapview.create({
      target: document.getElementById('Map'),
      scrollWheelZoom: true,
      zoomControl: true,
      btn: {
        Locate: document.getElementById('btnLocate'),
      }
    });
  
    _xyz.locations.select = location => gla_select(_xyz, location);
  
    const layer = _xyz.layers.list['Advice Center'];
  
    layer.filter.current = {};
  
    const table = _xyz.tableview.layerTable({
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
        _xyz.locations.select({
          locale: _xyz.workspace.locale.key,
          layer: layer.key,
          table: layer.table,
          id: row.getData().qid,
          _flyTo: true,
        });
      }
    });

 
    _xyz.utils.dropdownCustom({
      appendTo: document.getElementById('select-borough'),
      placeholder: 'Filter by borough',
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
          return table.update();
        }

        layer.filter.current[e.target.parentNode.previousSibling.dataset.field] = {};
        layer.filter.current[e.target.parentNode.previousSibling.dataset.field].match = e.target.textContent;
        layer.zoomToExtent();
        table.update();
      }
    });
  
    _xyz.utils.dropdownCustom({
      appendTo: document.getElementById('select-advice'),
      placeholder: 'Filter by service',
      field: 'advice',
      entries: [
        { 'all': 'Show all services' }, 
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
            table.update();
          }
        });
  
        if(e.target.textContent === 'Show all services'){
          delete layer.filter.current[e.target.dataset.field];
          layer.zoomToExtent();
          return table.update();
        }
  
        layer.filter.current[e.target.dataset.field] = {};
        layer.filter.current[e.target.dataset.field]['boolean'] = true;
        layer.zoomToExtent();
        table.update();
      }
    });
  

    // Gazetteer
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
      _xyz.gazetteer.search(input.value,
        {
          source: 'GOOGLE',
          callback: json => {

            if (json.length === 0) return alert('No results for this search.');

            // Zoom to extent of nearest 3 centre in callback.
            _xyz.gazetteer.select(json[0], res => {

              const xhr = new XMLHttpRequest();

              xhr.open('GET',
                //_xyz.host + '/api/location/select/id?' +
                'http://localhost:3000/gla/api/location/select/latlng/nnearest?' +
                _xyz.utils.paramString({
                  locale: _xyz.workspace.locale.key,
                  layer: 'Advice Center',
                  table: 'gla.gla',
                  nnearest: 3,
                  lng: res.coordinates[0],
                  lat: res.coordinates[1],
                  filter: JSON.stringify(layer.filter.current),
                }));
            
              xhr.setRequestHeader('Content-Type', 'application/json');
              xhr.responseType = 'json';
            
              xhr.onload = e => {
            
                if (e.target.status !== 200) return;

                console.log(e.target.response);
                       
                const features = [_xyz.utils.turf.helpers.point(res.coordinates)];
            
                e.target.response.forEach(f => features.push(_xyz.utils.turf.helpers.point(JSON.parse(f.geomj).coordinates)));
                            
                const bbox = _xyz.utils.turf.bbox({
                  type: 'FeatureCollection',
                  features: features
                });
            
                _xyz.map.flyToBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]], {
                  padding: [5, 5]
                });
                        
              };
            
              xhr.send();

            });
          }
        }
      );
    });

  }
});