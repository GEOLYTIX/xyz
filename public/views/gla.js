_xyz({
  host: document.head.dataset.dir,
  hooks: true,
  callback: _xyz => {

    _xyz.mapview.create({
      target: document.getElementById('Map'),
      scrollWheelZoom: true,
      zoomControl: true,
    });

    document.getElementById('btnLocate').onclick = e => {
      _xyz.mapview.locate.toggle();
      e.target.classList.toggle('active');
    };

    _xyz.locations.list = [
      {
        color: '#00AEEF',
        colorDark: '#007BBC',
        marker: {
          url: "https://cdn.jsdelivr.net/gh/GEOLYTIX/gla@latest/icon-pin_blue.svg",
          anchor: [0.5, 1],
          scale: 0.5
        },
      },
      {
        color: '#008D48',
        colorDark: '#005A15',
        marker: {
          url: "https://cdn.jsdelivr.net/gh/GEOLYTIX/gla@latest/icon-pin_green.svg",
          anchor: [0.5, 1],
          scale: 0.5
        },
      },
      {
        color: '#E85713',
        colorDark: '#CF3E00',
        marker: {
          url: "https://cdn.jsdelivr.net/gh/GEOLYTIX/gla@latest/icon-pin_orange.svg",
          anchor: [0.5, 1],
          scale: 0.5
        },
      }
    ];

    _xyz.locations.selectCallback = location => {

      for (const filter of filters) {
        filter.classList.remove('expanded');
      }

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

      const view = _xyz.utils.wire()`<div class="location" style="${'font-size: 14px; margin-top: 10px; border: 3px solid ' + location.record.color}">`;


      const header = _xyz.utils.wire()`<div style="display: grid; grid-gap: 5px; grid-template-columns: 30px auto 30px;">`;

      view.appendChild(header);

      const title_expand = _xyz.utils.wire()`<div style="grid-column: 1;" class="title-btn expander">`;

      header.appendChild(title_expand);

      header.appendChild(_xyz.utils.wire()`<div style="grid-column: 2" class="title">${fields.organisation_short}`);

      const title_close = _xyz.utils.wire()`<div style="grid-column: 3;" class="title-btn exit">`;

      header.appendChild(title_close);


      title_expand.onclick = function (e) {

        const loc = e.target.parentNode.parentNode;

        loc.classList.toggle('collapsed');

      };

      title_close.onclick = function () {
        location.remove();
      };



      var viewGrid = _xyz.utils.wire()`<div class="grid _grid" style="grid-template-columns: 20px 1fr 20px 1fr;">`;

      viewGrid.appendChild(
        _xyz.utils.wire()`<div style="grid-column: 1; grid-row: 1;"><div style="background-image: url(https://cdn.jsdelivr.net/gh/GEOLYTIX/gla@latest/icon_location.svg);" class="location_drop">`);

      var viewAddress = _xyz.utils.wire()`<div style="grid-column: 2; grid-row: 1/4;">`;

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
          <div style="grid-column: 3; grid-row: 1; background-image: url(https://cdn.jsdelivr.net/gh/GEOLYTIX/gla@latest/icon_link.svg);" class="location_icon">`);

        viewGrid.appendChild(
          _xyz.utils.wire()`
            <a style="grid-column: 4; grid-row: 1;" href="${fields.website}">Website</a>`);
      }

      if (fields.phone) {
        viewGrid.appendChild(
          _xyz.utils.wire()`
            <div style="grid-column: 3; grid-row: 2; background-image: url(https://cdn.jsdelivr.net/gh/GEOLYTIX/gla@latest/icon_phone.svg);" class="location_icon">`);
        viewGrid.appendChild(
          _xyz.utils.wire()`
            <div style="grid-column: 4; grid-row: 2;">${fields.phone}`);
      }

      if (fields.email) {
        viewGrid.appendChild(
          _xyz.utils.wire()`
            <div style="grid-column: 3; grid-row: 3; background-image: url(https://cdn.jsdelivr.net/gh/GEOLYTIX/gla@latest/icon_email.svg);" class="location_icon">`);
        viewGrid.appendChild(
          _xyz.utils.wire()`
            <a style="grid-column: 4; grid-row: 3;" href="${'mailto:' + fields.email}">Email</a>`);
      }
      if (fields.coverage) {

        viewGrid.appendChild(_xyz.utils.wire()`
            <div style="
            grid-column: 1;
            grid-row: 5;
            background-image: url(https://cdn.jsdelivr.net/gh/GEOLYTIX/gla@latest/icon-catchment.svg);
            height: 30px;
            background-size: contain;
            background-repeat: no-repeat;">`);

        viewGrid.appendChild(_xyz.utils.wire()`
            <div style="grid-column: 2/5; grid-row: 5;">${fields.coverage}`);     

      }

      view.appendChild(viewGrid);

      var viewGrid = _xyz.utils.wire()`<div style="display: grid; grid-gap:0px; grid-template-columns: 30px;">`;

      var gridRow = 1;

      var el = _xyz.utils.wire()`
          <div style="grid-column: 1/4; font-weight: bold; line-height: 2; font-size: 14px;">Opening Hours:`;
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

      gridRow = hours(gridRow, 'Sun', fields.hours_sunday, fields.phone_sunday);

      gridRow = hours(gridRow, 'Mon', fields.hours_monday, fields.phone_monday);

      gridRow = hours(gridRow, 'Tue', fields.hours_tuesday, fields.phone_tuesday);

      gridRow = hours(gridRow, 'Wed', fields.hours_wednesday, fields.phone_wednesday);

      gridRow = hours(gridRow, 'Thu', fields.hours_thursday, fields.phone_thursday);

      gridRow = hours(gridRow, 'Fri', fields.hours_friday, fields.phone_friday);

      gridRow = hours(gridRow, 'Sat', fields.hours_saturday, fields.phone_saturday);

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



      var viewGrid = _xyz.utils.wire()`<div class="grid _grid" style="grid-template-columns: 20px">`;

      viewGrid.appendChild(_xyz.utils.wire()`<div style="grid-column: 1/5; grid-row: 1; font-weight: bold; line-height: 2; font-size: 14px;">Services offered:`)


      viewGrid.appendChild(_xyz.utils.wire()`
      <div style="${'grid-column: 1; grid-row: 2; background-image: url(https://cdn.jsdelivr.net/gh/GEOLYTIX/gla@latest/'+ (fields.service_initial_advice ? 'icon_checked' : 'icon_unchecked') +'.svg); height: 12px; background-size: contain; background-repeat: no-repeat;'}">`);

      viewGrid.appendChild(_xyz.utils.wire()`
      <div style="grid-column: 2; grid-row: 2;">One-off initial advice.`);

      viewGrid.appendChild(_xyz.utils.wire()`
      <div style="${'grid-column: 1; grid-row: 3; background-image: url(https://cdn.jsdelivr.net/gh/GEOLYTIX/gla@latest/'+ (fields.service_written_advice ? 'icon_checked' : 'icon_unchecked') +'.svg); height: 12px; background-size: contain; background-repeat: no-repeat;'}">`);

      viewGrid.appendChild(_xyz.utils.wire()`
      <div style="grid-column: 2; grid-row: 3;">Written advice.`);

      viewGrid.appendChild(_xyz.utils.wire()`
      <div style="${'grid-column: 1; grid-row: 4; background-image: url(https://cdn.jsdelivr.net/gh/GEOLYTIX/gla@latest/'+ (fields.service_form_filling ? 'icon_checked' : 'icon_unchecked') +'.svg); height: 12px; background-size: contain; background-repeat: no-repeat;'}">`);

      viewGrid.appendChild(_xyz.utils.wire()`
      <div style="grid-column: 2; grid-row: 4;">Help with filling in forms.`);

      viewGrid.appendChild(_xyz.utils.wire()`
      <div style="${'grid-column: 1; grid-row: 5; background-image: url(https://cdn.jsdelivr.net/gh/GEOLYTIX/gla@latest/'+ (fields.service_case_work ? 'icon_checked' : 'icon_unchecked') +'.svg); height: 12px; background-size: contain; background-repeat: no-repeat;'}">`);

      viewGrid.appendChild(_xyz.utils.wire()`
      <div style="grid-column: 2; grid-row: 5;">Help with putting a case together for court.`);

      viewGrid.appendChild(_xyz.utils.wire()`
      <div style="${'grid-column: 1; grid-row: 6; background-image: url(https://cdn.jsdelivr.net/gh/GEOLYTIX/gla@latest/'+ (fields.service_representation ? 'icon_checked' : 'icon_unchecked') +'.svg); height: 12px; background-size: contain; background-repeat: no-repeat;'}">`);

      viewGrid.appendChild(_xyz.utils.wire()`
      <div style="grid-column: 2; grid-row: 6;">Representation at court.`);

      view.appendChild(viewGrid);


      var viewGrid = _xyz.utils.wire()`<div class="grid _grid" style="grid-template-columns: 30px 1fr 30px 1fr;">`;


      if (fields.translation_notes) {
        viewGrid.appendChild(_xyz.utils.wire()`
          <div style="grid-column: 1; grid-row: 1; background-image: url(https://cdn.jsdelivr.net/gh/GEOLYTIX/gla@latest/icon-access.svg); height: 25px; background-size: contain; background-repeat: no-repeat;"></div>`);
        viewGrid.appendChild(_xyz.utils.wire()`
          <div style="grid-column: 2; grid-row: 1;">
            <div style="font-weight: bold">Access</div>
            <div style="white-space: pre-wrap;">${fields.access}</div>`);            
      }

      if (fields.access) {
        viewGrid.appendChild(_xyz.utils.wire()`
          <div style="grid-column: 3; grid-row: 1; background-image: url(https://cdn.jsdelivr.net/gh/GEOLYTIX/gla@latest/icon-translate.svg); height: 25px; background-size: contain; background-repeat: no-repeat;"></div>`);
        viewGrid.appendChild(_xyz.utils.wire()`
          <div style="grid-column: 4; grid-row: 1;">
            <div style="font-weight: bold">Translation</div>
            <div style="white-space: pre-wrap;">${fields.translation_notes}</div>`);          
      }

      view.appendChild(viewGrid);

      document.getElementById('locationView').appendChild(view);

      location.view.drawer = view;

    };

    _xyz.hooks.current.locations.forEach(_hook => {

      let hook = _hook.split('!');

      _xyz.locations.select({
        locale: _xyz.workspace.locale.key,
        layer: _xyz.layers.list[decodeURIComponent(hook[0])],
        table: hook[1],
        id: hook[2]
      });
    });

    const layer = _xyz.layers.list['Advice Center'];

    const table = _xyz.dataview.layerTable({
      layer: layer,
      target_id: 'List',
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
          layer: layer,
          table: layer.table,
          id: row.getData().qid,
          _flyTo: true,
        });
      }
    });

    setBoroughFilter();

    layer.filter.current = { borough: { in: [] } };

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
        <label class="checkbox">
        <input type="checkbox" onchange=${e => {
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

            layer.zoomToExtent({ padding: [100, 100, 100, 100] });
            table.update();

          }}>
        </input><span>${borough}`);
      });

    }

    setServiceFilter();

    function setServiceFilter() {

      document.getElementById('filterServices').innerHTML = '';

      const services = [
        ['service_initial_advice', 'Initial Advice'],
        ['service_written_advice', 'Written Advice'],
        ['service_form_filling', 'Form Filling'],
        ['service_case_work', 'Casework'],
        ['service_representation', 'Representation']
      ];

      services.forEach(service => {

        document.getElementById('filterServices').appendChild(_xyz.utils.wire()`
        <label class="checkbox">
        <input type="checkbox" onchange=${e => {
            e.stopPropagation();

            if (e.target.checked) {
              layer.filter.current[service[0]] = {};
              layer.filter.current[service[0]]['boolean'] = true;

            } else {

              delete layer.filter.current[service[0]];
            }

            layer.zoomToExtent({ padding: [100, 100, 100, 100] });
            table.update();
          }}>
        </input><span>${service[1]}`);
      });

    }

    const filters = document.querySelectorAll('.filter');

    for (const filter of filters) {
      filter.onclick = function () {

        if (this.classList.contains('expanded')) {

          this.classList.remove('expanded');

        } else {

          this.classList.add('expanded');

        }

      };
    }

    document.getElementById('resetFilter').onclick = function () {

      layer.filter.current = { borough: { in: [] } };

      for (const filter of filters) {
        filter.classList.remove('expanded');
      }

      setBoroughFilter();

      setServiceFilter();

      layer.zoomToExtent({ padding: [100, 100, 100, 100] });
      table.update();

    };


    // Locator
    _xyz.mapview.locate.icon = {
      url: "https://cdn.jsdelivr.net/gh/GEOLYTIX/gla@latest/icon-pin_locate.svg",
      anchor: [0.5, 1],
      scale: 0.5
    }


    // Gazetteer
    const input = document.getElementById('postcode-search');

    const find = document.getElementById('postcode-find');

    input.addEventListener('focus', e => {
      find.classList.remove('darkish');
      find.classList.add('pink-bg');
      e.target.parentNode.classList.add('pink-br');
    });

    input.addEventListener('blur', e => {
      find.classList.add('darkish');
      find.classList.remove('pink-bg');
      e.target.parentNode.classList.remove('pink-br');
    });

    _xyz.gazetteer.icon = {
      url: "https://cdn.jsdelivr.net/gh/GEOLYTIX/gla@latest/icon-pin_gazetteer.svg",
      anchor: [0.5, 1],
      scale: 0.5
    }

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

                const geoJSON = new _xyz.mapview.lib.format.GeoJSON();

                const features = [];

                e.target.response.forEach(f => {

                  features.push(geoJSON.readFeature({
                    type: 'Feature',
                    geometry: JSON.parse(f.geomj)
                  }, {
                    dataProjection: 'EPSG:4326',
                    featureProjection: 'EPSG:3857'
                  }));

                });

                const gazSource = _xyz.gazetteer.layer.getSource();

                gazSource.addFeatures(features);

                _xyz.mapview.flyToBounds(_xyz.gazetteer.layer.getSource().getExtent());

                features.forEach(f => gazSource.removeFeature(f));

              };

              xhr.send();

            });

          }
        }
      );
    });

  }
});