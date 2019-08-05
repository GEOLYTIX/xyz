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
  
    _xyz.locations.select = location => {

      for (const filter of filters) {
        filter.classList.remove('expanded');
        filter.querySelector('i').textContent = 'expand_more';
      }

      gla_select(_xyz, location);
    };
  
    const layer = _xyz.layers.list['Advice Center'];
   
    const table = _xyz.tableview.layerTable({
      layer: layer,
      target: document.getElementById('List'),
      key: 'gla',
      visible: ['organisation_short'],
      initialSort: [
        {
          column: 'organisation_short', dir: 'asc'
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

    setBoroughFilter();

    layer.filter.current = { borough : { in: [] } };

    function setBoroughFilter() {

      document.getElementById('filterBorough').innerHTML = '';

      const boroughs = [
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
      ];
  
      boroughs.forEach(borough => {
  
        document.getElementById('filterBorough').appendChild(_xyz.utils.wire()`
        <label class="checkbox">${borough}
        <input type="checkbox"
          onchange=${e => {
  
    e.stopPropagation();
                  
    if (e.target.checked) {
  
      // Add value to filter array.
      layer.filter.current['borough'].in.push(borough);
                  
    } else {
  
      // Get index of value in filter array.
      let idx = layer.filter.current['borough']['in'].indexOf(borough);
  
      // Splice filter array on idx.
      layer.filter.current['borough'].in.splice(idx, 1);
  
    }
    
    layer.zoomToExtent();
    table.update();
  
  
  }}>
        <div class="checkbox_i">`);
      });
  
    }

    setServiceFilter();

    function setServiceFilter() {

      document.getElementById('filterServices').innerHTML = '';

      const services = [
        ['service_initial_advice', 'Initial Advice' ],
        ['service_written_advice', 'Written Advice' ],
        ['service_form_filling', 'Form Filling' ],
        ['service_case_work', 'Casework' ],
        ['service_representation', 'Representation' ]
      ];
  
      services.forEach(service => {
  
        document.getElementById('filterServices').appendChild(_xyz.utils.wire()`
        <label class="checkbox">${service[1]}
        <input type="checkbox"
          onchange=${e => {
  
    e.stopPropagation();
                  
    if (e.target.checked) {
  
      layer.filter.current[service[0]] = {};
      layer.filter.current[service[0]]['boolean'] = true;
                  
    } else {
  
      delete layer.filter.current[service[0]];
  
    }
    
    layer.zoomToExtent();
    table.update();
  
  
  }}>
        <div class="checkbox_i">`);
      });

    }


    const filters = document.querySelectorAll('.filter');
    for (const filter of filters) {
      filter.onclick = function(){

        if (this.classList.contains('expanded')) {

          this.classList.remove('expanded');
          this.querySelector('i').textContent = 'expand_more';

        } else {

          this.classList.add('expanded');
          this.querySelector('i').textContent = 'expand_less';

        }

      };
    }



    document.getElementById('resetFilter').onclick = function(){

      layer.filter.current = { borough : { in: [] } };

      for (const filter of filters) {
        filter.classList.remove('expanded');
        filter.querySelector('i').textContent = 'expand_more';
      }

      setBoroughFilter();

      setServiceFilter();

      layer.zoomToExtent();
      table.update();

    };
  

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
                _xyz.host + '/api/location/select/latlng/nnearest?' +
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