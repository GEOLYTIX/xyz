document.dispatchEvent(new CustomEvent('measure_distance_here_walk_imperial', {
    detail: _xyz => {

        let summary = {}

        if (!document.getElementById('mapButton')) return

        document.getElementById('mapButton').appendChild(_xyz.utils.html.node `
      <button
        class="mobile-display-none measure_distance_here_walk"
          title="HERE Walk & Drive Distance"
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
                summary = {}
              }
            })
          }}><div class="xyz-icon icon-walk-drive">`)

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

                    _xyz.mapview.interaction.draw.vertices.push(e.coordinate)
                    if (_xyz.mapview.popup.node) _xyz.mapview.popup.node.remove()

                    if (_xyz.mapview.interaction.draw.vertices.length > 1) {

                        const p1 = ol.proj.toLonLat(_xyz.mapview.interaction.draw.vertices[0], `EPSG:3857`)
                        const p2 = ol.proj.toLonLat(_xyz.mapview.interaction.draw.vertices[_xyz.mapview.interaction.draw.vertices.length - 1], `EPSG:3857`)

                        const here_promise = payload => new Promise((resolve, reject) => {
                            _xyz.proxy(`https://router.hereapi.com/v8/routes?${_xyz.utils.paramString({
                                transportMode: payload.mode,//'car',
                                origin: `${p1[1]},${p1[0]}`,
                                destination: `${p2[1]},${p2[0]}`,
                                return: 'summary',
                                departure: '2021-02-06T13:00:00.000Z'
                        })}&{HERE}`).then(response => resolve(response))})

                        const here_promises = []

                        here_promises.push(here_promise({mode: 'car'}))
                        here_promises.push(here_promise({mode: 'pedestrian'}))

                        Promise.all(here_promises).then(arr => {

                            arr.map(ar => {
                                if(!ar.routes) return

                                summary[ar.routes[0]?.sections[0]?.type] = {
                                    length: ar.routes[0]?.sections[0]?.summary?.length || 0,
                                    duration: ar.routes[0]?.sections[0]?.summary?.duration || 0
                                }
                            })
                        })
                    }

                    return true
                }
            })

            _xyz.mapview.interaction.draw.interaction.on('drawstart', e => {

                _xyz.mapview.node.addEventListener('contextmenu', end)


                imperialFunction(e.feature.getGeometry(), summary)

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
            })


            _xyz.map.addInteraction(_xyz.mapview.interaction.draw.interaction)

            function end(e) {
                _xyz.mapview.interaction.draw.Layer.getSource().clear()
                _xyz.mapview.interaction.draw.cancel()
                _xyz.mapview.node.removeEventListener('contextmenu', end)
                document.querySelector('#mapButton .measure_distance_here_walk').classList.remove('enabled')
            }

        }

        function imperialFunction(geometry, params) {

            geometry.on('change', () => {

                if (!params.vehicle || !params.pedestrian) return
                if (!params.vehicle.duration || !params.pedestrian.duration) return
                if (!params.vehicle.length || !params.pedestrian.length) return

                if (_xyz.mapview.popup.node) _xyz.mapview.popup.node.remove()

                _xyz.mapview.popup.create({
                    content: _xyz.utils.html.node `<div style="padding: 5px; min-width: 100px; font-size: smaller;">
                                <b>Driving</b></br>
                                Distance ${(parseFloat(params.vehicle.length * 0.00062).toFixed(2)).toString().toLocaleString('en-GB')} mi.<br/>
                                Time ${Math.round(params.vehicle.duration/60)} min<br/>
                                <b>Walking</b></br>
                                Distance ${(parseFloat(params.pedestrian.length * 0.00062).toFixed(2)).toString().toLocaleString('en-GB')} mi.<br/>
                                Time ${Math.round(params.pedestrian.duration/60)} min<br/>`,
                    coords: _xyz.mapview.interaction.draw.vertices[_xyz.mapview.interaction.draw.vertices.length - 1]
                })
            })
        }

    }
}))