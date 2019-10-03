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

    _xyz.locations.list = [
      {
        color: '#00AEEF',
        colorDark: '#007BBC',
        marker: {
          url: "https://raw.githubusercontent.com/GEOLYTIX/gla/master/icon-pin_blue.svg?sanitize=true",
          anchor: [0.5, 1],
          scale: 1
        },
      },
      {
        color: '#008D48',
        colorDark: '#005A15',
        marker: {
          url: "https://raw.githubusercontent.com/GEOLYTIX/gla/master/icon-pin_green.svg?sanitize=true",
          anchor: [0.5, 1],
          scale: 1
        },
      },
      {
        color: '#E85713',
        colorDark: '#CF3E00',
        marker: {
          url: "https://raw.githubusercontent.com/GEOLYTIX/gla/master/icon-pin_orange.svg?sanitize=true",
          anchor: [0.5, 1],
          scale: 1
        },
      }
    ];

  
    _xyz.locations.selectCallback = location => {

      // for (const filter of filters) {
      //   filter.classList.remove('expanded');
      // }

      //gla_select(_xyz, location);

      // Draw location marker.
      location.Marker = _xyz.mapview.geoJSON({
        geometry: {
          type: 'Point',
          coordinates: location.marker,
        },
        style: new _xyz.mapview.lib.style.Style({
          image: _xyz.mapview.icon(location.record.marker)
        })
      });

      const fields = {};

      location.infoj.forEach(el => {
    
        if (el.value) fields[el.field] = el.value;
    
      });
    
      const view = _xyz.utils.wire()`<div class="location" style="${'margin-top: 10px; border: 3px solid ' + location.record.color}">`;
    
    
      const header = _xyz.utils.wire()`<div style="display: grid; grid-gap: 5px; grid-template-columns: 30px auto 30px;">`;
    
      view.appendChild(header);
    
      const title_expand = _xyz.utils.wire()`<div style="grid-column: 1;" class="title-btn expander">`;
    
      header.appendChild(title_expand);
    
      header.appendChild(_xyz.utils.wire()`<div style="grid-column: 2" class="title">${fields.organisation_short}`);
    
      const title_close = _xyz.utils.wire()`<div style="grid-column: 3;" class="title-btn exit">`;
    
      header.appendChild(title_close);
    
    
      title_expand.onclick = function(e) {
    
        const loc = e.target.parentNode.parentNode;
    
        loc.classList.toggle('collapsed');
    
      };
    
      title_close.onclick = function() {
        location.remove();
      };
    
    
    
      var viewGrid = _xyz.utils.wire()`<div class="grid _grid" style="grid-template-columns: 30px;">`;
    
      viewGrid.appendChild(
        _xyz.utils.wire()`<div style="grid-column: 1; grid-row: 1;"><div style="background-image: url(https://raw.githubusercontent.com/GEOLYTIX/gla/master/icon_location.svg?sanitize=true);" class="location_icon">`);
    
      var viewAddress = _xyz.utils.wire()`<div style="grid-column: 2; grid-row: 1;">`;
    
      if (fields.address1) viewAddress.appendChild(
        _xyz.utils.wire()`<div>${fields.address1}`
      );
    
      if (fields.address2) viewAddress.appendChild(
        _xyz.utils.wire()`<div>${fields.address2}`
      );
    
      if (fields.address3) viewAddress.appendChild(
        _xyz.utils.wire()`<div>${fields.address3}`
      );
    
      if (fields.address4) viewAddress.appendChild(
        _xyz.utils.wire()`<div>${fields.address4}`
      );
    
      if (fields.postcode) viewAddress.appendChild(
        _xyz.utils.wire()`<div>${fields.postcode}`
      );
    
      viewGrid.appendChild(viewAddress);
    
      if (fields.website) {
        viewGrid.appendChild(
          _xyz.utils.wire()`
            <i style="grid-column: 1; grid-row: 2;" class="material-icons">launch</i>`);
        viewGrid.appendChild(
          _xyz.utils.wire()`
            <a style="grid-column: 2; grid-row: 2; line-height: 1.5;" href="${fields.website}">Website</a>`);
      }
    
      if (fields.phone) {
        viewGrid.appendChild(
          _xyz.utils.wire()`
            <div style="grid-column: 1; grid-row: 3; background-image: url(https://raw.githubusercontent.com/GEOLYTIX/gla/master/icon_phone.svg?sanitize=true);" class="location_icon">`);
        viewGrid.appendChild(
          _xyz.utils.wire()`
            <div style="grid-column: 2; grid-row: 3; line-height: 1.5;">${fields.phone}`);
      }    
    
      if (fields.email) {
        viewGrid.appendChild(
          _xyz.utils.wire()`
            <div style="grid-column: 1; grid-row: 4; background-image: url(https://raw.githubusercontent.com/GEOLYTIX/gla/master/icon_email.svg?sanitize=true);" class="location_icon">`);
        viewGrid.appendChild(
          _xyz.utils.wire()`
            <a style="grid-column: 2; grid-row: 4; line-height: 1.5;" href="${'mailto:' + fields.email}">Email</a>`);    
      }
    
      view.appendChild(viewGrid);
    
      var viewGrid = _xyz.utils.wire()`<div class="grid _grid">`;
    
      var gridRow = 1;
    
      var el = _xyz.utils.wire()`
          <div style="grid-column: 1/4; font-weight: bold; line-height: 2; font-size: 16px;">Opening Hours:`;
      el.style.gridRow = gridRow;
      viewGrid.appendChild(el);
    
      gridRow++;
    
      if (
        fields.phone_sunday ||
            fields.phone_monday ||
            fields.phone_tuesday ||
            fields.phone_wednesday ||
            fields.phone_thursday ||
            fields.phone_friday ||
            fields.phone_saturday) {
    
        var el = _xyz.utils.wire()`
          <div style="grid-column: 2; text-align: center; font-weight: bold;">Telephone`;
        el.style.gridRow = gridRow;
        viewGrid.appendChild(el);
    
      }
    
      if (
        fields.hours_sunday ||
            fields.hours_monday ||
            fields.hours_tuesday ||
            fields.hours_wednesday ||
            fields.hours_thursday ||
            fields.hours_friday ||
            fields.hours_saturday) {
    
        var el = _xyz.utils.wire()`
          <div style="grid-column: 3; text-align: center; font-weight: bold;">Face-to-face`;
        el.style.gridRow = gridRow;
        viewGrid.appendChild(el);
    
      }
    
      gridRow++;
    
      gridRow = hours(gridRow, 'Sunday', fields.hours_sunday, fields.phone_sunday);
    
      gridRow = hours(gridRow, 'Monday', fields.hours_monday, fields.phone_monday);
    
      gridRow = hours(gridRow, 'Tuesday', fields.hours_tuesday, fields.phone_tuesday);
    
      gridRow = hours(gridRow, 'Wednesday', fields.hours_wednesday, fields.phone_wednesday);
    
      gridRow = hours(gridRow, 'Thursday', fields.hours_thursday, fields.phone_thursday);
    
      gridRow = hours(gridRow, 'Friday', fields.hours_friday, fields.phone_friday);
    
      gridRow = hours(gridRow, 'Saturday', fields.hours_saturday, fields.phone_saturday);
    
      function hours(gridRow, day, hours, phone) {
        if (hours || phone) {
          var el = _xyz.utils.wire()`
              <div style="grid-column: 1; font-weight: bold;">${day}`;
          el.style.gridRow = gridRow;
          viewGrid.appendChild(el);
    
          if (hours) {
            var el = _xyz.utils.wire()`
                <div style="grid-column: 3; text-align: center;">${hours}`;
            el.style.gridRow = gridRow;
            viewGrid.appendChild(el);
          }
    
          if (phone) {
            var el = _xyz.utils.wire()`
                <div style="grid-column: 2; text-align: center;">${phone}`;
            el.style.gridRow = gridRow;
            viewGrid.appendChild(el);
          }
    
          gridRow++;
    
          return gridRow;
        }
    
        return gridRow;
      }
    
    
      if (fields.phone_notes) {
        var el = _xyz.utils.wire()`
            <div style="grid-column: 1/4; white-space: pre-wrap;">${fields.phone_notes}`;
        el.style.gridRow = gridRow;
        viewGrid.appendChild(el);
        gridRow++;
      }
    
      if (fields.hours_notes) {
        var el = _xyz.utils.wire()`
            <div style="grid-column: 1/4; white-space: pre-wrap;">${fields.hours_notes}`;
        el.style.gridRow = gridRow;
        viewGrid.appendChild(el);
        gridRow++;
      }
    
      view.appendChild(viewGrid);
    
    
    
      var viewGrid = _xyz.utils.wire()`<div class="grid _grid">`;
    
      var servicesGrid = _xyz.utils.wire()`<div style="grid-column: 1;">`;
    
      servicesGrid.appendChild(_xyz.utils.wire()`
          <div class="align-flex">
          <i class="material-icons">${fields.service_initial_advice ? 'check_box' : 'check_box_outline_blank'}</i>
          Initial Advice`);
    
      servicesGrid.appendChild(_xyz.utils.wire()`
          <div class="align-flex">
          <i class="material-icons">${fields.service_written_advice ? 'check_box' : 'check_box_outline_blank'}</i>
          Written Advice`);
    
      servicesGrid.appendChild(_xyz.utils.wire()`
          <div class="align-flex">
          <i class="material-icons">${fields.service_form_filling ? 'check_box' : 'check_box_outline_blank'}</i>
          Form Filling`);
    
      servicesGrid.appendChild(_xyz.utils.wire()`
          <div class="align-flex">
          <i class="material-icons">${fields.service_case_work ? 'check_box' : 'check_box_outline_blank'}</i>
          Casework`);
    
      servicesGrid.appendChild(_xyz.utils.wire()`
          <div class="align-flex">
          <i class="material-icons">${fields.service_representation ? 'check_box' : 'check_box_outline_blank'}</i>
          Representation`);
    
      viewGrid.appendChild(servicesGrid);
    
      if (fields.coverage) {
    
        viewGrid.appendChild(_xyz.utils.wire()`
            <div style="grid-column: 2; text-align: center;">
              <div><i style="font-size: 50px;" class="material-icons">person_pin</i></div>
              <div style="font-weight: bold;">Areas served</div>
              <div style="white-space: pre-wrap;">${fields.coverage}</div>
            </div>`);
      }
    
      view.appendChild(viewGrid);
    
    
      var viewGrid = _xyz.utils.wire()`<div class="grid _grid">`;
    
      if (fields.cost) viewGrid.appendChild(_xyz.utils.wire()`
          <div style="grid-column: 1; grid-row: 1; text-align: center;">
            <div style="font-size: 30px;">£</div>
            <div style="font-weight: bold">Cost</div>
            <div style="white-space: pre-wrap;">${fields.cost}</div>
          </div>`);
    
      if (fields.translation_notes) viewGrid.appendChild(_xyz.utils.wire()`
          <div style="grid-column: 2; grid-row: 1; text-align: center;">
            <div><i style="font-size: 30px;" class="material-icons">translate</i></div>
            <div style="font-weight: bold">Translation</div>
            <div style="white-space: pre-wrap;">${fields.translation_notes}</div>
          </div>`);
    
      if (fields.access) viewGrid.appendChild(_xyz.utils.wire()`
          <div style="grid-column: 3; grid-row: 1; text-align: center;">
            <div><i style="font-size: 30px;" class="material-icons">accessible_forward</i></div>
            <div style="font-weight: bold">Access</div>
            <div style="white-space: pre-wrap;">${fields.access}</div>
          </div>`);
    
      view.appendChild(viewGrid);

      document.getElementById('locationView').appendChild(view);

      location.view.drawer = view;

    };
  
    const layer = _xyz.layers.list['Advice Center'];
   
    const table = _xyz.dataview.layerTable({
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

        } else {

          this.classList.add('expanded');

        }

      };
    }

    document.getElementById('resetFilter').onclick = function(){

      layer.filter.current = { borough : { in: [] } };

      for (const filter of filters) {
        filter.classList.remove('expanded');
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

    // _xyz.mapview.locate.icon = _xyz.L.icon({
    //   iconUrl: 'https://raw.githubusercontent.com/GEOLYTIX/gla/master/icon-pin_locate.svg?sanitize=true',
    //   iconSize: 30
    // });

    _xyz.gazetteer.icon = 'https://raw.githubusercontent.com/GEOLYTIX/gla/master/icon-pin_gazetteer.svg?sanitize=true';

   
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