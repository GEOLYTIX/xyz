/**
### /ui/elements/drawing

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
  drawOnclick
}

mapp.utils.merge(mapp.dictionaries, {
  en: {
    draw_dialog_title: 'Drawing Instructions',
    draw_dialog_begin_drawing: 'Begin Drawing - Click anywhere on the map',
    draw_dialog_cancel_drawing: 'Cancel Drawing - ESC Key',
    draw_dialog_remove_vertex: 'Remove Last Vertex - Right Click',
    draw_dialog_save: 'Save - Double Click',
    draw_dialog_save_single: 'Save - Single Click',
    draw_point: 'Point',
    draw_position: 'Current Position',
    draw_polygon: 'Polygon',
    draw_rectangle: 'Rectangle',
    circle_config: 'Circle configuration',
    draw_circle: 'Circle from Centre',
    draw_circle_2pt: 'Manual Circle',
    radius: 'Radius',
    units: 'Units',
    draw_line: 'Line',
    create: 'Create',
  },
  de: {
    draw_point: 'Punkt',
    draw_position: 'Aktueller Standort',
    draw_polygon: 'Polygon',
    draw_rectangle: 'Rechteck',
    circle_config: 'Zirkel Einstellung',
    draw_circle: 'Zirkel',
    draw_circle_2pt: '2 Punkt Zirkel',
    radius: 'Radius',
    units: 'Masseinheit',
    draw_line: 'Linie',
    create: 'Erstellen',
  },
  zh: {
    draw_point: '点',
    draw_position: '当前位置',
    draw_polygon: '多边形',
    draw_rectangle: '长方形',
    circle_config: '圆形调整',
    draw_circle: '由中心点外沿绘制圆形',
    draw_circle_2pt: '手绘圆形',
    radius: '半径',
    units: '单位',
    draw_line: '线条',
    create: '创建',
  },
  zh_tw: {
    draw_point: '點',
    draw_position: '當前位置',
    draw_polygon: '多邊形',
    draw_rectangle: '長方形',
    circle_config: '圓形調整',
    draw_circle: '由中心點外沿繪製圓形',
    draw_circle_2pt: '手繪圓形',
    radius: '半徑',
    units: '單位',
    draw_line: '線條',
    create: '創建',
  },
  pl: {
    draw_dialog_title: 'Instrukcja obsługi',
    draw_dialog_begin_drawing: 'Rozpoczęcie rysowania - kliknij w dowolne miejsce na mapie',
    draw_dialog_cancel_drawing: 'Usunięcie rysunku - kliknąć klawisz ESC',
    draw_dialog_remove_vertex: 'Usuń ostatni wierzchołek - Kliknij prawym przyciskiem myszy',
    draw_dialog_save: 'Zapisz - podwójne kliknięcie',
    draw_dialog_save_single: 'Zapisz - pojedyncze kliknięcie',
    draw_point: 'Punkt',
    draw_position: 'Aktualna pozycja',
    draw_polygon: 'Poligon',
    draw_rectangle: 'Prostokąt',
    circle_config: 'Konfiguracja okręgu',
    draw_circle: 'Okrąg od centrum',
    draw_circle_2pt: 'Okrąg odręczny',
    radius: 'Promień',
    units: 'Jednostki',
    draw_line: 'Linia',
    create: 'Utwórz',
  },
  fr: {
    draw_point: 'Point',
    draw_position: 'Position Actuelle',
    draw_polygon: 'Polygone',
    draw_rectangle: 'Rectangle',
    circle_config: 'Paramétrage du cercle',
    draw_circle: 'Cercle à partir du centre',
    draw_circle_2pt: 'Cercle Manuel',
    radius: 'Rayon',
    units: 'Unité',
    draw_line: 'Ligne',
    create: 'Créer',
  },
  ja: {
    draw_point: 'ポイント',
    draw_position: '現地',
    draw_polygon: 'ポリゴン',
    draw_rectangle: '長方形',
    circle_config: '丸の構成',
    draw_circle: '真ん中からの丸',
    draw_circle_2pt: 'マニュアルの丸',
    radius: '半径',
    units: '単位',
    draw_line: '線',
    create: '作成',
  },
  esp: {
    draw_point: 'Punto',
    draw_position: 'Posición actual',
    draw_polygon: 'Polígono',
    draw_rectangle: 'Rectángulo',
    circle_config: 'Configuración del círculo',
    draw_circle: 'Círculo desde el centro',
    draw_circle_2pt: 'Círculo manual',
    radius: 'Radio',
    units: 'Unidad',
    draw_line: 'Línea',
    create: 'Crear',
  },
  tr: {
    draw_point: 'Nokta',
    draw_position: 'Mevcut konum',
    draw_polygon: 'Poligon',
    draw_rectangle: 'Dikdortgen',
    circle_config: 'Cember ayarlari',
    draw_circle: 'Merkezden cember',
    draw_circle_2pt: 'Manuel cember',
    radius: 'Yaricap',
    units: 'Birimler',
    draw_line: 'Cizgi',
    create: 'Olustur',
  },
  it: {
    draw_point: 'Punto',
    draw_position: 'Posizione attuale',
    draw_polygon: 'Poligono',
    draw_rectangle: 'Rettangolo',
    circle_config: 'Configurazione cerchio',
    draw_circle: 'Cerchio dal centro',
    draw_circle_2pt: 'Cerchio manuale',
    radius: 'Raggio',
    units: 'Unità',
    draw_line: 'Linea',
    create: 'Creare',
  },
  th: {
    draw_point: 'จุด',
    draw_position: 'ตำแหน่งปัจจุบัน',
    draw_polygon: 'รูปหลายเหลี่ยม',
    draw_rectangle: 'สี่เหลี่ยมผืนผ้า',
    circle_config: 'การกำหนดค่าวงกลม',
    draw_circle: 'วงกลมจากศูนย์กลาง',
    draw_circle_2pt: 'วงกลมแบบแมนนวล',
    radius: 'รัศมี',
    units: 'หน่วย',
    draw_line: 'เส้น',
    create: 'สร้าง',
  }
})

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

  const btn = e.target

  if (!btn.classList.toggle('active')) {

    layer.mapview.interaction.finish()
    return;
  }

  !layer.display && layer.show()

  interaction.callback ??= feature => {

    mapp.location.create(feature, interaction, layer)

    btn.classList.remove('active')

    delete layer.mapview.interaction

    mapp.ui.elements.helpDialog();

    // Set highlight interaction if no other interaction is current after 400ms.
    setTimeout(() => {
      !layer.mapview.interaction && layer.mapview.interactions.highlight()
    }, 400)
  }

  layer.mapview.interactions.draw(interaction)

  interaction.helpDialog.header = mapp.utils.html`<h3>${mapp.dictionary.draw_dialog_title}</h3>`;

  interaction.helpDialog.data_id = 'dialog_drawing';

  mapp.ui.elements.helpDialog(interaction.helpDialog);

  btn.classList.add('active')
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
    <ul>${mapp.dictionary.draw_dialog_save_single}</ul>`
  }

  // Set the default values
  layer.draw.point = {
    layer,
    label: mapp.dictionary.draw_point,
    helpDialog,
    type: 'Point',
    ...layer.draw.point
  }

  // Create the button
  layer.draw.point.btn = mapp.utils.html.node`
    <button
      class="flat wide bold primary-colour"
      onclick=${e => drawOnclick(e, layer, layer.draw.point)}>
      ${layer.draw.point.label}`

  return layer.draw.point.btn
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
    <ul>${mapp.dictionary.draw_dialog_save_single}</ul>`
  }

  // Set the default values
  layer.draw.line = {
    layer,
    label: mapp.dictionary.draw_line,
    helpDialog,
    type: 'LineString',
    ...layer.draw.line
  }

  // Create the button
  layer.draw.line.btn = mapp.utils.html.node`
    <button
      class="flat wide bold primary-colour"
      onclick=${e => drawOnclick(e, layer, layer.draw.line)}>
      ${layer.draw.line.label}`

  return layer.draw.line.btn
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
    <ul>${mapp.dictionary.draw_dialog_save}</ul>`
  }

  // Set the default values
  layer.draw.polygon = {
    layer,
    label: mapp.dictionary.draw_polygon,
    helpDialog,
    type: 'Polygon',
    ...layer.draw.polygon
  }

  // Create the button
  layer.draw.polygon.btn = mapp.utils.html.node`
    <button
      class="flat wide bold primary-colour"
      onclick=${e => drawOnclick(e, layer, layer.draw.polygon)}>
      ${layer.draw.polygon.label}`

  return layer.draw.polygon.btn
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
    <ul>${mapp.dictionary.draw_dialog_save_single}</ul>`
  }

  // Set the default values
  layer.draw.rectangle = {
    layer,
    label: mapp.dictionary.draw_rectangle,
    helpDialog,
    type: 'Circle',
    geometryFunction: ol.interaction.Draw.createBox(),
    ...layer.draw.rectangle
  }

  // Create the button
  layer.draw.rectangle.btn = mapp.utils.html.node`
  <button
    class="flat wide bold primary-colour"
    onclick=${e => drawOnclick(e, layer, layer.draw.rectangle)}>
    ${layer.draw.rectangle.label}`

  return layer.draw.rectangle.btn
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
    <ul>${mapp.dictionary.draw_dialog_save_single}</ul>`
  }

  // Set the default values
  layer.draw.circle_2pt = {
    layer,
    type: 'Circle',
    helpDialog,
    geometryFunction: ol.interaction.Draw.createRegularPolygon(33),
    label: mapp.dictionary.draw_circle_2pt,
    ...layer.draw.circle_2pt
  }

  // Create the button
  layer.draw.circle_2pt.btn = mapp.utils.html.node`
  <button
    class="flat wide bold primary-colour"
    onclick=${e => drawOnclick(e, layer, layer.draw.circle_2pt)}>
    ${layer.draw.circle_2pt.label}`

  return layer.draw.circle_2pt.btn
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
    <ul>${mapp.dictionary.draw_dialog_save_single}</ul>`
  }

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
      meter: v => v,
      km: v => v * 1000,
      miles: v => v * 1609.34,
      meter2: v => Math.sqrt(v / Math.PI),
      km2: v => Math.sqrt(v * 1000000 / Math.PI),
    },
    geometryFunction: (coordinates) => {

      const polygonCircular = new ol.geom.Polygon.circular(
        ol.proj.toLonLat(coordinates),
        layer.draw.circle.unitConversion[layer.draw.circle.units](layer.draw.circle.radius),
        64
      );

      return polygonCircular.transform('EPSG:4326', 'EPSG:3857')
    },
    label: mapp.dictionary.draw_circle,
    ...layer.draw.circle
  }

  // Build an array for the unit, label, min and max values.
  const units = [
    {
      option: 'meter',
      title: 'Meter',
      min: 1,
      max: 1000
    },
    {
      option: 'km',
      title: 'KM',
      min: 1,
      max: 10
    },
    {
      option: 'miles',
      title: 'Miles',
      min: 1,
      max: 10
    },
    {
      option: 'meter2',
      title: 'Meter²',
      min: 1,
      max: 1000
    },
    {
      option: 'km2',
      title: 'KM²',
      min: 1,
      max: 10
    }
  ];

  const unitsDropDown = mapp.utils.html.node`
    <div style="display: grid; grid-template-columns: 100px 1fr; align-items: center;">
      <div style="grid-column: 1;">${mapp.dictionary.units}</div>
      <div style="grid-column: 2;">
        ${mapp.ui.elements.dropdown({
    placeholder: units.find(entry => entry.option === layer.draw.circle.units).title,
    entries: units,
    callback: (e, entry) => {

      layer.draw.circle.units = entry.option;
      layer.draw.circle.radiusMin = entry.min;
      layer.draw.circle.radiusMax = entry.max;

      // Update the value of the slider to ensure it is within the new min and max values.
      layer.draw.circle.radius = layer.draw.circle.radius > layer.draw.circle.radiusMax ? layer.draw.circle.radiusMax : layer.draw.circle.radius;
    
      // Render the slider after changes
      createSlider();
    }
  })}`

  const rangeSlider = mapp.utils.html.node`<div>`;

  createSlider();

/**
@function createSlider
@description Creates a slider for the circle radius, renders this slider into the rangeSlider div, and assigns a callback function to update the radius value.
*/

  function createSlider() {
    mapp.utils.render(rangeSlider, mapp.ui.elements.slider({
      min: layer.draw.circle.radiusMin,
      max: layer.draw.circle.radiusMax,
      val: layer.draw.circle.radius,
      callback: e => {
        layer.draw.circle.radius = parseFloat(e)
      }
    })
    )
  }

  layer.draw.circle.panel = mapp.utils.html.node`
    <div class="panel flex-col">
      ${unitsDropDown}
      ${rangeSlider}`

  layer.draw.circle.btn = mapp.utils.html.node`
  <button
    class="flat wide bold primary-colour"
    onclick=${e => drawOnclick(e, layer, layer.draw.circle)}>
    ${layer.draw.circle.label}`

  // The config elements are not shown.
  if (layer.draw.circle.hidePanel) return layer.draw.circle.btn

  // Return the config element in a drawer with the interaction toggle button as sibling.
  return mapp.utils.html.node`<div>
    ${mapp.ui.elements.drawer({
    header: mapp.utils.html`
      <h3>${mapp.dictionary.circle_config}</h3>
      <div class="mask-icon expander"></div>`,
    content: layer.draw.circle.panel
  })}${layer.draw.circle.btn}`
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
    ...layer.draw.locator
  }

  layer.draw.locator.btn = mapp.utils.html.node`
    <button
      class="flat wide bold primary-colour"  
      onclick=${e => {

      mapp.utils.getCurrentPosition(async (pos) => {

        const location = {
          layer: layer,
          table: layer.tableCurrent(),
          new: true
        }

        const coords = ol.proj.transform(
          [parseFloat(pos.coords.longitude), parseFloat(pos.coords.latitude)],
          'EPSG:4326', `EPSG:${layer.srid}`)

        location.id = await mapp.utils.xhr({
          method: 'POST',
          url: `${layer.mapview.host}/api/query?` +
            mapp.utils.paramString({
              template: 'location_new',
              locale: layer.mapview.locale.key,
              layer: layer.key,
              table: location.table
            }),
          body: JSON.stringify({
            [layer.geom]: {
              type: 'Point',
              coordinates: coords
            }
          })
        })

        mapp.location.get(location)
      })

    }}>${layer.draw.locator.label}`

  return layer.draw.locator.btn
}