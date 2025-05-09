/**
### /ui/elements/drawing

Exports function which create various drawing elements

Dictionary entries:
- draw_dialog_title
- draw_dialog_begin_drawing
- draw_dialog_cancel_drawing
- draw_dialog_remove_vertex
- draw_dialog_save
- draw_dialog_save_single
- draw_point
- draw_position
- draw_polygon
- draw_rectangle
- circle_config
- draw_circle
- draw_circle_2pt
- radius
- units
- draw_line
- create

@requires /dictionary

@module /ui/elements/drawing
*/

export default {
  circle,
  circle_2pt,
  drawOnclick,
  line,
  locator,
  point,
  polygon,
  rectangle,
};

/**
@function drawOnclick

@description
The drawOnClick method is triggered by clicking on a drawing element button.

The 'active' class is toggled on the button element. The drawing interaction is finished if the 'active' class is toggled off.

A callback method is assigned to the interaction before the interaction object is passed as argument to call the mapview's draw interaction.

@param {Object} e The click event. 
@param {layer} layer Decorated Mapp Layer.
@param {Object} interaction Mapview drawing interaction.

@property {Object} e.target The click event target [button].
*/

function drawOnclick(e, layer, interaction) {
  const btn = e.target;

  if (!btn.classList.toggle('active')) {
    layer.mapview.interaction.finish();
    return;
  }

  !layer.display && layer.show();

  interaction.callback ??= (feature) => {
    mapp.location.create(feature, interaction, layer);

    btn.classList.remove('active');

    delete layer.mapview.interaction;

    mapp.ui.elements.helpDialog();

    // Set highlight interaction if no other interaction is current after 400ms.
    setTimeout(() => {
      !layer.mapview.interaction && layer.mapview.interactions.highlight();
    }, 400);
  };

  layer.mapview.interactions.draw(interaction);

  interaction.helpDialog.header = mapp.utils
    .html`<h3 style="line-height: 2em; margin-right: 1em">${mapp.dictionary.draw_dialog_title}</h3>`;

  interaction.helpDialog.data_id = 'dialog_drawing';

  mapp.ui.elements.helpDialog(interaction.helpDialog);

  btn.classList.add('active');
}

/**
@function point
@description Creates a button for drawing a point on the map.
@param {layer} layer Decorated MAPP Layer.
@return {HTMLElement} The button element.
*/
function point(layer) {
  const helpDialog = {
    content: mapp.utils.html.node`<li>
    <ul>${mapp.dictionary.draw_dialog_begin_drawing}</ul>
    <ul>${mapp.dictionary.draw_dialog_save_single}</ul>`,
  };

  // Set the default values
  layer.draw.point = {
    helpDialog,
    label: mapp.dictionary.draw_point,
    layer,
    type: 'Point',
    ...layer.draw.point,
  };

  // Create the button
  layer.draw.point.btn = mapp.utils.html.node`
    <button
      class="action wide"
      onclick=${(e) => drawOnclick(e, layer, layer.draw.point)}>
      <span class="material-symbols-outlined">add_location_alt</span>
      ${layer.draw.point.label}`;

  return layer.draw.point.btn;
}

/**
@function line
@description Creates a button for drawing a line on the map.
@param {layer} layer Decorated MAPP Layer.
@return {HTMLElement} The button element.
*/
function line(layer) {
  const helpDialog = {
    content: mapp.utils.html.node`<li>
    <ul>${mapp.dictionary.draw_dialog_begin_drawing}</ul>
    <ul>${mapp.dictionary.draw_dialog_remove_vertex}</ul>
    <ul>${mapp.dictionary.draw_dialog_save_single}</ul>`,
  };

  // Set the default values
  layer.draw.line = {
    helpDialog,
    label: mapp.dictionary.draw_line,
    layer,
    type: 'LineString',
    ...layer.draw.line,
  };

  // Create the button
  layer.draw.line.btn = mapp.utils.html.node`
    <button
      class="action wide"
      onclick=${(e) => drawOnclick(e, layer, layer.draw.line)}>
      <span class="material-symbols-outlined">polyline</span>
      ${layer.draw.line.label}`;

  return layer.draw.line.btn;
}

/**
@function polygon
@description Creates a button for drawing a polygon on the map.
@param {layer} layer Decorated MAPP Layer.
@return {HTMLElement} The button element.
*/
function polygon(layer) {
  const helpDialog = {
    content: mapp.utils.html.node`<li>
    <ul>${mapp.dictionary.draw_dialog_begin_drawing}</ul>
    <ul>${mapp.dictionary.draw_dialog_cancel_drawing}
    <ul>${mapp.dictionary.draw_dialog_remove_vertex}</ul>
    <ul>${mapp.dictionary.draw_dialog_save}</ul>`,
  };

  // Set the default values
  layer.draw.polygon = {
    helpDialog,
    label: mapp.dictionary.draw_polygon,
    layer,
    type: 'Polygon',
    ...layer.draw.polygon,
  };

  // Create the button
  layer.draw.polygon.btn = mapp.utils.html.node`
    <button
      class="action wide"
      onclick=${(e) => drawOnclick(e, layer, layer.draw.polygon)}>
      <span class="material-symbols-outlined">activity_zone</span>
      ${layer.draw.polygon.label}`;

  return layer.draw.polygon.btn;
}

