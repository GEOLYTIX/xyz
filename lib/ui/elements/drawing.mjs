/**
### /ui/elements/drawing

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
  point,
  line,
  polygon,
  rectangle,
  circle_2pt,
  circle,
  locator,
  drawOnclick,
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
    .html`<h3>${mapp.dictionary.draw_dialog_title}</h3>`;

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
    layer,
    label: mapp.dictionary.draw_point,
    helpDialog,
    type: 'Point',
    ...layer.draw.point,
  };

  // Create the button
  layer.draw.point.btn = mapp.utils.html.node`
    <button
      class="flat wide bold primary-colour"
      onclick=${(e) => drawOnclick(e, layer, layer.draw.point)}>
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
    layer,
    label: mapp.dictionary.draw_line,
    helpDialog,
    type: 'LineString',
    ...layer.draw.line,
  };

  // Create the button
  layer.draw.line.btn = mapp.utils.html.node`
    <button
      class="flat wide bold primary-colour"
      onclick=${(e) => drawOnclick(e, layer, layer.draw.line)}>
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
    layer,
    label: mapp.dictionary.draw_polygon,
    helpDialog,
    type: 'Polygon',
    ...layer.draw.polygon,
  };

  // Create the button
  layer.draw.polygon.btn = mapp.utils.html.node`
    <button
      class="flat wide bold primary-colour"
      onclick=${(e) => drawOnclick(e, layer, layer.draw.polygon)}>
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
    layer,
    label: mapp.dictionary.draw_rectangle,
    helpDialog,
    type: 'Circle',
    geometryFunction: ol.interaction.Draw.createBox(),
    ...layer.draw.rectangle,
  };

  // Create the button
  layer.draw.rectangle.btn = mapp.utils.html.node`
  <button
    class="flat wide bold primary-colour"
    onclick=${(e) => drawOnclick(e, layer, layer.draw.rectangle)}>
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
    layer,
    type: 'Circle',
    helpDialog,
    geometryFunction: ol.interaction.Draw.createRegularPolygon(33),
    label: mapp.dictionary.draw_circle_2pt,
    ...layer.draw.circle_2pt,
  };

  // Create the button
  layer.draw.circle_2pt.btn = mapp.utils.html.node`
  <button
    class="flat wide bold primary-colour"
    onclick=${(e) => drawOnclick(e, layer, layer.draw.circle_2pt)}>
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
    layer,
    helpDialog,
    type: 'Point',
    units: 'meter',
    radius: 100,
    radiusMin: 1,
    radiusMax: 1000,

    // Methods to transform input radius.
    unitConversion: {
      meter: (v) => v,
      km: (v) => v * 1000,
      miles: (v) => v * 1609.34,
      meter2: (v) => Math.sqrt(v / Math.PI),
      km2: (v) => Math.sqrt((v * 1000000) / Math.PI),
    },
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
    label: mapp.dictionary.draw_circle,
    ...layer.draw.circle,
  };

  // Build an array for the unit, label, min and max values.
  const units = [
    {
      option: 'meter',
      title: 'Meter',
      min: 1,
      max: 1000,
    },
    {
      option: 'km',
      title: 'KM',
      min: 1,
      max: 10,
    },
    {
      option: 'miles',
      title: 'Miles',
      min: 1,
      max: 10,
    },
    {
      option: 'meter2',
      title: 'Meter²',
      min: 1,
      max: 1000,
    },
    {
      option: 'km2',
      title: 'KM²',
      min: 1,
      max: 10,
    },
  ];

  const unitsDropDown = mapp.utils.html.node`
    <div style="display: grid; grid-template-columns: 100px 1fr; align-items: center;">
      <div style="grid-column: 1;">${mapp.dictionary.units}</div>
      <div style="grid-column: 2;">
        ${mapp.ui.elements.dropdown({
          placeholder: units.find(
            (entry) => entry.option === layer.draw.circle.units,
          ).title,
          entries: units,
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
        min: layer.draw.circle.radiusMin,
        max: layer.draw.circle.radiusMax,
        val: layer.draw.circle.radius,
        callback: (e) => {
          layer.draw.circle.radius = parseFloat(e);
        },
      }),
    );
  }

  layer.draw.circle.btn = mapp.utils.html.node`
    <button
      class="flat wide bold primary-colour"
      onclick=${(e) => drawOnclick(e, layer, layer.draw.circle)}>
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

  layer.draw.circle.drawer ??= {};

  let dialogPopout = '';
  if (layer.draw.circle.drawer.dialog) {
    dialogPopout = mapp.utils.html`<button class="material-symbols-outlined"
    onclick=${(e) => {
      //Prevent header event bubbling
      e.stopPropagation();

      layer.draw.circle.drawer.drawer.style.display = 'none';

      if (layer.draw.circle.drawer?.dialog?.show) {
        //Put the content back in the dialog
        layer.draw.circle.drawer.dialog.node
          .querySelector('.content')
          .append(content);

        layer.draw.circle.drawer.show();

        return;
      }

      Object.assign(layer.draw.circle.drawer, {
        data_id: `${layer.key}-circle-drawing-dialog`,
        header: mapp.utils.html`<h3>${mapp.dictionary.circle_config}</h3>`,
        target: document.getElementById('Map'),
        content: content,
        height: 'auto',
        left: '6em',
        top: '9.5em',
        class: 'box-shadow',
        css_style: 'min-width: 300px;',
        containedCentre: true,
        contained: true,
        headerDrag: true,
        minimizeBtn: true,
        closeBtn: true,
        onClose: (e) => {
          //Restore the drawer
          layer.draw.circle.drawer.drawer.style.removeProperty('display');

          //restore the content to the drawer
          layer.draw.circle.drawer.drawer.append(content);
        },
      });

      mapp.ui.elements.dialog(layer.draw.circle.drawer);
    }}>open_in_new</button>`;
  }

  layer.draw.circle.drawer.drawer = mapp.ui.elements.drawer({
    header: mapp.utils.html`
    <h3>${mapp.dictionary.circle_config}</h3>
    ${dialogPopout}
    <div class="material-symbols-outlined caret"/>`,
    content,
  });

  return layer.draw.circle.drawer.drawer;
}

/**
@function locator
@description Creates a button for drawing a point at your current location.
@param {layer} layer Decorated MAPP Layer.
@return {HTMLElement} The button element.
*/
function locator(layer) {
  layer.draw.locator = {
    layer,
    label: mapp.dictionary.draw_position,
    type: 'Point',
    ...layer.draw.locator,
  };

  layer.draw.locator.btn = mapp.utils.html.node`
    <button
      class="flat wide bold primary-colour"  
      onclick=${(e) => {
        mapp.utils.getCurrentPosition(async (pos) => {
          const location = {
            layer: layer,
            table: layer.tableCurrent(),
            new: true,
          };

          const coords = ol.proj.transform(
            [parseFloat(pos.coords.longitude), parseFloat(pos.coords.latitude)],
            'EPSG:4326',
            `EPSG:${layer.srid}`,
          );

          location.id = await mapp.utils.xhr({
            method: 'POST',
            url:
              `${layer.mapview.host}/api/query?` +
              mapp.utils.paramString({
                template: 'location_new',
                locale: layer.mapview.locale.key,
                layer: layer.key,
                table: location.table,
              }),
            body: JSON.stringify({
              [layer.geom]: {
                type: 'Point',
                coordinates: coords,
              },
            }),
          });

          mapp.location.get(location);
        });
      }}>${layer.draw.locator.label}`;

  return layer.draw.locator.btn;
}
