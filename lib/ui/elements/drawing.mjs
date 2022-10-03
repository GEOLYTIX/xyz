export default {
  point,
  locator,
  polygon,
  circle,
  line,
  freehand,
  isoline_here,
  isoline_mapbox,
  rectangle
}

mapp.utils.merge(mapp.dictionaries, {
  en: {
    draw_point: "Point",
    draw_position: "Current Position",
    draw_polygon: "Polygon",
    draw_rectangle: "Rectangle",
    draw_circle: "Circle",
    draw_line: "Line",
    draw_freehand: "Freehand",
    create: "Create"
  },
  de: {
    draw_point: "Punkt",
    draw_polygon: "Polygon",
    draw_rectangle: "Rechteck",
    draw_circle: "Kreis",
    draw_line: "Linie",
    draw_freehand: "Freihand",
    create: "Erstellen"
  },
  cn: {
    draw_point: "点",
    draw_polygon: "多边形",
    draw_rectangle: "长方形",
    draw_circle: "圈",
    draw_line: "线",
    draw_freehand: "任意图形",
  },
  pl: {
    draw_point: "Punkt",
    draw_polygon: "Poligon",
    draw_rectangle: "Prostokąt",
    draw_circle: "Okrag",
    draw_line: "Linia",
    draw_freehand: "Odręcznie",
  },
  ko: {
    draw_point: "점",
    draw_polygon: "다각형",
    draw_rectangle: "직사각형",
    draw_circle: "원",
    draw_line: "선",
    draw_freehand: "손으로 그림(자유 재량)",
  },
  fr: {
    draw_point: "Point",
    draw_polygon: "Polygone",
    draw_rectangle: "Rectangle",
    draw_circle: "Cercle",
    draw_line: "Ligne",
    draw_freehand: "À main levée",
  },
  ja: {
    draw_point: "ポイント",
    draw_polygon: "ポリゴン",
    draw_rectangle: "長方形",
    draw_circle: "丸",
    draw_line: "線",
    draw_freehand: "フリーハンド",
  }
})

function point(_options, draw) {

  const options = Object.assign({}, _options, {
    type: 'Point',
  })
  
  return mapp.utils.html.node`
    <button
      class="flat wide bold primary-colour"
      onclick=${e=>draw(e, options)}>
      ${mapp.dictionary.draw_point}`
}

function locator(options) {
  
  return mapp.utils.html.node`
    <button
      class="flat wide bold primary-colour"
      onclick=${e=>{

        mapp.utils.getCurrentPosition(async (pos) => {

          const location = {
            layer: options.layer,
            new: true
          }

          const coords = ol.proj.transform(
            [parseFloat(pos.coords.longitude), parseFloat(pos.coords.latitude)],
            'EPSG:4326', `EPSG:${options.layer.srid}`)
 
          location.id = await mapp.utils.xhr({
            method: 'POST',
            url: `${location.layer.mapview.host}/api/location/new?` +
              mapp.utils.paramString({
                locale: location.layer.mapview.locale.key,
                layer: location.layer.key,
                table: location.layer.tableCurrent()
              }),
            body: JSON.stringify({
              geometry: {
                type: 'Point',
                coordinates: coords
              }
            })
          })
        
          location.layer.reload()
                                  
          mapp.location.get(location)
        })
        
        
      }}>
      ${mapp.dictionary.draw_position}`
}

function line(_options, draw) {

  const options = Object.assign({}, _options, {
    type: 'LineString',
  })
  
  return mapp.utils.html.node`
    <button
      class="flat wide bold primary-colour"
      onclick=${e=>draw(e, options)}>
      ${mapp.dictionary.draw_line}`
}

function freehand(_options, draw) {

  const options = Object.assign({}, _options, {
    type: 'LineString',
    freehand: true,
  })
  
  return mapp.utils.html.node`
    <button
      class="flat wide bold primary-colour"
      onclick=${e=>draw(e, options)}>
      ${mapp.dictionary.draw_freehand}`
}

function polygon(_options, draw) {

  const options = Object.assign({}, _options, {
    type: 'Polygon'
  })
  
  return mapp.utils.html.node`
    <button
      class="flat wide bold primary-colour"
      onclick=${e=>draw(e, options)}>
      ${mapp.dictionary.draw_polygon}`
}

