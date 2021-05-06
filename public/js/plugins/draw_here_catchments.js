document.dispatchEvent(new CustomEvent('measure_distance_here', {
  detail: _xyz => {

    let values = {}

    if (!document.getElementById('mapButton')) return

    document.getElementById('mapButton').appendChild(_xyz.utils.html.node `
      <button
        class="mobile-display-none"
          title="HERE Distance"
          onclick=${e => {

            if (e.target.classList.contains('enabled')) return _xyz.mapview.interaction.draw.cancel()

            e.target.classList.add('enabled')

            begin({
              type: 'LineString',
              tooltip: 'length',
              _style: {
                strokeColor: '#1f964d',
                strokeWidth: 3
              },
              callback: () => {
                e.target.classList.remove('enabled')
                _xyz.map.removeInteraction(_xyz.mapview.interaction.draw.interaction)
                values = {}
              }
            })
          }}><div class="xyz-icon icon-car">`)

    function begin(params) {

      _xyz.mapview.interaction.current &&
        _xyz.mapview.interaction.current.finish &&
        _xyz.mapview.interaction.current.finish()

      _xyz.mapview.interaction.current = _xyz.mapview.interaction.draw

      delete _xyz.mapview.interaction.draw.kinks;

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

          if (e.originalEvent.buttons === 1) {

            _xyz.mapview.interaction.draw.vertices.push(e.coordinate)
            if (_xyz.mapview.popup.node) _xyz.mapview.popup.node.remove()

            if (_xyz.mapview.interaction.draw.vertices.length > 1) {

              const p1 = ol.proj.toLonLat(_xyz.mapview.interaction.draw.vertices[0], `EPSG:3857`)
              const p2 = ol.proj.toLonLat(_xyz.mapview.interaction.draw.vertices[_xyz.mapview.interaction.draw.vertices.length - 1], `EPSG:3857`)

              const params = {
                transportMode: 'car',
                origin: `${p1[1]},${p1[0]}`,
                destination: `${p2[1]},${p2[0]}`,
                return: 'summary'
                /*,
                                                departure: new Date('2020-02-01 13:00:00').toISOString()*/ // set date swhen needed
              }

              _xyz
                .proxy(`https://router.hereapi.com/v8/routes?${_xyz.utils.paramString(params)}&{HERE}`)
                .then(response => {

                  if (!response.routes) return
                  let length = response.routes[0].sections[0].summary.length,
                    duration = response.routes[0].sections[0].summary.duration

                  values.length = length
                  values.duration = duration
                })
            }

            return true
          }
        }
      });

      _xyz.mapview.interaction.draw.interaction.on('drawstart', e => {

        metricFunction(e.feature.getGeometry(), values)

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
          }));

        _xyz.mapview.interaction.draw.Layer.getSource().clear()
        _xyz.mapview.popup.node && _xyz.mapview.popup.node.remove()
      });


      _xyz.map.addInteraction(_xyz.mapview.interaction.draw.interaction)

    }

    function metricFunction(geometry, params) {

      geometry.on('change', () => {

        if (!params.length || !params.duration) return

        _xyz.mapview.popup.create({
          content: _xyz.utils.html.node `<div style="padding: 5px; min-width: 100px; font-size: smaller;">Length ${(parseFloat(params.length/1000).toFixed(2)).toString().toLocaleString('en-GB')} km<br/>Duration ${Math.round(params.duration/60)} min`,
          coords: _xyz.mapview.interaction.draw.vertices[_xyz.mapview.interaction.draw.vertices.length - 1]
        })
      })
    }

  }
}))