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
  },
  de: {
    draw_point: "Punkt",
    draw_polygon: "Polygon",
    draw_rectangle: "Rechteck",
    draw_circle: "Kreis",
    draw_line: "Linie",
    draw_freehand: "Freihand",
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
            layer: options.layer
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

  const options = Object.assign({}, _options, {
    type: 'Circle',
    geometryFunction: ol.interaction.Draw.createRegularPolygon(33),
    tooltip: _options.edit.circle.tooltip,
  })
  
  return mapp.utils.html.node`
    <button
      class="flat wide bold primary-colour"
      onclick=${e=>draw(e, options)}>
      ${mapp.dictionary.draw_circle}`
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
      Create Isoline`)

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
      Create Isoline`)

  return drawer
}