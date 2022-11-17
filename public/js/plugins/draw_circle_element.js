export default (function(){

  // Methods to transform input radius.
  const units = {
    meter: v => v,
    km: v => v * 1000,
    miles: v => v * 1609.34,
    meter2: v => Math.sqrt(v / Math.PI),
    km2: v => Math.sqrt(v * 1000000 / Math.PI),
  }

  mapp.ui.elements.drawing.circle_from_center = (_options, draw) => {

    const options = Object.assign({}, _options, {
      type: 'Point',
      geometryFunction: (coordinates) => {

        const polygonCircular = new ol.geom.Polygon.circular(
          ol.proj.toLonLat(coordinates),
          units[options.edit.circle_from_center.units](options.edit.circle_from_center.radius),
          64
        );

        return polygonCircular.transform("EPSG:4326", "EPSG:3857")
      }
    })

    const unitsDropDown = mapp.utils.html.node`
    <div style="display: grid; grid-template-columns: 100px 1fr; align-items: center;">
      <div style="grid-column: 1;">Units</div>
      <div style="grid-column: 2;">
        ${mapp.ui.elements.dropdown({
          placeholder: options.edit.circle_from_center.units || 'Meter',
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
            options.edit.circle_from_center.units = entry.option;
          }
        })}`


    const rangeSlider = mapp.ui.elements.slider({
      label: 'Radius',
      min: 1,
      max: 1000,
      val: options.edit.circle_from_center.radius || 200,
      callback: e => {
        options.edit.circle_from_center.radius = parseInt(e.target.value)
      }
    })

    const btn = mapp.utils.html.node`
    <button
      class="raised wide bold primary-colour"
      onclick=${e=>draw(e, options)}>
      Set Centre`

    const drawer = mapp.ui.elements.drawer({
      header: mapp.utils.html`
        <h3>Circle</h3>
        <div class="mask-icon expander"></div>`,
      content: mapp.utils.html`<div class="panel">
        ${unitsDropDown}
        ${rangeSlider}
        ${btn}`
    })

    return drawer
    
  }

})()