function circle(_options, draw) {
  
  _options.edit.circle = Object.assign({
    units: 'meter',
    radius: 100,
    tooltip: {
      metric: 'distance'
    }
  }, typeof _options.edit.circle === 'object' && _options.edit.circle || {})

  // Methods to transform input radius.
  const units = {
    meter: v => v,
    km: v => v * 1000,
    miles: v => v * 1609.34,
    meter2: v => Math.sqrt(v / Math.PI),
    km2: v => Math.sqrt(v * 1000000 / Math.PI),
  }

  const unitsDropDown = mapp.utils.html.node`
    <div style="display: grid; grid-template-columns: 100px 1fr; align-items: center;">
      <div style="grid-column: 1;">Units</div>
      <div style="grid-column: 2;">
        ${mapp.ui.elements.dropdown({
          placeholder: _options.edit.circle.units,
          entries: [
            {
              title: 'Meter',
              option: 'meter',
            },
            {
              title: 'KM',
              option: 'km',
            },
            {
              title: 'Miles',
              option: 'miles',
            },
            {
              title: 'Meter²',
              option: 'meter2',
            },
            {
              title: 'KM²',
              option: 'km2',
            },
          ],
          callback: (e, entry) => {
            _options.edit.circle.units = entry.option;
          }
        })}`

  const rangeSlider = mapp.ui.elements.slider({
    label: 'Radius',
    min: 1,
    max: 1000,
    val: _options.edit.circle.radius,
    callback: e => {
      _options.edit.circle.radius = parseInt(e.target.value)
    }
  })

  const btn_centre = mapp.utils.html.node`
    <button
      class="raised wide bold primary-colour"
      onclick=${e => {
        const options = Object.assign({}, _options, {
          type: 'Point',
          geometryFunction: (coordinates) => {
      
            const polygonCircular = new ol.geom.Polygon.circular(
              ol.proj.toLonLat(coordinates),
              units[_options.edit.circle.units](_options.edit.circle.radius),
              64
            );
      
            return polygonCircular.transform("EPSG:4326", "EPSG:3857")
          }
        })

        draw(e, options)
      }}>Set Centre`

  const btn_2p = mapp.utils.html.node`
    <button
      class="raised wide bold primary-colour"
      onclick=${e=>{
        const options = Object.assign({}, _options, {
          type: 'Circle',
          geometryFunction: ol.interaction.Draw.createRegularPolygon(33),
          tooltip: _options.edit.circle.tooltip
        })

        draw(e, options)
      }}>Manual Circle`

  const drawer = mapp.ui.elements.drawer({
    header: mapp.utils.html`
      <h3>Circle</h3>
      <div class="mask-icon expander"></div>`,
    content: mapp.utils.html`<div class="panel flex-col">
      ${unitsDropDown}
      ${rangeSlider}
      ${btn_centre}
      ${btn_2p}`
  })

  return drawer
}

function rectangle(_options, draw) {

  const options = Object.assign({}, _options, {
    type: 'Circle',
    geometryFunction: ol.interaction.Draw.createBox(),
    tooltip: _options.edit.rectangle.tooltip,
  })
  
  return mapp.utils.html.node`
    <button
      class="flat wide bold primary-colour"
      onclick=${e=>draw(e, options)}>
      ${mapp.dictionary.draw_rectangle}`
}

function isoline_here(_options, draw) {

  const options = Object.assign({}, _options, {
    type: 'Point',
    geometryFunction: coordinates => mapp.utils.here.geometryFunction(coordinates, _options.layer, params),
  })

  if (typeof (options.edit.isoline_here) !== 'object') options.edit.isoline_here = {}

  const defaults = {
    'range[type]': 'time',
    range: 10,
    rangeMin: 5,
    rangeMax: 60,
    transportMode: 'car',
    optimizeFor: 'balanced'
  }

  const params = Object.assign(options.edit.isoline_here, defaults)

  const drawer = mapp.ui.elements.isoline_params_here(params)

  drawer.append(mapp.utils.html.node`
    <button
      class="flat wide bold primary-colour"
      onclick=${e=>draw(e, options)}>
      ${mapp.dictionary.create}`)

  return drawer
}

function isoline_mapbox(_options, draw) {

  const options = Object.assign({}, _options, {
    type: 'Point',
    geometryFunction: coordinates => mapp.utils.mapboxGeometryFunction(coordinates, _options.layer, params),
  })

  if (typeof (options.edit.isoline_mapbox) !== 'object') options.edit.isoline_mapbox = {}

  const defaults = {
    profile: 'driving',
    minutes: 10,
    minutesMin: 5,
    minutesMax: 60
  }

  const params = Object.assign(options.edit.isoline_mapbox, defaults)

  const drawer = mapp.ui.elements.isoline_params_mapbox(params)

  drawer.append(mapp.utils.html.node`
    <button
      class="flat wide bold primary-colour"
      onclick=${e=>draw(e, options)}>
      ${mapp.dictionary.create}`)

  return drawer
}