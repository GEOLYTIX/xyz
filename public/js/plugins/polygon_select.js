export default (function () {

  mapp.plugins.polygon_select = (plugin, mapview) => {

    // Find the btnColumn element.
    const btnColumn = document.getElementById("mapButton");

    // Append the plugin btn to the btnColumn.
    btnColumn && btnColumn.append(mapp.utils.html.node`
    <button
      title="Polygon Select"
      onclick=${polygon_select}>
      <div class="mask-icon area">`);


    function polygon_select(e) {

      // Cancel draw interaction if active.
      if (e.target.classList.contains('active')) return mapview.interactions.highlight()

      // Style plugin button as active.
      e.target.classList.add('active')

      if (!mapview.layers[plugin.layer]) return;

      if (plugin.L) mapview.Map.removeLayer(plugin.L)

      mapview.layers[plugin.layer].show()

      // Config for mapview draw interaction.
      const config = {
        type: 'Polygon',

        // Prevent contextmenu showing at drawend event.
        contextMenu: null,

        style: new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: '#FF69B4',
            width: 2
          })
        }),
        drawend: e => {

          plugin.L = new ol.layer.VectorTile({
            source: mapview.layers[plugin.layer].L.getSource(),
            style: F => {

              let extent = F.getGeometry().getExtent()

              let geom = e.feature.getGeometry()

              if (geom.intersectsCoordinate([extent[0], extent[1]])
                || geom.intersectsCoordinate([extent[2], extent[3]])
                || geom.intersectsCoordinate([extent[0], extent[3]])
                || geom.intersectsCoordinate([extent[1], extent[2]])
                || geom.intersectsCoordinate([(extent[0]+extent[2])/2, (extent[1]+extent[3])/2])) {

                  return new ol.style.Style({
                    fill: new ol.style.Fill({
                      color: '#FF69B4'
                    })
                  })

                }
            }
          });

          mapview.Map.addLayer(plugin.L)

          mapview.interactions.highlight()
        },
        callback: () => {

          // Remove active class from button.
          e.target.classList.remove('active')
        }
      }

      // Initiate drawing on mapview with config as interaction argument.
      mapview.interactions.draw(config)

    }

  }

})()