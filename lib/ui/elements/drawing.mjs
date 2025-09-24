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

async function drawOnclick(e, layer, interaction) {
  if (layer.location) {
    const confirmUpdate = await layer.location.confirmUpdate(updateCallback);

    if (confirmUpdate === null) {
      return;
    }

    if (confirmUpdate === true) {
      drawOnclick(e, layer, interaction);
      return;
    }

    function updateCallback() {
      layer.location.renderLocationView();
    }
  }

  const btn = interaction.btn || e.target;

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

  if (!btn.classList.toggle('active')) {
    layer.mapview.interactions.highlight();
    return;
  }

  !layer.display && layer.show();

  layer.mapview.interactions.draw(interaction);

  interaction.helpDialog.header = mapp.utils
    .html`<h3 style="line-height: 2em; margin-right: 1em">${mapp.dictionary.draw_dialog_title}</h3>`;

  interaction.helpDialog.data_id = 'dialog_drawing';

  mapp.ui.elements.helpDialog(interaction.helpDialog);
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
      <span class="notranslate material-symbols-outlined">add_location_alt</span>
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
      <span class="notranslate material-symbols-outlined">polyline</span>
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
      <span class="notranslate material-symbols-outlined">activity_zone</span>
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
    <span class="notranslate material-symbols-outlined">rectangle</span>
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
    <span class="notranslate material-symbols-outlined">outbound</span>
    ${layer.draw.circle_2pt.label}`;

  return layer.draw.circle_2pt.btn;
}

/**
@function circle
@description 
Create a drawer with config interface elements for circle construction.
@param {layer} layer Decorated MAPP Layer.
@return {HTMLElement} A drawer element with controls for circle configuration.
*/
function circle(layer) {
  const helpDialog = {
    content: mapp.utils.html.node`<li>
    <ul>${mapp.dictionary.draw_dialog_begin_drawing}</ul>
    <ul>${mapp.dictionary.draw_dialog_save_single}</ul>`,
  };

  // Set the default values
  const circle = {
    helpDialog,
    label: mapp.dictionary.draw_circle,
    layer,
    type: 'Point',
    units: 'meter',
    unitsConfig: {
      meter: {
        max: 1000,
        min: 1,
        title: 'Meter',
      },
      km: {
        max: 10,
        min: 1,
        title: 'KM',
      },
      miles: {
        max: 10,
        min: 1,
        title: 'Miles',
      },
      meter2: {
        max: 1000,
        min: 1,
        title: 'Meter²',
      },
      km2: {
        max: 10,
        min: 1,
        title: 'KM²',
      },
    },
    unitConversion: {
      km: (v) => v * 1000,
      km2: (v) => Math.sqrt((v * 1000000) / Math.PI),
      meter: (v) => v,
      meter2: (v) => Math.sqrt(v / Math.PI),
      miles: (v) => v * 1609.34,
    },
    ...layer.draw.circle,
  };

  layer.draw.circle = circle;

  circle.unitsOptions ??= Object.keys(circle.unitsConfig);

  circle.unitsOptions = circle.unitsOptions.filter((option) => {
    if (Object.hasOwn(circle.unitsConfig, option)) {
      circle.unitsConfig[option].option = option;
      circle.unitsConfig[option].title ??= option;

      return true;
    } else {
      console.warn(`Unknown circle drawing unit ${option}`);
      return false;
    }
  });

  //Check for whether any valid config options were supplied
  //If not fallback to the full list
  circle.unitsOptions.length &&
    Object.keys(circle.unitsConfig).forEach((config) => {
      if (!circle.unitsOptions.includes(config)) {
        delete circle.unitsConfig[config];
      }
    });

  if (!Object.hasOwn(circle.unitsConfig, circle.units)) {
    circle.units = Object.keys(circle.unitsConfig)[0];
  }

  circle.geometryFunction ??= (coordinates) => {
    const polygonCircular = new ol.geom.Polygon.circular(
      ol.proj.toLonLat(coordinates),
      layer.draw.circle.unitConversion[layer.draw.circle.units](
        layer.draw.circle.radius,
      ),
      64,
    );

    return polygonCircular.transform('EPSG:4326', 'EPSG:3857');
  };

  circle.unitsDropDown = mapp.utils.html.node`<div 
    style="display: grid; grid-template-columns: 100px 1fr; align-items: center;">
      <div style="grid-column: 1;">${mapp.dictionary.units}</div>
      <div style="grid-column: 2;">
        ${mapp.ui.elements.dropdown({
          callback: (e, entry) => setUnits(circle, entry.option),
          entries: Object.values(circle.unitsConfig),
          placeholder: circle.unitsConfig[circle.units].title,
        })}`;

  circle.rangeSlider = mapp.utils.html.node`<div>`;

  setUnits(circle, circle.units);

  circle.btn = mapp.utils.html.node`<button
    class="action wide"
    onclick=${(e) => drawOnclick(e, layer, circle)}>
      <span class="notranslate material-symbols-outlined">add_circle</span>
      ${circle.label}`;

  const content = mapp.utils.html.node`
    <div class="panel flex-col">
      ${circle.unitsDropDown}
      ${circle.rangeSlider}
      ${circle.btn}`;

  // The config elements are not shown.
  if (circle.hidePanel) return circle.btn;

  if (circle.drawer === false) {
    return mapp.utils.html`<h3>${mapp.dictionary.circle_config}</h3>${content}`;
  }

  circle.drawer = mapp.ui.elements.drawer({
    header: mapp.utils.html`
    <h3>${mapp.dictionary.circle_config}</h3>
    <div class="notranslate material-symbols-outlined caret"/>`,
    content,
    popout: circle.popout,
  });

  return circle.drawer;
}

/**
@function setUnits
@description 
The setUnits method updates the circle draw config from an units option.
*/
function setUnits(circle, option) {
  const entry = circle.unitsConfig[option];

  circle.units = entry.option;

  circle.radius ??= entry.min;

  // Update the value of the slider to ensure it is within the new min and max values.
  circle.radius = circle.radius > entry.max ? entry.max : circle.radius;

  // Render the slider after changes
  mapp.utils.render(
    circle.rangeSlider,
    mapp.ui.elements.slider({
      callback: (e) => {
        circle.radius = parseFloat(e);
      },
      max: entry.max,
      min: entry.min,
      val: circle.radius,
    }),
  );
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
      <span class="notranslate material-symbols-outlined">my_location</span>
      ${layer.draw.locator.label}`;

  return layer.draw.locator.btn;
}
