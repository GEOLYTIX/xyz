document.dispatchEvent(new CustomEvent('tab_layer', {
  detail: _xyz => {

    _xyz.layers.plugins.tab_layer = layer => {

      const table = {
        active: true,
        viewport: true,
        display: true,
        title: 'Layer Table',
        layer: layer,
        query: 'global_cities_query',
        selectable: true,
        toolbar: {
          viewport: true
        },
        table: 'geodata.global_glx_open_citiesoftheworld',
        columns: [
          {
            "field": "city_name",
            "title": "City"
          },
          {
            "field": "country",
            "title": "Country"
          },
          {
            "field": "pop_ghs",
            "title": "Population (ghs)",
            "hozAlign": "right",
            "formatter": "money",
            "formatterParams": {
              "precision": 0
            }
          },
          {
            "field": "area",
            "title": "Area (km2)",
            "hozAlign": "right",
            "formatter": "money",
            "formatterParams": {
              "precision": 1
            }
          },
          {
            "field": "pop_den",
            "title": "Population Density",
            "hozAlign": "right",
            "formatter": "money",
            "formatterParams": {
              "precision": 1
            }
          }
        ]
      }

      _xyz.tabview.add(table)

      _xyz.dataviews.create(table)

      layer.display && table.display && table.show()

      layer.view.appendChild(_xyz.utils.html.node`
        <label class="input-checkbox">
        <input
        .checked=${!!table.display}
          type="checkbox"
          onchange=${e => {

            table.display = e.target.checked
            table.display ?
              table.show() :
              table.remove()

          }}>
        </input>
        <div></div><span>BSG75`)

    }

  }
}))