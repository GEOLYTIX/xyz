document.dispatchEvent(new CustomEvent('measure_distance_units', {
    detail: _xyz => {

        if (!document.getElementById('mapButton')) return

        document.getElementById('mapButton').appendChild(_xyz.utils.html.node `
      <button
        class="mobile-display-none"
          title="Distance"
          onclick=${e => {

            if (e.target.classList.contains('enabled')) return _xyz.mapview.interaction.draw.cancel()

            e.target.classList.add('enabled')

            begin({
              type: 'LineString',
              tooltip: 'length',
              callback: () => {
                e.target.classList.remove('enabled')
                _xyz.map.removeInteraction(_xyz.mapview.interaction.draw.interaction)
              }
            })
          }}><div class="xyz-icon icon-straighten">`)

        function begin(params) {

            _xyz.mapview.interaction.current &&
                _xyz.mapview.interaction.current.finish &&
                _xyz.mapview.interaction.current.finish()

            _xyz.mapview.interaction.current = _xyz.mapview.interaction.draw

            delete _xyz.mapview.interaction.draw.kinks

            _xyz.mapview.interaction.draw.callback = params.callback

            _xyz.mapview.interaction.draw.layer = params.layer

            _xyz.mapview.interaction.draw.layer && !_xyz.mapview.interaction.draw.layer.display && _xyz.mapview.interaction.draw.layer.show()

            _xyz.mapview.node.style.cursor = 'crosshair'

            _xyz.mapview.interaction.draw.vertices = []

            _xyz.map.addLayer(_xyz.mapview.interaction.draw.Layer)

            _xyz.mapview.interaction.draw.interaction = new ol.interaction.Draw({
                source: _xyz.mapview.interaction.draw.Layer.getSource(),
                geometryFunction: params.geometryFunction,
                freehand: params.freehand,
                type: params.type,
                condition: e => {

                    _xyz.mapview.interaction.draw.vertices.push(e.coordinate)
                    if (_xyz.mapview.popup.node) _xyz.mapview.popup.node.remove()
                    return true
                }
            })

            _xyz.mapview.interaction.draw.interaction.on('drawstart', e => {

                metricFunction(e.feature.getGeometry())

                params.style && e.feature.setStyle(
                    new ol.style.Style({
                        stroke: params.style.strokeColor && new ol.style.Stroke({
                            color: _xyz.utils.Chroma(params.style.strokeColor),
                            width: params.style.strokeWidth || 1
                        }),
                        image: new Circle({
                            fill: new Fill({
                                color: params.style.strokeColor
                            }),
                            stroke: new Stroke({
                                color: '#2F2D2E',
                                width: 1.25
                            }),
                            radius: 4
                        })
                    }))

                _xyz.mapview.interaction.draw.Layer.getSource().clear()
                _xyz.mapview.popup.node && _xyz.mapview.popup.node.remove()
            })


            _xyz.map.addInteraction(_xyz.mapview.interaction.draw.interaction)

        }

        function metricFunction(geometry, metric) {

            const metrics = {
                distance: () => ol.sphere.getLength(new ol.geom
                    .LineString([geometry.getInteriorPoint().getCoordinates(), _xyz.mapview.position])),
                area: () => ol.sphere.getArea(geometry),
                length: () => ol.sphere.getLength(geometry),
            }

            geometry.on('change', () => {

                let dist = metrics['length'](),
                    m = parseInt(dist),
                    km = (m / 1000).toFixed(1),
                    mi = (m * 0.00062).toFixed(2)

                _xyz.mapview.popup.create({
                    content: _xyz.utils.html.node `
                  <div style="padding: 5px">
                  ${m.toLocaleString('en-GB')}<b>m</b><br/>
                  ${km.toLocaleString('en-GB')}<b>km</b></br> 
                  ${mi.toLocaleString('en-GB')}<b>mi</b>`
                })
                _xyz.mapview.node.addEventListener('contextmenu', () => _xyz.mapview.interaction.current.finish())
            })
        }

    }
}))