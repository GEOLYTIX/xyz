document.dispatchEvent(new CustomEvent('practice_patients', {
  detail: _xyz => {

    _xyz.locations.plugins.practice_patients = entry => {

      const source = new ol.source.Vector()

      let features

      const clusterSource = new ol.source.Cluster({
        distance: 20,
        source: source,
      })

      function styleFunction (feature) {

          let l = feature.get('features').length

          maxCount = l > maxCount && l || maxCount

          if (!flag && maxCount > 30) return null
          
          if (flag && maxCount > 30) l *= 30 / maxCount

          const style = new ol.style.Style({
              image: new ol.style.Circle({
                radius: 3 + l,
                stroke: new ol.style.Stroke({
                  color: '#fff',
                }),
                fill: new ol.style.Fill({
                  color: entry.location.style.strokeColor,
                })
              })
            })

          return style
      }



      const layer = new ol.layer.Vector({
        source: clusterSource,
        zIndex: 999,
        style: styleFunction
      })


      let maxCount = 0

      let flag = false

      function postRender() {

        _xyz.utils.render(counter, _xyz.utils.html`
          <div style="padding-left: 29px; font-style: italic;">Largest cluster represents ${maxCount} Patients`)

        if (!flag && maxCount > 30) {
          
          flag = true
          return layer.setStyle(styleFunction)
        }

        flag = false
        maxCount = 0
      }

      let postRenderTimeout

      layer.on('postrender', e=>{

        postRenderTimeout && clearTimeout(postRenderTimeout)

        postRenderTimeout = setTimeout(postRender, 300)
      })


      entry.location.removeCallbacks.push(()=>{
        _xyz.map.removeLayer(layer)
      })

      const label = entry.listview.appendChild(_xyz.utils.html.node `
      <div style="grid-column: 1/3;">
        <label
          class="${`input-checkbox mobile-disabled ${entry.class}`}">
          <input
            type="checkbox"
            .checked=${!!entry.display}
            onchange=${e => {

              entry.display = e.target.checked
              
              if (entry.display) {
                _xyz.map.addLayer(layer)
                counter.style.display = 'block'

              } else {
                _xyz.map.removeLayer(layer)
                counter.style.display = 'none'
              }

            }}></input>
          <div></div>
          <span>Patient Locations`)


      const counter = label.appendChild(_xyz.utils.html.node `
        <div>`)

      _xyz.query({
        query: 'practice_directory_patients',
        location: entry.location
      }).then(response => {

        features = response.map(f => new ol.Feature(new ol.geom.Point([f.x, f.y])))

        source.addFeatures(features)





        // const test = clusterSource.getFeatures()

        // console.log(test)

      })

    }

  }
}))