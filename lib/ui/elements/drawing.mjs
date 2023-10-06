export default {
  point,
  line,
  polygon,
  rectangle,
  circle_2pt,
  circle,
  locator
}

mapp.utils.merge(mapp.dictionaries, {
  en: {
    draw_point: 'Point',
    draw_position: 'Current Position',
    draw_polygon: 'Polygon',
    draw_rectangle: 'Rectangle',
    circle_config: 'Circle configuration',
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

  // Set the default values
  layer.draw.point = Object.assign({
    layer,
    type: 'Point',
  }, typeof layer.draw.point === 'object' && layer.draw.point || {})

  // If a label is provided, use it, otherwise use the default
  let label = layer.draw.point?.label || mapp.dictionary.draw_point

  // Create the button
  layer.draw.point.btn = mapp.utils.html.node`
    <button
      class="flat wide bold primary-colour"
      onclick=${e => {

      const btn = e.target

      if (btn.classList.contains('active')) {

        // Cancel draw interaction.
        btn.classList.remove('active')
        layer.mapview.interactions.highlight()
        return;
      }

      btn.classList.add('active')

      !layer.display && layer.show()

      layer.draw.point.callback = feature => {

        layer.draw.callback(feature, layer.draw.point)

        btn.classList.remove('active')

        delete layer.mapview.interaction

        // Set highlight interaction if no other interaction is current after 400ms.
        setTimeout(() => {
          !layer.mapview.interaction && layer.mapview.interactions.highlight()
        }, 400)

      }

      layer.mapview.interactions.draw(layer.draw.point)

    }}>
      ${label}`

  return layer.draw.point.btn
}

function line(layer) {

  // Set the default values
  layer.draw.line = Object.assign({
    layer,
    type: 'LineString',
  }, typeof layer.draw.line === 'object' && layer.draw.line || {})

  // If a label is provided, use it, otherwise use the default
  let label = layer.draw.line?.label || mapp.dictionary.draw_line


  // Create the button
  layer.draw.line.btn = mapp.utils.html.node`
    <button
      class="flat wide bold primary-colour"
      onclick=${e => {

      const btn = e.target

      if (btn.classList.contains('active')) {

        // Cancel draw interaction.
        btn.classList.remove('active')
        layer.mapview.interactions.highlight()
        return;
      }

      btn.classList.add('active')

      !layer.display && layer.show()

      layer.draw.line.callback = feature => {

        layer.draw.callback(feature, layer.draw.polygon)

        btn.classList.remove('active')

        delete layer.mapview.interaction

        // Set highlight interaction if no other interaction is current after 400ms.
        setTimeout(() => {
          !layer.mapview.interaction && layer.mapview.interactions.highlight()
        }, 400)

      }

      layer.mapview.interactions.draw(layer.draw.line)

    }}>
      ${label}`

  return layer.draw.line.btn
}

function polygon(layer) {

  // Set the default values
  layer.draw.polygon = Object.assign({
    layer,
    type: 'Polygon',
  }, typeof layer.draw.polygon === 'object' && layer.draw.polygon || {})

  // If a label is provided, use it, otherwise use the default
  let label = layer.draw.polygon?.label || mapp.dictionary.draw_polygon

  // Create the button
  layer.draw.polygon.btn = mapp.utils.html.node`
    <button
      class="flat wide bold primary-colour"
      onclick=${e => {

      const btn = e.target

      if (btn.classList.contains('active')) {

        // Cancel draw interaction.
        btn.classList.remove('active')
        layer.mapview.interactions.highlight()
        return;
      }

      btn.classList.add('active')

      !layer.display && layer.show()

      layer.draw.polygon.callback = feature => {

        layer.draw.callback(feature, layer.draw.polygon)

        btn.classList.remove('active')

        delete layer.mapview.interaction

        // Set highlight interaction if no other interaction is current after 400ms.
        setTimeout(() => {
          !layer.mapview.interaction && layer.mapview.interactions.highlight()
        }, 400)

      }

      layer.mapview.interactions.draw(layer.draw.polygon)

    }}>
      ${label}`

  return layer.draw.polygon.btn
}

function rectangle(layer) {

  // Set the default values
  layer.draw.rectangle = Object.assign({
    layer,
    type: 'Circle',
    geometryFunction: ol.interaction.Draw.createBox(),
  }, typeof layer.draw.rectangle === 'object' && layer.draw.rectangle || {})

  // If a label is provided, use it, otherwise use the default
  let label = layer.draw.rectangle?.label || mapp.dictionary.draw_rectangle

  // Create the button
  layer.draw.rectangle.btn = mapp.utils.html.node`
    <button
      class="flat wide bold primary-colour"
      onclick=${e => {

      const btn = e.target

      if (btn.classList.contains('active')) {

        // Cancel draw interaction.
        btn.classList.remove('active')
        layer.mapview.interactions.highlight()
        return;
      }

      btn.classList.add('active')

      !layer.display && layer.show()

      layer.draw.rectangle.callback = feature => {

        layer.draw.callback(feature, layer.draw.rectangle)

        btn.classList.remove('active')

        delete layer.mapview.interaction

        // Set highlight interaction if no other interaction is current after 400ms.
        setTimeout(() => {
          !layer.mapview.interaction && layer.mapview.interactions.highlight()
        }, 400)

      }

      layer.mapview.interactions.draw(layer.draw.rectangle)

    }}>
      ${label}`

  return layer.draw.rectangle.btn
}

function circle_2pt(layer) {

  // Set the default values
  layer.draw.circle_2pt = Object.assign({
    layer,
    type: 'Circle',
    geometryFunction: ol.interaction.Draw.createRegularPolygon(33),
  }, typeof layer.draw.circle_2pt === 'object' && layer.draw.circle_2pt || {})

  // If a label is provided, use it, otherwise use the default
  let label = layer.draw.circle_2pt?.label || mapp.dictionary.draw_circle_2pt

  // Create the button
  layer.draw.circle_2pt.btn = mapp.utils.html.node`
    <button
      class="flat wide bold primary-colour"
      onclick=${e => {

      const btn = e.target

      if (btn.classList.contains('active')) {

        // Cancel draw interaction.
        btn.classList.remove('active')
        layer.mapview.interactions.highlight()
        return;
      }

      btn.classList.add('active')

      !layer.display && layer.show()

      layer.draw.circle_2pt.callback = feature => {

        layer.draw.callback(feature, layer.draw.circle_2pt)

        btn.classList.remove('active')

        delete layer.mapview.interaction

        // Set highlight interaction if no other interaction is current after 400ms.
        setTimeout(() => {
          !layer.mapview.interaction && layer.mapview.interactions.highlight()
        }, 400)

      }

      layer.mapview.interactions.draw(layer.draw.circle_2pt)

    }}>
      ${label}`

  return layer.draw.circle_2pt.btn
}

function circle(layer) {

  // Set the default values
  layer.draw.circle = Object.assign({
    layer,
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
    }
  }, typeof layer.draw.circle === 'object' && layer.draw.circle || {})

  // if label is provided, use it, otherwise use the default
  let label = layer.draw.circle?.label || mapp.dictionary.draw_circle;

  // Create the button
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
    min: layer.draw.circle.radiusMin,
    max: layer.draw.circle.radiusMax,
    val: layer.draw.circle.radius,
    callback: e => {
      layer.draw.circle.radius = parseFloat(e.target.value)
    }
  })

  layer.draw.circle.panel = mapp.utils.html.node`
    <div class="panel flex-col">
      ${unitsDropDown}
      ${rangeSlider}`

  layer.draw.circle.btn = mapp.utils.html.node`
  <button
    class="flat wide bold primary-colour"
    onclick=${e => {

      const btn = e.target

      if (btn.classList.contains('active')) {

        // Cancel draw interaction.
        btn.classList.remove('active')
        layer.mapview.interactions.highlight()
        return;
      }

      // Expand the config drawer.
      btn.previousElementSibling.classList.add('expanded')

      btn.classList.add('active')

      !layer.display && layer.show()

      layer.draw.circle.callback = feature => {

        layer.draw.callback(feature, layer.draw.circle)

        btn.classList.remove('active')

        delete layer.mapview.interaction

        // Set highlight interaction if no other interaction is current after 400ms.
        setTimeout(() => {
          !layer.mapview.interaction && layer.mapview.interactions.highlight()
        }, 400)

      }

      layer.mapview.interactions.draw(layer.draw.circle)

    }}>
    ${label}`

  // Return the config element in a drawer with the interaction toggle button as sibling.
  return mapp.utils.html.node`<div>
    ${mapp.ui.elements.drawer({
    header: mapp.utils.html`
        <h3>${mapp.dictionary.circle_config}</h3>
        <div class="mask-icon expander"></div>`,
    content: layer.draw.circle.panel
  })}
    ${layer.draw.circle.btn}`
}

function locator(layer) {

  layer.draw.locator = Object.assign({
    layer,
    type: 'Point',
  }, typeof layer.draw.locator === 'object' && layer.draw.locator || {})

  layer.draw.locator.btn = mapp.utils.html.node`
    <button
      class="flat wide bold primary-colour"  
      onclick=${e => {

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

  return layer.draw.locator.btn
}