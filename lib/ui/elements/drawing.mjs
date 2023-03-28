export default {
  point,
  line,
  polygon,
  rectangle,
  circle_2pt,
  circle,
  locator,
}

mapp.utils.merge(mapp.dictionaries, {
  en: {
    draw_point: 'Point',
    draw_position: 'Current Position',
    draw_polygon: 'Polygon',
    draw_rectangle: 'Rectangle',
    draw_circle: 'Circle from Centre',
    draw_circle_2pt: 'Manual Circle',
    draw_line: 'Line',
    create: 'Create'
  },
  de: {
    draw_point: 'Punkt',
    draw_polygon: 'Polygon',
    draw_rectangle: 'Rechteck',
    draw_circle: 'Kreis',
    draw_line: 'Linie',
    create: 'Erstellen'
  },
  cn: {
    draw_point: '点',
    draw_polygon: '多边形',
    draw_rectangle: '长方形',
    draw_circle: '圈',
    draw_line: '线',
  },
  pl: {
    draw_point: 'Punkt',
    draw_polygon: 'Poligon',
    draw_rectangle: 'Prostokąt',
    draw_circle: 'Okrag',
    draw_line: 'Linia',
  },
  ko: {
    draw_point: '점',
    draw_polygon: '다각형',
    draw_rectangle: '직사각형',
    draw_circle: '원',
    draw_line: '선',
  },
  fr: {
    draw_point: 'Point',
    draw_polygon: 'Polygone',
    draw_rectangle: 'Rectangle',
    draw_circle: 'Cercle',
    draw_line: 'Ligne',
  },
  ja: {
    draw_point: 'ポイント',
    draw_polygon: 'ポリゴン',
    draw_rectangle: '長方形',
    draw_circle: '丸',
    draw_line: '線',
  }
})

function point(layer) {

  layer.draw.point = Object.assign({
    layer,
    type: 'Point',
  }, typeof layer.draw.point === 'object' && layer.draw.point || {})
  
  return mapp.utils.html.node`
    <button
      class="flat wide bold primary-colour"
      onclick=${e=>{

        const btn = e.target

        if (btn.classList.contains('active')) {
          btn.classList.remove('active')
          layer.mapview.interactions.highlight()
          return;
        }
      
        btn.classList.add('active')
        
        layer.show()
      
        layer.draw.point.callback = feature => {
      
          layer.draw.callback(feature)
      
          if (btn.classList.contains('active')) {
            btn.classList.remove('active')
            layer.mapview.interactions.highlight()
          }
        }
      
        layer.mapview.interactions.draw(layer.draw.point)
        
      }}>
      ${mapp.dictionary.draw_point}`  
}

function line(layer) {

  layer.draw.line = Object.assign({
    layer,
    type: 'LineString',
  }, typeof layer.draw.line === 'object' && layer.draw.line || {})  
  
  return mapp.utils.html.node`
    <button
      class="flat wide bold primary-colour"
      onclick=${e=>{

        const btn = e.target

        if (btn.classList.contains('active')) {
          btn.classList.remove('active')
          layer.mapview.interactions.highlight()
          return;
        }
      
        btn.classList.add('active')
        
        layer.show()
      
        layer.draw.line.callback = feature => {
      
          layer.draw.callback(feature)
      
          if (btn.classList.contains('active')) {
            btn.classList.remove('active')
            layer.mapview.interactions.highlight()
          }
        }
      
        layer.mapview.interactions.draw(layer.draw.line)
        
      }}>
      ${mapp.dictionary.draw_line}`
}

function polygon(layer) {

  layer.draw.polygon = Object.assign({
    layer,
    type: 'Polygon',
  }, typeof layer.draw.polygon === 'object' && layer.draw.polygon || {})
 
  return mapp.utils.html.node`
    <button
      class="flat wide bold primary-colour"
      onclick=${e=>{

        const btn = e.target

        if (btn.classList.contains('active')) {
          btn.classList.remove('active')
          layer.mapview.interactions.highlight()
          return;
        }
      
        btn.classList.add('active')
        
        layer.show()
      
        layer.draw.polygon.callback = feature => {
      
          layer.draw.callback(feature)
      
          if (btn.classList.contains('active')) {
            btn.classList.remove('active')
            layer.mapview.interactions.highlight()
          }
        }
      
        layer.mapview.interactions.draw(layer.draw.polygon)
        
      }}>
      ${mapp.dictionary.draw_polygon}`
}

function rectangle(layer) {

  layer.draw.rectangle = Object.assign({
    layer,
    type: 'Circle',
    geometryFunction: ol.interaction.Draw.createBox(),
  }, typeof layer.draw.rectangle === 'object' && layer.draw.rectangle || {})

  return mapp.utils.html.node`
    <button
      class="flat wide bold primary-colour"
      onclick=${e=>{

        const btn = e.target

        if (btn.classList.contains('active')) {
          btn.classList.remove('active')
          layer.mapview.interactions.highlight()
          return;
        }
      
        btn.classList.add('active')
        
        layer.show()
      
        layer.draw.polygon.callback = feature => {
      
          layer.draw.callback(feature)
      
          if (btn.classList.contains('active')) {
            btn.classList.remove('active')
            layer.mapview.interactions.highlight()
          }
        }
      
        layer.mapview.interactions.draw(layer.draw.polygon)
        
      }}>
      ${mapp.dictionary.draw_rectangle}`
}

