function gla_select (_xyz, location) {
  
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
              colorMarker: '#ff0066',
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

    locationView.appendChild(gla_locationView(_xyz, location.infoj));

    //alert(JSON.stringify(location.infoj, _xyz.utils.getCircularReplacer(), ' '));
    
  });
  
};


function gla_locationView(_xyz, infoj) {

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