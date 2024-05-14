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
    draw_modal_title: "Drawing Instructions",
    draw_modal_begin_drawing: "Begin Drawing - Click anywhere on the map",
    draw_modal_cancel_drawing: "Cancel Drawing - ESC Key",
    draw_modal_remove_vertex: "Remove Last Vertex - Right Click",
    draw_modal_save: "Save - Double Click",
    draw_modal_save_single: "Save - Single Click",
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
  es: {
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

function deleteModal() {
  const modal = document.querySelector('[data-id=modal_drawing]')
  
  modal && modal.remove()
}

function GenerateModal(type) {

  // If a modal is already present, remove it
  deleteModal();

  // Define the content
  let content;

  // If type is polygon, generate the verbose content
  if (type === 'polygon') {
    content = mapp.utils.html.node`
    <li>
    <ul>${mapp.dictionary.draw_modal_begin_drawing}</ul>
    <ul>${mapp.dictionary.draw_modal_cancel_drawing}
    <ul>${mapp.dictionary.draw_modal_remove_vertex}</ul>
    <ul>${mapp.dictionary.draw_modal_save}</ul>
    </li>`
  } else {

    // Generate the default content
    content = mapp.utils.html.node`
    <li>
    <ul>${mapp.dictionary.draw_modal_begin_drawing}</ul>
    <ul>${mapp.dictionary.draw_modal_save_single}</ul>
    </li>`
  }

  // Add the header
  const header = mapp.utils.html`<h3>${mapp.dictionary.draw_modal_title}</h3>`;

  // Create the modal
  mapp.ui.elements.modal({
    data_id: 'modal_drawing',
    header: header,
    target: document.getElementById('Map'),
    content: content,
    height: 'auto',
    width: '200px',
    css_style: 'padding: 0.5em;',
    top: 30,
    left: 60,
    contained: true,
    close: true
  });

}

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

        if (!btn.classList.toggle('active')) {

          deleteModal();
          return;
        }

        // Generate the modal 
        if (layer.draw.point.infoModal) {
          GenerateModal();
        }

        !layer.display && layer.show()

        layer.draw.point.callback = feature => {

          layer.draw.callback(feature, layer.draw.point)

          btn.classList.remove('active')

          delete layer.mapview.interaction

          deleteModal();

          // Set highlight interaction if no other interaction is current after 400ms.
          setTimeout(() => {
            !layer.mapview.interaction && layer.mapview.interactions.highlight()
          }, 400)

        }

        layer.mapview.interactions.draw(layer.draw.point)

      }}>${label}`

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

        if (!btn.classList.toggle('active')) {

          layer.mapview.interaction.finish()
          return;
        }

        // Generate the modal 
        GenerateModal();

        !layer.display && layer.show()

        layer.draw.line.callback = feature => {

          layer.draw.callback(feature, layer.draw.polygon)

          btn.classList.remove('active')

          delete layer.mapview.interaction

          deleteModal();

          // Set highlight interaction if no other interaction is current after 400ms.
          setTimeout(() => {
            !layer.mapview.interaction && layer.mapview.interactions.highlight()
          }, 400)

        }

        layer.mapview.interactions.draw(layer.draw.line)

        btn.classList.add('active')

      }}>${label}`

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

        deleteModal();

      } else {

        btn.classList.add('active')
        // Generate the modal 
        if (layer.draw.polygon.infoModal) {
          GenerateModal('polygon');
        }
      }
      !layer.display && layer.show()

      layer.draw.polygon.callback = feature => {

        layer.draw.callback(feature, layer.draw.polygon)

        btn.classList.remove('active')

        delete layer.mapview.interaction;

        deleteModal();

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

        deleteModal();

      } else {

        btn.classList.add('active')
        // Generate the modal 
        if (layer.draw.rectangle.infoModal) {
          GenerateModal();
        }
      }

      !layer.display && layer.show()

      layer.draw.rectangle.callback = feature => {

        layer.draw.callback(feature, layer.draw.rectangle)

        btn.classList.remove('active')

        deleteModal();

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
  layer.draw.circle_2pt = {
    layer,
    type: 'Circle',
    geometryFunction: ol.interaction.Draw.createRegularPolygon(33),
    label: mapp.dictionary.draw_circle_2pt,
    ...layer.draw.circle_2pt
  }

  // Create the button
  layer.draw.circle_2pt.btn = mapp.utils.html.node`
    <button
      class="flat wide bold primary-colour"
      onclick=${drawCircle_2pt}>${layer.draw.circle_2pt.label}`

  function drawCircle_2pt(e) {

    const btn = e.target

    if (btn.classList.contains('active')) {

      // Cancel draw interaction.
      btn.classList.remove('active')
      layer.mapview.interactions.highlight()

      deleteModal();

    } else {

      btn.classList.add('active')
      // Generate the modal 
      if (layer.draw.circle_2pt.infoModal) {
        GenerateModal();
      }
    }

    !layer.display && layer.show()

    layer.draw.circle_2pt.callback = feature => {

      layer.draw.callback(feature, layer.draw.circle_2pt)

      btn.classList.remove('active')

      deleteModal();

      delete layer.mapview.interaction

      // Set highlight interaction if no other interaction is current after 400ms.
      setTimeout(() => {
        !layer.mapview.interaction && layer.mapview.interactions.highlight()
      }, 400)

    }

    layer.mapview.interactions.draw(layer.draw.circle_2pt)
  }

  return layer.draw.circle_2pt.btn
}

function circle(layer) {

  // Set the default values
  layer.draw.circle = {
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
    },
    label: mapp.dictionary.draw_circle,
    ...layer.draw.circle
  }

  const unitsDropDown = mapp.utils.html.node`
    <div style="display: grid; grid-template-columns: 100px 1fr; align-items: center;">
      <div style="grid-column: 1;">${mapp.dictionary.units}</div>
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
    label: mapp.dictionary.radius,
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
    onclick=${drawCircle}>${layer.draw.circle.label}`

  function drawCircle(e) {

    const btn = e.target

    if (btn.classList.contains('active')) {

      // Cancel draw interaction.
      btn.classList.remove('active')
      layer.mapview.interactions.highlight()

      deleteModal();

    } else {

      btn.classList.add('active')
      // Generate the modal 
      if (layer.draw.circle.infoModal) {
        GenerateModal();
      }
    }

    // Expand the config drawer.
    btn.previousElementSibling.classList.add('expanded')

    !layer.display && layer.show()

    layer.draw.circle.callback = feature => {

      layer.draw.callback(feature, layer.draw.circle)

      btn.classList.remove('active')

      deleteModal();

      delete layer.mapview.interaction


      // Set highlight interaction if no other interaction is current after 400ms.
      setTimeout(() => {
        !layer.mapview.interaction && layer.mapview.interactions.highlight()
      }, 400)
    }

    layer.mapview.interactions.draw(layer.draw.circle)
  }

  // The config elements are not shown.
  if (layer.draw.circle.hidePanel) return layer.draw.circle.btn

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

    }}>${mapp.dictionary.draw_position}`

  return layer.draw.locator.btn
}