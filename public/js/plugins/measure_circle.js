document.dispatchEvent(new CustomEvent('measure_circle', {
  detail: _xyz => {

      if(!document.getElementById('mapButton')) return

      document.getElementById('mapButton').appendChild(_xyz.utils.html.node`
      <button
        class="mobile-display-none"
          title=${_xyz.language.toolbar_measure}
          onclick=${e => {

            if (e.target.classList.contains('enabled')) return _xyz.mapview.interaction.draw.cancel()

            e.target.classList.add('enabled')

            _xyz.mapview.interaction.draw.begin({
              type: 'Circle',
              geometryFunction: ol.interaction.Draw.createRegularPolygon(33),
              tooltip: 'distance',
              callback: () => {
                e.target.classList.remove('enabled')
              }
            })

          }}><div class="xyz-icon icon-circle-dot">`)

  }
}))