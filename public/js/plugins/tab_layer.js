document.dispatchEvent(new CustomEvent('tab_layer', {
  detail: _xyz => {

    _xyz.layers.plugins.tab_layer = layer => {


      const table = {
        active: true,
        "target": _xyz.utils.html.node`<div>`,
        "layer": layer,
        "display": true,
        "query": "global_cities_query",
        "selectable": true,
        "table": "geodata.global_glx_open_citiesoftheworld",
        "columns": [
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

      _xyz.dataviews.create(table)

      const tab = {
        title: 'Layer',
        node: table.target,
      }

      layer.view.appendChild(_xyz.utils.html.node`
        <label class="input-checkbox">
        <input
          type="checkbox"
          onchange=${e => {
            tab.display = e.target.checked
            if (tab.display) {
              _xyz.dataviews.tabview.add(tab)
              table.update()
              return
            }
            tab.remove()
          }}>
        </input>
        <div></div><span>BSG75`)

    }

  }
}))