document.dispatchEvent(new CustomEvent('geojson_file', {
  detail: _xyz => {

    _xyz.layers.plugins.geojson_file = layer => {

      const input = _xyz.utils.html.node`
      <input type="file" accept=".geojson" style="display: none;">`

      layer.view.appendChild(_xyz.utils.html.node`
      <div style="padding-right: 5px">
      <button
        class="raised wide bold primary-colour"
        onclick=${e => {
          e.stopPropagation()
          input.click()

        }}>File${input}`)

      input.addEventListener('change', function () {

        const reader = new FileReader()

        reader.onload = function () {
          try {

            const json = JSON.parse(this.result)

            layer.srid = json.crs.properties.name.match(/[0-9]/g).join('')

            layer.infoj = Object.keys(json.features[0].properties)
              .map(key => ({
                field: key
              }))

            Object.values(json.features).forEach((f, i) => {
              f.properties.id = i
            })

            const geoJSON = new ol.format.GeoJSON()

            const features = geoJSON.readFeatures(json)

            const source = new ol.source.Vector({
              features: features
            })

            layer.qID = 'id'

            layer.L = new ol.layer.Vector({
              key: 'foo',
              source: source,
              zIndex: layer.style.zIndex || 1,
              style: mapview.layer.styleFunction(layer)
            })

            layer.select = feature => {

              jsonFeature = JSON.parse(geoJSON.writeFeature(feature))

              const infoj = layer.infoj.map(_entry => {

                const entry = mapp.utils.clone(_entry)
                entry.title = entry.field
                entry.value = jsonFeature.properties[entry.field]

                return entry
              })

              _xyz.locations.select({
                _new: true,
                layer: layer,
                infoj: infoj,
                table: 'file',
                id: jsonFeature.properties.id,
                geometry: jsonFeature.geometry,
                properties: jsonFeature.properties,
              })
            }

            // layer.hover = true

            // layer.infotip = feature => {
            //   const properties = feature.getProperties()
            //   _xyz.mapview.infotip.create(JSON.stringify(properties))
            // }

            layer.show()

          } catch (err) {
            console.error(err)
          }
        }

        reader.readAsText(this.files[0])

        input.value = null
      })

    }

  }
}))