/**
@function rectangle
@description Creates a button for rectangle a line on the map.
@param {layer} layer Decorated MAPP Layer.
@return {HTMLElement} The button element.
*/
function rectangle(layer) {
  const helpDialog = {
    content: mapp.utils.html.node`<li>
    <ul>${mapp.dictionary.draw_dialog_begin_drawing}</ul>
    <ul>${mapp.dictionary.draw_dialog_save_single}</ul>`,
  };

  // Set the default values
  layer.draw.rectangle = {
    geometryFunction: ol.interaction.Draw.createBox(),
    helpDialog,
    label: mapp.dictionary.draw_rectangle,
    layer,
    type: 'Circle',
    ...layer.draw.rectangle,
  };

  // Create the button
  layer.draw.rectangle.btn = mapp.utils.html.node`
  <button
    class="action wide"
    onclick=${(e) => drawOnclick(e, layer, layer.draw.rectangle)}>
    <span class="material-symbols-outlined">rectangle</span>
    ${layer.draw.rectangle.label}`;

  return layer.draw.rectangle.btn;
}

/**
@function circle_2pt
@description Creates a button for circle_2pt a line on the map.
@param {layer} layer Decorated MAPP Layer.
@return {HTMLElement} The button element.
*/
function circle_2pt(layer) {
  const helpDialog = {
    content: mapp.utils.html.node`<li>
    <ul>${mapp.dictionary.draw_dialog_begin_drawing}</ul>
    <ul>${mapp.dictionary.draw_dialog_save_single}</ul>`,
  };

  // Set the default values
  layer.draw.circle_2pt = {
    geometryFunction: ol.interaction.Draw.createRegularPolygon(33),
    helpDialog,
    label: mapp.dictionary.draw_circle_2pt,
    layer,
    type: 'Circle',
    ...layer.draw.circle_2pt,
  };

  // Create the button
  layer.draw.circle_2pt.btn = mapp.utils.html.node`
  <button
    class="action wide"
    onclick=${(e) => drawOnclick(e, layer, layer.draw.circle_2pt)}>
    <span class="material-symbols-outlined">outbound</span>
    ${layer.draw.circle_2pt.label}`;

  return layer.draw.circle_2pt.btn;
}

