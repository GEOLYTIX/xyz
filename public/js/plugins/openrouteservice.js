document.dispatchEvent(new CustomEvent('openrouteservice', {
  detail: _xyz => {

    const authToken = "5b3***"

    _xyz.layers.plugins.openrouteservice = layer => {

      let range = 10

      const panel = layer.view.appendChild(_xyz.utils.html.node`
        <div style="padding: 5px;">
          <span>Range (minutes):</span>
          <span class="bold">10</span>
          <div class="input-range">
          <input
            class="secondary-colour-bg"
            type="range"
            min=5
            value=10
            max=45
            step=1
            oninput=${e=>{
              range = parseInt(e.target.value)
              e.target.parentNode.previousElementSibling.textContent = range
            }}>`)

      const btn = panel.appendChild(_xyz.utils.html.node`
        <button
          class="btn-wide primary-colour"
          onclick=${query}>openrouteservice`)

      async function query() {

        if (btn.classList.contains('active')) return _xyz.mapview.interaction.draw.cancel()

        btn.classList.add('active')

        _xyz.mapview.interaction.draw.begin({
          layer: layer,
          type: 'Point',
          geometryFunction: function(coordinates, geometry) {

            geometry = new ol.geom.Circle(coordinates, range * 600)

            const origin = ol.proj.transform(coordinates, `EPSG:${_xyz.mapview.srid}`, 'EPSG:4326')

            const body = {
              locations: [origin],
              range: [range * 60],
            };
      
            _xyz.xhr({
              method: 'POST',
              requestHeader: {
                "Accept": "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
                "Authorization": authToken
              },
              url: `https://api.openrouteservice.org/v2/isochrones/driving-car`,
              body: JSON.stringify(body)
            }).then(response => {

              _xyz.mapview.interaction.draw.feature(response.features[0])

            })
      

            return geometry
          },
          callback: () => {
            btn.classList.remove('active')
          }
        })

      }

    }
  }
}))