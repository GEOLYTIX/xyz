export default (function () {

  mapp.utils.polygonSelect = (params) => {

    // Style plugin button as active.
    params.btn?.classList.add('active')

    if (!params.layer) return;

    // Remove existing layer and set to null.
    if (params.L) {
      params.mapview.Map.removeLayer(params.L)
      params.L = null
    }

    // Config for mapview draw interaction.
    params = Object.assign({

      // Draw polygon.
      type: 'Polygon',

      // Highlight style for intersecting features.
      highlightStyle: new ol.style.Style({
        fill: new ol.style.Fill({
          color: '#FF69B4'
        })
      }),

      // Style for draw interaction.
      style: new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: '#FF69B4',
          width: 2
        })
      }),
      drawend: e => {

        // Get geometry of drawn polygon feature
        const geom = e.feature.getGeometry()

        // Create vector tile layer from param.layer source.
        params.L = new ol.layer.VectorTile({
          source: params.layer.L.getSource(),
          style: F => {

            // Get extent of vector tile render feature
            const extent = F.getGeometry().getExtent()

            if (geom.intersectsCoordinate([extent[0], extent[1]])
              || geom.intersectsCoordinate([extent[2], extent[3]])
              || geom.intersectsCoordinate([extent[0], extent[3]])
              || geom.intersectsCoordinate([extent[1], extent[2]])
              || geom.intersectsCoordinate([(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2])) {

                // Push feature into features array.
                params.features?.push(F)

                // Return style for feature.
                return params.highlightStyle
            }
          }
        });

        // Finish interaction after rendercomplete.
        params.mapview.Map.once('rendercomplete', ()=>{
          params.mapview.interaction?.finish()
        })

        // Add layer.
        params.mapview.Map.addLayer(params.L)
      },
      // Will be called when draw interaction is finished.
      callback: () => {

        params.mapview.interactions.highlight()

        // Remove active class from button.
        params.btn?.classList.remove('active')
      }
    }, params)

    // Initiate drawing on mapview with config as interaction argument.
    params.mapview.interactions.draw(params)

    return params
  }

})()