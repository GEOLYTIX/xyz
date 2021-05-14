document.dispatchEvent(new CustomEvent('practice_patients', {
  detail: _xyz => {

    _xyz.locations.plugins.practice_patients = entry => {

      _xyz.query({
        query: 'practice_directory_patients',
        location: entry.location
      }).then(response => {

        const features = response.map(f=>new ol.Feature(new ol.geom.Point([f.x,f.y])))

        const source = new ol.source.Vector({
          features: features
        })

        const clusterSource = new ol.source.Cluster({
          distance: 20,
          source: source,
        })

        const layer = new ol.layer.Vector({
          source: clusterSource,
          zIndex: 999,
          style: feature => {

            var size = 5 + 1000 * feature.get('features').length / response.length

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

        _xyz.map.addLayer(layer)

        entry.location.removeCallbacks.push(()=>{
          _xyz.map.removeLayer(layer)
        })

      })

    }

  }
}))