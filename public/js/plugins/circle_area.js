document.dispatchEvent(new CustomEvent('circle_area', {
  detail: _xyz => {

    _xyz.layers.plugins.circle_area = async layer => {

      layer.edit.circle_area = {
        radius: 1
      }

      const panel = layer.view.querySelector('.panel')

      panel.appendChild(_xyz.utils.html.node`
        <button
          class="btn-wide primary-colour"
          onclick=${e => {
            
            e.stopPropagation()
            
            const btn = e.target
            
            if (btn.classList.contains('active')) return _xyz.mapview.interaction.draw.cancel()
            
            btn.classList.add('active')

            layer.show()
            
            layer.view.querySelector('.header').classList.add('edited', 'secondary-colour-bg')

            _xyz.mapview.interaction.draw.begin({
              layer: layer,
              type: 'Point',
              geometryFunction: (coordinates) => {
                const circleGeom = new ol.geom.Circle(coordinates, layer.edit.circle_area.radius * 1609.34)

                const circlePolyGeom = ol.geom.Polygon.fromCircle(circleGeom)

                return circlePolyGeom
              },
              callback: () => {
                layer.view.querySelector('.header').classList.remove('edited', 'secondary-colour-bg')
                btn.classList.remove('active')
              }
            })

          }}>Radius`)

      panel.appendChild(_xyz.utils.html.node`
        <div
          style="margin-top: 12px; grid-column: 1 / 3;"
          <span>Set radius in mi:</span>
          <span class="bold">1</span>
          <div class="input-range">
          <input
            class="secondary-colour-bg"
            type="range"
            min=0.5
            value=1
            max=3
            step=0.5
            oninput=${e=> {
              e.target.parentNode.previousElementSibling.textContent = e.target.value
              layer.edit.circle_area.radius = e.target.value
            }}>`)

    }

  }
}))