/**
@function circle
@description Creates a button for circle a line on the map.
@param {layer} layer Decorated MAPP Layer.
@return {HTMLElement} The button element.
*/
function circle(layer) {
  const helpDialog = {
    content: mapp.utils.html.node`<li>
    <ul>${mapp.dictionary.draw_dialog_begin_drawing}</ul>
    <ul>${mapp.dictionary.draw_dialog_save_single}</ul>`,
  };

  // Set the default values
  layer.draw.circle = {
    geometryFunction: (coordinates) => {
      const polygonCircular = new ol.geom.Polygon.circular(
        ol.proj.toLonLat(coordinates),
        layer.draw.circle.unitConversion[layer.draw.circle.units](
          layer.draw.circle.radius,
        ),
        64,
      );

      return polygonCircular.transform('EPSG:4326', 'EPSG:3857');
    },
    helpDialog,
    label: mapp.dictionary.draw_circle,
    layer,
    radius: 100,
    radiusMax: 1000,
    radiusMin: 1,

    // Methods to transform input radius.
    type: 'Point',
    unitConversion: {
      km: (v) => v * 1000,
      km2: (v) => Math.sqrt((v * 1000000) / Math.PI),
      meter: (v) => v,
      meter2: (v) => Math.sqrt(v / Math.PI),
      miles: (v) => v * 1609.34,
    },
    units: 'meter',
    ...layer.draw.circle,
  };

  // Build an array for the unit, label, min and max values.
  const units = [
    {
      max: 1000,
      min: 1,
      option: 'meter',
      title: 'Meter',
    },
    {
      max: 10,
      min: 1,
      option: 'km',
      title: 'KM',
    },
    {
      max: 10,
      min: 1,
      option: 'miles',
      title: 'Miles',
    },
    {
      max: 1000,
      min: 1,
      option: 'meter2',
      title: 'Meter²',
    },
    {
      max: 10,
      min: 1,
      option: 'km2',
      title: 'KM²',
    },
  ];

  // Subset the units array to only include the units that are defined in the layer.draw.circle.unitsOptions
  layer.draw.circle.unitsOptions ??= ['meter', 'km', 'miles', 'meter2', 'km2'];

  const optionsGiven = layer.draw.circle.unitsOptions.join(', ');
  const unitsAvailable = units.map(unit => unit.option).join(', ');
  
  if (!units.some(unit => layer.draw.circle.unitsOptions.includes(unit.option))) {
    console.log(`layer.draw.circle.unitsOptions - ${optionsGiven}: not found in available options. They are ${unitsAvailable}`);
    
    // Set the layer.draw.circle.unitsOption to just meter 
    layer.draw.circle.unitsOptions = ['meter'];
  }
  
  const circleUnits = units.filter((unit) =>
    layer.draw.circle.unitsOptions.includes(unit.option)
  );

  // Set layer.draw.circle.units to the first unit in the circleUnits array
  layer.draw.circle.units = circleUnits[0].option;

  const unitsDropDown = mapp.utils.html.node`
    <div style="display: grid; grid-template-columns: 100px 1fr; align-items: center;">
      <div style="grid-column: 1;">${mapp.dictionary.units}</div>
      <div style="grid-column: 2;">
        ${mapp.ui.elements.dropdown({
          callback: (e, entry) => {
            layer.draw.circle.units = entry.option;
            layer.draw.circle.radiusMin = entry.min;
            layer.draw.circle.radiusMax = entry.max;

            // Update the value of the slider to ensure it is within the new min and max values.
            layer.draw.circle.radius =
              layer.draw.circle.radius > layer.draw.circle.radiusMax
                ? layer.draw.circle.radiusMax
                : layer.draw.circle.radius;

            // Render the slider after changes
            createSlider();
          },
          entries: circleUnits,
          placeholder: circleUnits.find(
            (entry) => entry.option === layer.draw.circle.units,
          ).title,
        })}`;

  const rangeSlider = mapp.utils.html.node`<div>`;

  createSlider();

  /**
  @function createSlider
  Creates a slider for the circle radius, renders this slider into the rangeSlider div, and assigns a callback function to update the radius value.
  */
  function createSlider() {
    mapp.utils.render(
      rangeSlider,
      mapp.ui.elements.slider({
        callback: (e) => {
          layer.draw.circle.radius = parseFloat(e);
        },
        max: layer.draw.circle.radiusMax,
        min: layer.draw.circle.radiusMin,
        val: layer.draw.circle.radius,
      }),
    );
  }

  layer.draw.circle.btn = mapp.utils.html.node`
  <button
    class="action wide"
    onclick=${(e) => drawOnclick(e, layer, layer.draw.circle)}>
    <span class="material-symbols-outlined">add_circle</span>
    ${layer.draw.circle.label}`;

  const content = mapp.utils.html.node`
    <div class="panel flex-col">
      ${unitsDropDown}
      ${rangeSlider}
      ${layer.draw.circle.btn}`;

  // The config elements are not shown.
  if (layer.draw.circle.hidePanel) return layer.draw.circle.btn;

  if (layer.draw.circle.drawer === false) {
    return mapp.utils.html`<h3>${mapp.dictionary.circle_config}</h3>${content}`;
  }

  layer.draw.circle.drawer = mapp.ui.elements.drawer({
    header: mapp.utils.html`
    <h3>${mapp.dictionary.circle_config}</h3>
    <div class="material-symbols-outlined caret"/>`,
    content,
  });

  return layer.draw.circle.drawer;
}

/**
@function locator
@description Creates a button for drawing a point at your current location.
@param {layer} layer Decorated MAPP Layer.
@return {HTMLElement} The button element.
*/
function locator(layer) {
  layer.draw.locator = {
    label: mapp.dictionary.draw_position,
    layer,
    type: 'Point',
    ...layer.draw.locator,
  };

  layer.draw.locator.btn = mapp.utils.html.node`
    <button
      class="action wide"  
      onclick=${(e) => {
        mapp.utils.getCurrentPosition(async (pos) => {
          const location = {
            layer: layer,
            new: true,
            table: layer.tableCurrent(),
          };

          const coords = ol.proj.transform(
            [parseFloat(pos.coords.longitude), parseFloat(pos.coords.latitude)],
            'EPSG:4326',
            `EPSG:${layer.srid}`,
          );

          location.id = await mapp.utils.xhr({
            body: JSON.stringify({
              [layer.geom]: {
                coordinates: coords,
                type: 'Point',
              },
            }),
            method: 'POST',
            url:
              `${layer.mapview.host}/api/query?` +
              mapp.utils.paramString({
                layer: layer.key,
                locale: layer.mapview.locale.key,
                table: location.table,
                template: 'location_new',
              }),
          });

          mapp.location.get(location);
        });
      }}>
      <span class="material-symbols-outlined">my_location</span>
      ${layer.draw.locator.label}`;

  return layer.draw.locator.btn;
}
