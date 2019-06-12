function gla_select(_xyz, location) {

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

    setTimeout(function () { _xyz.map.invalidateSize(); }, 400);

  });

};


function gla_locationView(_xyz, infoj) {

  const fields = {};

  infoj.forEach(el => {

    if (el.value) fields[el.field] = el.value;

  });

  const view = _xyz.utils.hyperHTML.wire()`<div class="location light">`;

  if (fields.organisation_short) view.appendChild(
    _xyz.utils.hyperHTML.wire()`<div class="title">${fields.organisation_short}`
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
        <a style="margin-left: 5px;" href="${'mailto:' + fields.email}">Email</a>`
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

  if (
    fields.phone_sunday ||
        fields.phone_monday ||
        fields.phone_tuesday ||
        fields.phone_wednesday ||
        fields.phone_thursday ||
        fields.phone_friday ||
        fields.phone_saturday) {

    var el = _xyz.utils.hyperHTML.wire()`
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

    var el = _xyz.utils.hyperHTML.wire()`
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
      var el = _xyz.utils.hyperHTML.wire()`
          <div style="grid-column: 1; font-weight: bold;">${day}`;
      el.style.gridRow = gridRow;
      viewGrid.appendChild(el);

      if (hours) {
        var el = _xyz.utils.hyperHTML.wire()`
            <div style="grid-column: 3; text-align: center;">${hours}`;
        el.style.gridRow = gridRow;
        viewGrid.appendChild(el);
      }

      if (phone) {
        var el = _xyz.utils.hyperHTML.wire()`
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
    var el = _xyz.utils.hyperHTML.wire()`
        <div style="grid-column: 1/4; white-space: pre-wrap;">${fields.phone_notes}`;
    el.style.gridRow = gridRow;
    viewGrid.appendChild(el);
    gridRow++;
  }

  if (fields.hours_notes) {
    var el = _xyz.utils.hyperHTML.wire()`
        <div style="grid-column: 1/4; white-space: pre-wrap;">${fields.hours_notes}`;
    el.style.gridRow = gridRow;
    viewGrid.appendChild(el);
    gridRow++;
  }

  view.appendChild(viewGrid);



  var viewGrid = _xyz.utils.hyperHTML.wire()`<div class="grid">`;

  var servicesGrid = _xyz.utils.hyperHTML.wire()`<div style="grid-column: 1;">`;

  servicesGrid.appendChild(_xyz.utils.hyperHTML.wire()`
      <div class="align-flex">
      <i class="material-icons">${fields.service_initial_advice ? 'check_box' : 'check_box_outline_blank'}</i>
      Initial Advice`);

  servicesGrid.appendChild(_xyz.utils.hyperHTML.wire()`
      <div class="align-flex">
      <i class="material-icons">${fields.service_written_advice ? 'check_box' : 'check_box_outline_blank'}</i>
      Written Advice`);

  servicesGrid.appendChild(_xyz.utils.hyperHTML.wire()`
      <div class="align-flex">
      <i class="material-icons">${fields.service_form_filling ? 'check_box' : 'check_box_outline_blank'}</i>
      Form Filling`);

  servicesGrid.appendChild(_xyz.utils.hyperHTML.wire()`
      <div class="align-flex">
      <i class="material-icons">${fields.service_case_work ? 'check_box' : 'check_box_outline_blank'}</i>
      Casework`);

  servicesGrid.appendChild(_xyz.utils.hyperHTML.wire()`
      <div class="align-flex">
      <i class="material-icons">${fields.service_representation ? 'check_box' : 'check_box_outline_blank'}</i>
      Representation`);

  viewGrid.appendChild(servicesGrid);

  if (fields.coverage) {

    viewGrid.appendChild(_xyz.utils.hyperHTML.wire()`
        <div style="grid-column: 2; text-align: center;">
          <div><i style="font-size: 50px;" class="material-icons">person_pin</i></div>
          <div style="font-weight: bold;">Areas served</div>
          <div style="white-space: pre-wrap;">${fields.coverage}</div>
        </div>`);
  }

  view.appendChild(viewGrid);


  var viewGrid = _xyz.utils.hyperHTML.wire()`<div class="grid">`;

  if (fields.cost) viewGrid.appendChild(_xyz.utils.hyperHTML.wire()`
      <div style="grid-column: 1; grid-row: 1; text-align: center;">
        <div style="font-size: 30px;">£</div>
        <div style="font-weight: bold">Cost</div>
        <div style="white-space: pre-wrap;">${fields.cost}</div>
      </div>`);

  if (fields.translation_notes) viewGrid.appendChild(_xyz.utils.hyperHTML.wire()`
      <div style="grid-column: 2; grid-row: 1; text-align: center;">
        <div><i style="font-size: 30px;" class="material-icons">translate</i></div>
        <div style="font-weight: bold">Translation</div>
        <div style="white-space: pre-wrap;">${fields.translation_notes}</div>
      </div>`);

  if (fields.access) viewGrid.appendChild(_xyz.utils.hyperHTML.wire()`
      <div style="grid-column: 3; grid-row: 1; text-align: center;">
        <div><i style="font-size: 30px;" class="material-icons">accessible_forward</i></div>
        <div style="font-weight: bold">Access</div>
        <div style="white-space: pre-wrap;">${fields.access}</div>
      </div>`);

  view.appendChild(viewGrid);

  return view;

}