function circle_2pt(layer) {

  layer.draw.circle_2pt = Object.assign({
    layer,
    type: 'Circle',
    geometryFunction: ol.interaction.Draw.createRegularPolygon(33),
  }, typeof layer.draw.circle_2pt === 'object' && layer.draw.circle_2pt || {})

 
  layer.draw.circle_2pt.btn = mapp.utils.html.node`
    <button
      class="flat wide bold primary-colour"
      onclick=${e=>{

        const btn = e.target

        if (btn.classList.contains('active')) {
          btn.classList.remove('active')
          layer.mapview.interactions.highlight()
          return;
        }
      
        btn.classList.add('active')
        
        layer.show()
      
        layer.draw.circle_2pt.callback = feature => {
      
          layer.draw.callback(feature)
      
          if (btn.classList.contains('active')) {
            btn.classList.remove('active')
            layer.mapview.interactions.highlight()
          }
        }
      
        layer.mapview.interactions.draw(layer.draw.circle_2pt)
        
      }}>
      ${mapp.dictionary.draw_circle_2pt}`

  return layer.draw.circle_2pt.btn      
}

function circle(layer) {

  layer.draw.circle = Object.assign({
    layer,
    type: 'Point',
    units: 'meter',
    radius: 100,
    geometryFunction: (coordinates) => {

      const polygonCircular = new ol.geom.Polygon.circular(
        ol.proj.toLonLat(coordinates),
        layer.draw.circle.radius,
        64
      );

      return polygonCircular.transform('EPSG:4326', 'EPSG:3857')
    }
  }, typeof layer.draw.circle === 'object' && layer.draw.circle || {})
  
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
          placeholder: layer.draw.circle.units,
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
            layer.draw.circle.units = entry.option;
          }
        })}`

  const rangeSlider = mapp.ui.elements.slider({
    label: 'Radius',
    min: 1,
    max: 1000,
    val: layer.draw.circle.radius,
    callback: e => {
      layer.draw.circle.radius = parseFloat(e.target.value)
    }
  })

  layer.draw.circle.config = mapp.ui.elements.drawer({
    header: mapp.utils.html`
      <h3>Circle</h3>
      <div class="mask-icon expander"></div>`,
    content: mapp.utils.html`<div class="panel flex-col">
      ${unitsDropDown}
      ${rangeSlider}`
  })

  layer.draw.circle.btn = mapp.utils.html.node`
  <button
    class="flat wide bold primary-colour"
    onclick=${e=>{

      const btn = e.target

      if (btn.classList.contains('active')) {
        btn.classList.remove('active')
        layer.mapview.interactions.highlight()
        return;
      }
    
      btn.classList.add('active')
      
      layer.show()
    
      layer.draw.circle.callback = feature => {
    
        layer.draw.callback(feature)
    
        if (btn.classList.contains('active')) {
          btn.classList.remove('active')
          layer.mapview.interactions.highlight()
        }
      }
    
      layer.mapview.interactions.draw(layer.draw.circle)
      
    }}>
    ${mapp.dictionary.draw_circle}`

  return mapp.utils.html.node`<div>
    ${layer.draw.circle.config}
    ${layer.draw.circle.btn}`
}

function locator(layer) {

  layer.draw.locator = Object.assign({
    layer,
    type: 'Point',
  }, typeof layer.draw.locator === 'object' && layer.draw.locator || {})  
  
  return mapp.utils.html.node`
    <button
      class="flat wide bold primary-colour"  
      onclick=${e=>{

        mapp.utils.getCurrentPosition(async (pos) => {

          const location = {
            layer: layer,
            new: true
          }

          const coords = ol.proj.transform(
            [parseFloat(pos.coords.longitude), parseFloat(pos.coords.latitude)],
            'EPSG:4326', `EPSG:${layer.srid}`)
 
          location.id = await mapp.utils.xhr({
            method: 'POST',
            url: `${location.layer.mapview.host}/api/location/new?` +
              mapp.utils.paramString({
                locale: location.layer.mapview.locale.key,
                layer: location.layer.key,
                table: location.layer.tableCurrent()
              }),
            body: JSON.stringify({
              [location.layer.geom]: {
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

function isoline_here(_options, draw) {

  const options = Object.assign({}, _options, {
    type: 'Point',
    geometryFunction: coordinates => mapp.utils.here.geometryFunction(coordinates, _options.layer, options.edit.isoline_here),
  })

  // Turn the config block into object if defined as true in workspace.
  if (typeof (options.edit.isoline_here) !== 'object') options.edit.isoline_here = {}

  const defaults = {
    'range[type]': 'time',
    range: 10,
    rangeMin: 5,
    rangeMax: 60,
    transportMode: 'car',
    optimizeFor: 'balanced'
  }

  const drawer = mapp.ui.elements.isoline_params_here(options.edit.isoline_here)

  // Assign defaults to params after the config drawer has been created.
  options.edit.isoline_here['range[type]'] = options.edit.isoline_here['range[type]'] || 'time'
  options.edit.isoline_here['range'] = options.edit.isoline_here['range'] || 10
  options.edit.isoline_here['transportMode'] = options.edit.isoline_here['transportMode'] || 'car'
  options.edit.isoline_here['optimizeFor'] = options.edit.isoline_here['optimizeFor'] || 'balanced'

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