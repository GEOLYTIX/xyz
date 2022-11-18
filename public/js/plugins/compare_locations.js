export default (function(){

  const style = document.createElement('style');

  style.innerHTML = `
    .comparison-grid {
      display:grid;
      grid-template-columns: 240px repeat(auto-fit, minmax(0, 1fr));
      padding: 20px;
    }

    .comparison-grid .row-field {
      padding-right: 10px;
      border-bottom: 1px solid #ddd;
    }

    .comparison-grid .remove-btn{
      font-weight: bold;
      color: red;
    }`;

  document.head.appendChild(style);

  mapp.plugins.compare_locations = layer => {

    Object.assign(layer.compare_locations,{
      map: new Map(),
      add_location,
      remove_key,
      draw_callback: drawTable
    })

    function add_location(location) {

      if (layer.compare_locations.map.has(location.hook)) {
        //layer.compare_locations.remove_key(location.hook)
        return;
      }

      const fields = layer.compare_locations.fields.map(field => {

        return Object.assign({}, field, {
          value: location.infoj
            .find(entry => entry.field === field.field)?.value
        })

      })

      layer.compare_locations.map.set(
        location.hook,
        fields
      )

      layer.compare_locations.tab?.show()

      layer.compare_locations.draw_callback(layer)
    }

    function remove_key(key) {

      layer.compare_locations.map.delete(key)

      layer.compare_locations.draw_callback(layer)

      if (!layer.compare_locations.map.size) {
        layer.compare_locations.tab.remove()
      }
    }

    mapp.ui.locations.entries.add_to_comparison = entry => {

      const btn = mapp.utils.html.node`
        <button
          class="raised wide bold primary-colour"
          onclick=${e=>entry.location.layer.compare_locations.add_location(entry.location)}>
          Add to comparison`
    
      return btn
    }

    // Find tabview element from data-id attribute.
    const tabview = document.querySelector(`[data-id=${layer.compare_locations.target}]`)

    // Return if the named tabview is not found in document.
    if (!tabview) return;

    // Create tab object.
    layer.compare_locations.tab = {
      title: "Compare Locations",
      panel: mapp.utils.html.node`<div class="panel">`
    }

    // Add tab to tabview.
    tabview.dispatchEvent(new CustomEvent('addTab', {
      detail: layer.compare_locations.tab
    }))

    // Show the tab is display flag is set.
    layer.compare_locations.display && layer.compare_locations.tab.show()
  }

  function drawTable(layer) {

    if (!layer.compare_locations.tab) return;

    const labels = layer.compare_locations.fields
      .map((field, i) => mapp.utils.html`
        <div class="row-field bold" style="${`
          grid-column:1;
          grid-row:${i + 1};`}">
          ${field.title}`)

    const location_fields = Array.from(layer.compare_locations.map.values())
      .map((loc, i) => loc
        .map((field, ii) => mapp.utils.html`
          <div class="row-field" style="${`
            grid-column:${i + 2};
            grid-row:${ii + 1};`}">
            ${field.value}`))

    const remove_btns = Array.from(layer.compare_locations.map.keys())
      .map((key, i) => mapp.utils.html`
        <button class="remove-btn hover" style="${`
          grid-column:${i + 2};
          grid-row:${layer.compare_locations.fields.length + 1};`}"
          onclick=${e => layer.compare_locations.remove_key(key)}>
          Remove`)

    const node = mapp.utils.html`
      <div class="comparison-grid">
        ${labels}
        ${location_fields.flat()}
        ${remove_btns}`

    mapp.utils.render(layer.compare_locations.tab.panel, node)

  }
})()