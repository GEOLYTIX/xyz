document.dispatchEvent(new CustomEvent('practice_patients', {
  detail: _xyz => {

    _xyz.locations.plugins.practice_patients = entry => {

      const source = new ol.source.Vector()

      let features

      const clusterSource = new ol.source.Cluster({
        distance: 20,
        source: source,
      })

      const layer = new ol.layer.Vector({
        source: clusterSource,
        zIndex: 999,
        style: feature => {

          var size = 5 + 1000 * feature.get('features').length / features.length

          size = size > 20 && 20 || size

          const style = new ol.style.Style({
              image: new ol.style.Circle({
                radius: size,
                stroke: new ol.style.Stroke({
                  color: '#fff',
                }),
                fill: new ol.style.Fill({
                  color: entry.location.style.strokeColor,
                }),
              })
            })

          return style
        }
      })

      entry.location.removeCallbacks.push(()=>{
        _xyz.map.removeLayer(layer)
      })

      entry.listview.appendChild(_xyz.utils.html.node `
        <label
          class="${`input-checkbox mobile-disabled ${entry.class}`}">
          <input
            type="checkbox"
            .checked=${!!entry.display}
            onchange=${e => {

              entry.display = e.target.checked
              entry.display ?
                _xyz.map.addLayer(layer) :
                _xyz.map.removeLayer(layer)

            }}></input>
          <div></div>
          <span>Patient Locations`)

      _xyz.query({
        query: 'practice_directory_patients',
        location: entry.location
      }).then(response => {

        features = response.map(f => new ol.Feature(new ol.geom.Point([f.x, f.y])))

        source.addFeatures(features)

      })

    }

  }
}))