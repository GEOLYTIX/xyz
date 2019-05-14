_xyz({
  host: document.head.dataset.dir || new String(''),
  //hooks: true,
  callback: _xyz => {

    _xyz.mapview.create({
      target: document.getElementById('Map'),
      scrollWheelZoom: true,
      view: {
        lat: 51.52,
        lng: 0.24,
        z: 6,
      }
    });

    _xyz.locations.select = location => {
  
      // Remove current location if it exists.
      if (_xyz.locations.current) _xyz.locations.current.remove();  
    
      // Assign prototype to location.
      Object.assign(location, _xyz.locations.location());
    
      // Default callback for location.get().
      location.get(location => {
    
        // Make the location current.
        // To be removed when a new location is selected.
        _xyz.locations.current = location;
    
        // Get location marker from pointOnFeature is not already defined in location object.
        location.marker = location.marker || _xyz.utils.turf.pointOnFeature(location.geometry).geometry.coordinates;
    
        
   
        location.Marker = _xyz.mapview.draw.geoJSON({
          json: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: location.marker || _xyz.utils.turf.pointOnFeature(location.geometry).geometry.coordinates,
            }
          },
          pane: 'select_marker',
          style: {
            icon: {
              url: _xyz.utils.svg_symbols({
                type: 'markerColor',
                style: {
                  colorMarker: '#f06',
                  colorDot: '#9c27b0',
                }
              }),
              size: 40,
              anchor: [20, 40]
            }
          }
        });

        const locationView = document.getElementById('locationView');

        locationView.innerHTML = '';

        locationView.appendChild(customLocationView(_xyz, location.infoj));

        //alert(JSON.stringify(location.infoj, _xyz.utils.getCircularReplacer(), ' '));
      
      });
    
    };

    //_xyz.layers.list['Advice Center'].show();
    //console.log(_xyz.layers.list['Advice Center']);
    let layer = _xyz.layers.list['Advice Center'];
    layer.filter.current = {};

    customDropdown(_xyz, layer);

    searchPostcode(_xyz);

    _xyz.tableview.layerTable({
      layer: layer,
      target: document.getElementById('List'),
      key: 'gla',
      visible: ['organisation'],
      groupBy: 'borough',
      initialSort: [
        {
          column: 'organisation', dir: 'asc'
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

  }
});

function customLocationView(_xyz, infoj) {

  const fields = {};
  
  infoj.forEach(el => {

    if (el.value) fields[el.field] = el.value;
    
  });

  const view = _xyz.utils.hyperHTML.wire()`<div class="location light">`;

  if (fields.organisation) view.appendChild(
    _xyz.utils.hyperHTML.wire()`<div class="title">${fields.organisation}`
  );



  var viewGrid = _xyz.utils.hyperHTML.wire()`<div class="grid">`;

  viewGrid.appendChild(
    _xyz.utils.hyperHTML.wire()`<div style="grid-column: 1; grid-row: 1;"><i class="material-icons">room`);

  var viewAddress = _xyz.utils.hyperHTML.wire()`<div style="grid-column: 2; grid-row: 1;">`;

  if (fields.address1) viewAddress.appendChild(
    _xyz.utils.hyperHTML.wire()`<div>${fields.address1}`
  );

  if (fields.address2) viewAddress.appendChild(
    _xyz.utils.hyperHTML.wire()`<div>${fields.address2}`
  );

  if (fields.address3) viewAddress.appendChild(
    _xyz.utils.hyperHTML.wire()`<div>${fields.address3}`
  );

  if (fields.address4) viewAddress.appendChild(
    _xyz.utils.hyperHTML.wire()`<div>${fields.address4}`
  );

  if (fields.postcode) viewAddress.appendChild(
    _xyz.utils.hyperHTML.wire()`<div>${fields.postcode}`
  );

  viewGrid.appendChild(viewAddress);


  var viewLinks = _xyz.utils.hyperHTML.wire()`<div style="grid-column: 3; grid-row: 1;">`;

  if (fields.website) viewLinks.appendChild(
    _xyz.utils.hyperHTML.wire()`
    <div class="align-flex" style="margin-bottom: 5px;">
    <i class="material-icons">launch</i>
    <a style="margin-left: 5px;" href="${fields.website}">Website</a>`
  );

  if (fields.phone) viewLinks.appendChild(
    _xyz.utils.hyperHTML.wire()`
    <div class="align-flex" style="margin-bottom: 5px;">
    <i class="material-icons">call</i>
    <div style="margin-left: 5px;">${fields.phone}`
  );

  if (fields.email) viewLinks.appendChild(
    _xyz.utils.hyperHTML.wire()`
    <div class="align-flex" style="margin-bottom: 5px;">
    <i class="material-icons">email</i>
    <a style="margin-left: 5px;" href="${'mailto:'+fields.email}">Email</a>`
  );

  viewGrid.appendChild(viewLinks);

  view.appendChild(viewGrid);



  var viewGrid = _xyz.utils.hyperHTML.wire()`<div class="grid">`;
  var gridRow = 1;

  var el = _xyz.utils.hyperHTML.wire()`
  <div style="grid-column: 1/4; font-weight: bold; line-height: 2; font-size: 16px;">Opening Hours:`;
  el.style.gridRow = gridRow;
  viewGrid.appendChild(el);

  gridRow++;

  var el = _xyz.utils.hyperHTML.wire()`
  <div style="grid-column: 2; text-align: center; font-weight: bold;">Telephone`;
  el.style.gridRow = gridRow;
  viewGrid.appendChild(el);

  var el = _xyz.utils.hyperHTML.wire()`
  <div style="grid-column: 3; text-align: center; font-weight: bold;">Face-to-face`;
  el.style.gridRow = gridRow;
  viewGrid.appendChild(el);

  gridRow++;

  if (fields.hours_monday || fields.phone_monday) {
    var el = _xyz.utils.hyperHTML.wire()`
    <div style="grid-column: 1; font-weight: bold;">Monday`;
    el.style.gridRow = gridRow;
    viewGrid.appendChild(el);

    if (fields.hours_monday) {
      var el = _xyz.utils.hyperHTML.wire()`
      <div style="grid-column: 3; text-align: center;">${fields.hours_monday}`;
      el.style.gridRow = gridRow;
      viewGrid.appendChild(el);
    }

    if (fields.phone_monday) {
      var el = _xyz.utils.hyperHTML.wire()`
      <div style="grid-column: 2; text-align: center;">${fields.phone_monday}`;
      el.style.gridRow = gridRow;
      viewGrid.appendChild(el);
    }

    gridRow++;
  }

  if (fields.hours_tuesday || fields.phone_tuesday) {
    var el = _xyz.utils.hyperHTML.wire()`
    <div style="grid-column: 1; font-weight: bold;">Tuesday`;
    el.style.gridRow = gridRow;
    viewGrid.appendChild(el);

    if (fields.hours_tuesday) {
      var el = _xyz.utils.hyperHTML.wire()`
      <div style="grid-column: 3; text-align: center;">${fields.hours_tuesday}`;
      el.style.gridRow = gridRow;
      viewGrid.appendChild(el);
    }

    if (fields.phone_tuesday) {
      var el = _xyz.utils.hyperHTML.wire()`
      <div style="grid-column: 2; text-align: center;">${fields.phone_tuesday}`;
      el.style.gridRow = gridRow;
      viewGrid.appendChild(el);
    }

    gridRow++;
  }

  if (fields.hours_wednesday || fields.phone_wednesday) {
    var el = _xyz.utils.hyperHTML.wire()`
    <div style="grid-column: 1; font-weight: bold;">Wednesday`;
    el.style.gridRow = gridRow;
    viewGrid.appendChild(el);

    if (fields.hours_wednesday) {
      var el = _xyz.utils.hyperHTML.wire()`
      <div style="grid-column: 3; text-align: center;">${fields.hours_wednesday}`;
      el.style.gridRow = gridRow;
      viewGrid.appendChild(el);
    }

    if (fields.phone_wednesday) {
      var el = _xyz.utils.hyperHTML.wire()`
      <div style="grid-column: 2; text-align: center;">${fields.phone_wednesday}`;
      el.style.gridRow = gridRow;
      viewGrid.appendChild(el);
    }

    gridRow++;
  }

  if (fields.hours_thursday || fields.phone_thursday) {
    var el = _xyz.utils.hyperHTML.wire()`
    <div style="grid-column: 1; font-weight: bold;">Thursday`;
    el.style.gridRow = gridRow;
    viewGrid.appendChild(el);

    if (fields.hours_thursday) {
      var el = _xyz.utils.hyperHTML.wire()`
      <div style="grid-column: 3; text-align: center;">${fields.hours_thursday}`;
      el.style.gridRow = gridRow;
      viewGrid.appendChild(el);
    }

    if (fields.phone_thursday) {
      var el = _xyz.utils.hyperHTML.wire()`
      <div style="grid-column: 2; text-align: center;">${fields.phone_thursday}`;
      el.style.gridRow = gridRow;
      viewGrid.appendChild(el);
    }

    gridRow++;
  }

  if (fields.hours_friday || fields.phone_friday) {
    var el = _xyz.utils.hyperHTML.wire()`
    <div style="grid-column: 1; font-weight: bold;">Friday`;
    el.style.gridRow = gridRow;
    viewGrid.appendChild(el);

    if (fields.hours_friday) {
      var el = _xyz.utils.hyperHTML.wire()`
      <div style="grid-column: 3; text-align: center;">${fields.hours_friday}`;
      el.style.gridRow = gridRow;
      viewGrid.appendChild(el);
    }

    if (fields.phone_friday) {
      var el = _xyz.utils.hyperHTML.wire()`
      <div style="grid-column: 2; text-align: center;">${fields.phone_friday}`;
      el.style.gridRow = gridRow;
      viewGrid.appendChild(el);
    }

    gridRow++;
  }

  if (fields.phone_notes) {
    var el = _xyz.utils.hyperHTML.wire()`
    <div style="grid-column: 1/4;">${fields.phone_notes}`;
    el.style.gridRow = gridRow;
    viewGrid.appendChild(el);
    gridRow++;
  }  

  if (fields.hours_notes) {
    var el = _xyz.utils.hyperHTML.wire()`
    <div style="grid-column: 1/4;">${fields.hours_notes}`;
    el.style.gridRow = gridRow;
    viewGrid.appendChild(el);
    gridRow++;
  }

  view.appendChild(viewGrid);



  var viewGrid = _xyz.utils.hyperHTML.wire()`<div class="grid">`;

  var servicesGrid = _xyz.utils.hyperHTML.wire()`<div style="grid-column: 1;">`;

  servicesGrid.appendChild(_xyz.utils.hyperHTML.wire()`
  <div class="align-flex">
  <i class="material-icons">${fields.service_initial_advice ? 'check_box': 'check_box_outline_blank'}</i>
  Initial Advice`);

  servicesGrid.appendChild(_xyz.utils.hyperHTML.wire()`
  <div class="align-flex">
  <i class="material-icons">${fields.service_written_advice ? 'check_box': 'check_box_outline_blank'}</i>
  Written Advice`);

  servicesGrid.appendChild(_xyz.utils.hyperHTML.wire()`
  <div class="align-flex">
  <i class="material-icons">${fields.service_form_filling ? 'check_box': 'check_box_outline_blank'}</i>
  Form Filling`);

  servicesGrid.appendChild(_xyz.utils.hyperHTML.wire()`
  <div class="align-flex">
  <i class="material-icons">${fields.service_case_work ? 'check_box': 'check_box_outline_blank'}</i>
  Casework`);

  servicesGrid.appendChild(_xyz.utils.hyperHTML.wire()`
  <div class="align-flex">
  <i class="material-icons">${fields.service_representation ? 'check_box': 'check_box_outline_blank'}</i>
  Representation`);

  viewGrid.appendChild(servicesGrid);

  if (fields.coverage) {

    viewGrid.appendChild(_xyz.utils.hyperHTML.wire()`
    <div style="grid-column: 2; text-align: center;">
      <div><i style="font-size: 50px;" class="material-icons">person_pin</i></div>
      <div style="font-weight: bold;">Areas served</div>
      <div>${fields.coverage}</div>
    </div>`);
  }

  view.appendChild(viewGrid);


  var viewGrid = _xyz.utils.hyperHTML.wire()`<div class="grid" style="grid-template-columns: 1fr 1fr 1fr;">`;

  viewGrid.appendChild(_xyz.utils.hyperHTML.wire()`
  <div style="grid-column: 1; grid-row: 1; text-align: center;">
    <div style="font-size: 30px;">£</div>
    <div style="font-weight: bold">Cost</div>
    <div>Free</div>
  </div>`);

  viewGrid.appendChild(_xyz.utils.hyperHTML.wire()`
  <div style="grid-column: 2; grid-row: 1; text-align: center;">
    <div><i style="font-size: 30px;" class="material-icons">translate</i></div>
    <div style="font-weight: bold">Translation</div>
    <div>Call to find out</div>
  </div>`);

  viewGrid.appendChild(_xyz.utils.hyperHTML.wire()`
  <div style="grid-column: 3; grid-row: 1; text-align: center;">
    <div><i style="font-size: 30px;" class="material-icons">accessible_forward</i></div>
    <div style="font-weight: bold">Access</div>
    <div>Wheelchair accessible</div>
  </div>`);

  view.appendChild(viewGrid);

  return view;
}

function customDropdown(_xyz, layer) {
  
  var x, i, j, selElmnt, a, b, c, d;

  /*look for any elements with the class "custom-select":*/
  x = document.getElementsByClassName('custom-select');

  for (i = 0; i < x.length; i++) {
    selElmnt = x[i].getElementsByTagName('select')[0];
    /*for each element, create a new DIV that will act as the selected item:*/
    a = document.createElement('DIV');
    a.setAttribute('class', 'select-selected');
    //a.classList.add(selElmnt.classList);
    a.dataset.field = selElmnt.dataset.field;
    a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
    x[i].appendChild(a);

    /*for each element, create a new DIV that will contain the option list:*/
    b = document.createElement('DIV');
    b.setAttribute('class', 'select-items select-hide');
    for (j = 1; j < selElmnt.length; j++) {
      /*for each option in the original select element, create a new DIV that will act as an option item:*/

      c = document.createElement('DIV');
      c.innerHTML = selElmnt.options[j].innerHTML;
      //console.log(selElmnt);
      c.dataset.col = selElmnt.options[j].value;
      c.addEventListener('click', e => {
        /*when an item is clicked, update the original select box,
                and the selected item:*/
        var y, i, k, s, h;
        s = e.target.parentNode.parentNode.getElementsByTagName('select')[0];
        h = e.target.parentNode.previousSibling;
        for (i = 0; i < s.length; i++) {
          if (s.options[i].innerHTML == e.target.innerHTML) {
            s.selectedIndex = i;
            h.innerHTML = e.target.innerHTML;
            y = e.target.parentNode.getElementsByClassName('same-as-selected');
            for (k = 0; k < y.length; k++) {
              y[k].removeAttribute('class');
            }
            e.target.setAttribute('class', 'same-as-selected');
            break;
          }
        }
        h.click();
      });
      b.appendChild(c);
    }

    x[i].appendChild(b);

    a.addEventListener('click', e => {
      /*when the select box is clicked, close any other select boxes,
            and open/close the current select box:*/
      e.stopPropagation();
            
      closeAllSelect(e.target);
      e.target.nextSibling.classList.toggle('select-hide');
      e.target.classList.toggle('select-arrow-active');

    });
  }

  function closeAllSelect(elmnt) {
    /*a function that will close all select boxes in the document,
        except the current select box:*/
    var x, y, i, arrNo = [];
    x = document.getElementsByClassName('select-items');
    y = document.getElementsByClassName('select-selected');
    for (i = 0; i < y.length; i++) {
      if (elmnt == y[i]) {
        arrNo.push(i);
      } else {
        y[i].classList.remove('select-arrow-active');
      }
    }
    for (i = 0; i < x.length; i++) {
      if (arrNo.indexOf(i)) {
        x[i].classList.add('select-hide');
      }
    }

  }
  /*if the user clicks anywhere outside the select box,
    then close all select boxes:*/
  document.addEventListener('click', e => {
    e.stopPropagation();

    if(!e.target.parentNode.previousSibling.dataset) return;

    if(e.target.parentNode.previousSibling.dataset.field === 'borough'){
      if(e.target.textContent === 'Show all boroughs') {
        layer.filter.current[e.target.parentNode.previousSibling.dataset.field] = {};
        layer.show();
        return;
      }
      layer.filter.current[e.target.parentNode.previousSibling.dataset.field] = {};
      layer.filter.current[e.target.parentNode.previousSibling.dataset.field].match = e.target.textContent;
      layer.show();
    }

    if(e.target.parentNode.previousSibling.dataset.field === 'advice'){

     // Reset previous boolean filters
      Object.keys(layer.filter.current).map(key => {
        if(layer.filter.current[key]){
          delete layer.filter.current[key];
        }
      });

      if(e.target.textContent === 'Show all'){
        layer.filter.current[e.target.dataset.col] = {};
        layer.show();
        return;
      }
      layer.filter.current[e.target.dataset.col] = {};
      layer.filter.current[e.target.dataset.col]["boolean"] = true;
      layer.show();

    }

    closeAllSelect(e);
  });
}

function searchPostcode(_xyz){

  let input = document.querySelector('#postcode-search input'),
    find = document.querySelector('#postcode-find');
  
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

  find.addEventListener('click', e => {
    // Create abortable xhr.
    _xyz.gazetteer.xhr = new XMLHttpRequest();
    if (_xyz.gazetteer.xhr) _xyz.gazetteer.xhr.abort();

    // Send gazetteer query to backend.
    _xyz.gazetteer.xhr.open('GET', _xyz.host + '/api/gazetteer/autocomplete?' + _xyz.utils.paramString({
      locale: _xyz.workspace.locale.key,
      q: encodeURIComponent(input.value),
      token: _xyz.token
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

      xhr.open('GET', _xyz.host + `/api/gazetteer/googleplaces?id=${json[0].id}&token=${_xyz.token}`);
      xhr.responseType = 'json';

      xhr.onload = e => {
        if (e.target.status === 200) _xyz.gazetteer.createFeature(e.target.response);
      };
      xhr.send();
    }

    _xyz.gazetteer.xhr.send();

  });
}





