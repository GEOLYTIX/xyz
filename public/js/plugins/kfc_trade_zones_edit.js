document.dispatchEvent(new CustomEvent('kfc_trade_zones_edit', {
  detail: _xyz => {

      _xyz.locations.plugins.kfc_trade_zones_edit = entry => {

          const editing_group = _xyz.utils.html.node`<div
              class="drawer group panel expandable"
              style="font-size: smaller;"><div class="header primary-colour"
              onclick=${e => {
                  _xyz.utils.toggleExpanderParent(e.target)
              }}>
              <span>Editing</span>
              <span style="height: 12px;" class="xyz-icon btn-header icon-expander primary-colour-filter"></span>
              `


          const edit_feature = _xyz.utils.html.node `
          <button class="btn-wide primary-colour"
          style="grid-column: 1/span 3; font-size: 11px;"
          title="Edit geometry" class="btn-header"
          onclick=${e => {

              e.stopPropagation()

              if (edit_feature.classList.contains('active')) {
                  edit_feature.classList.remove('active')
                  return _xyz.mapview.interaction.edit.cancel()
              }

              edit_feature.classList.add('active')

              _xyz.mapview.interaction.edit.begin({
                  location: entry.location,
                  type: 'Polygon',
                  //deleteCondition: () => {},
                  callback: () => {
                      edit_feature.classList.remove('active')
                  }
              })

          }}>Edit feature`

          const edit_snap_feature = _xyz.utils.html.node `
          <button class="btn-wide primary-colour"
          style="grid-column: 1/span 3; font-size: 11px; margin-top: 5px;"
          title="Edit geometry with snapping" class = "btn-header"
          onclick=${e => {

              e.stopPropagation()

              if (edit_snap_feature.classList.contains('active')) {
                  edit_snap_feature.classList.remove('active')
                  return _xyz.mapview.interaction.edit.cancel()
              }

              edit_snap_feature.classList.add('active')

              const xhr = new XMLHttpRequest()

              const tableZ = entry.location.layer.tableCurrent()

              if (!tableZ) return

              xhr.open('GET', _xyz.host + '/api/layer/geojson?' + _xyz.utils.paramString({
                  locale: _xyz.locale.key,
                  layer: entry.location.layer.key,
                  table: tableZ,
                  filter: entry.location.layer.filter && entry.location.layer.filter.current
              }))

              xhr.setRequestHeader('Content-Type', 'application/json')
              xhr.responseType = 'json'

              xhr.onload = e => {

                  console.log(e.target.response)

                  if (e.target.status !== 200) return

                  edit_snap_feature.classList.remove('active')

                  const geoJSON = new ol.format.GeoJSON()

                  const features = e.target.response.map(f => geoJSON.readFeature({
                      type: 'Feature',
                      geometry: f.geometry,
                      properties: {
                          id: f.properties.id
                      }
                  },{ 
                      dataProjection: 'EPSG:' + entry.location.layer.srid,
                      featureProjection: 'EPSG:' + _xyz.mapview.srid
                  }))

                  const sourceVector = new ol.source.Vector({
                      features: features
                  })

                  const layerVector = new ol.layer.Vector({
                      source: sourceVector,
                      zIndex: 10000,
                      style: new ol.style.Style({
                          stroke: new ol.style.Stroke({
                              color: 'rgba(255, 255, 255, 0)'
                          }),
                          fill: new ol.style.Fill({
                              color: 'rgba(255, 255, 255, 0)'
                          })
                      })
                  })

                  _xyz.map.addLayer(layerVector)

                  _xyz.mapview.interaction.edit.begin({
                      location: entry.location,
                      type: 'Polygon',
                      callback: () => {
                          edit_snap_feature.classList.remove('active')
                          _xyz.map.removeLayer(layerVector)
                      }
                  })

                  _xyz.mapview.interaction.snap = new ol.interaction.Snap({
                      source: layerVector.getSource()
                  })

                  _xyz.map.addInteraction(_xyz.mapview.interaction.snap)

              }

              xhr.send()


          }}>Edit feature with snapping`

          const edit_split_feature = _xyz.utils.html.node`<button class="btn-wide primary-colour"
          style="grid-column: 1/span 3; font-size: 11px; margin-top: 5px;"
          title="Split geometry" class="btn-header"
          onclick=${e => {
              alert('Placeholder. Nothing here yet.')
          }}>Split feature
          `

          editing_group.appendChild(edit_feature)

          editing_group.appendChild(edit_snap_feature)

          editing_group.appendChild(edit_split_feature)

          //editing_group.appendChild(_xyz.utils.html.node`<div><smaller>Click with Alt to remove vertex.</smaller></div>`)

          entry.listview.appendChild(editing_group)
         
      }
  }
}))