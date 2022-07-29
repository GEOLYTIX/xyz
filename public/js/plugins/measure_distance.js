export default (function(){

  mapp.plugins.measure_distance = (options, mapview) => {

    // Find the btnColumn element.
    const btnColumn = document.getElementById("mapButton");

    // Append the plugin btn to the btnColumn.
    btnColumn && btnColumn.append(mapp.utils.html.node`
    <button
      title="Measure distance"
      onclick=${measure_distance}>
      <div class="mask-icon straighten">`);
  
    function measure_distance(e){
  
      // Cancel draw interaction if active.
      if (e.target.classList.contains('active')) return mapview.interactions.highlight()
  
      // Style plugin button as active.
      e.target.classList.add('active')

      const config = Object.assign({
        type: 'LineString',

        tooltip: {
          metric: 'length'
        },

        // Prevent contextmenu showing at drawend event.
        contextMenu: null,

        callback: () => {

          // Remove routeLayer from map.
          mapview.Map.removeLayer(options.L)

          // Remove active class from button.
          e.target.classList.remove('active')

          // Activate highlight interaction.
          mapview.interactions.highlight()
        }
      }, options)

      // Assign different routing methods to the routes object.
      const routes = {
        here
      }

      if (options.route) {

        // Ammend routing methods to config
        routes[options.route.provider] && routes[options.route.provider](config)
      }

      mapview.interactions.draw(config)

      function here(config) {

        let 
          waypoints = [], // Array for route waypoints.
          section; // The section of the route.

        config.condition = async e => {

          // Push waypoint from click into array.
          waypoints.push(ol.proj.toLonLat([
            e.coordinate[0],
            e.coordinate[1]
          ], `EPSG:3857`))

          // Redraw route on each waypoint.
          if (waypoints.length > 1) {

            // Set params for here request.
            const params = {
              transportMode: options.route.transportMode || 'car',
              origin: `${waypoints[0][1]},${waypoints[0][0]}`,
              destination: `${waypoints[[waypoints.length - 1]][1]},${waypoints[[waypoints.length - 1]][0]}`,
              return: 'polyline,summary'
            }

            // Create intermediate waypoints for route.
            if (waypoints.length > 2) {

              const via = []

              for (let i = 1; i < waypoints.length - 1; i++) {
                via.push(`${waypoints[i][1]},${waypoints[i][0]}!passThrough=true`)
              }

              params.via = via.join('&via=')
            }

            // Request route info from here API.
            const response = await mapp.utils
              .xhr(`${mapview.host}/api/proxy?url=`
                + `${encodeURIComponent(`https://router.hereapi.com/v8/routes?`
                  + `${mapp.utils.paramString(params)}&{HERE}`)}`)

            if (!response.routes.length) return;

            section = response.routes[0].sections[0]

            // Decode the section.polyline
            const decoded = mapp.utils.here.decodeIsoline(section.polyline)

            // Reverse coordinate order in decoded polyline.
            decoded.polyline.forEach(p => p.reverse())

            // Remove existing routeLayer from map.
            options.L && mapview.Map.removeLayer(options.L)

            // Create routeLayer with linestring geometry from polyline coordinates.
            options.L = mapview.geoJSON({
              zIndex: Infinity,
              geometry: {
                type: 'LineString',
                coordinates: decoded.polyline,
              },
              dataProjection: '4326',
              Style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                  color: '#f00',
                  opacity: 0.5,
                  width: 2
                })
              })
            })

          }

        };
      
        config.metricFunction = (geometry, tooltip) => {

          // A popup is set with metrics when the draw interaction geometry changes.
          geometry.on('change', async () => {
            mapview.popup({
              content: mapp.utils.html.node`
                <div style="padding: 5px">
                  ${await mapp.utils.convert(mapview.metrics.length(geometry), tooltip)}
                  ${section && mapp.utils.html`
                  <br>
                  Route(${options.route.transportMode || 'car'})
                  <br>
                  ${await mapp.utils.convert(section.summary.length, tooltip)}
                  <br>
                  ${parseInt(section.summary.duration / 60)}min`}`
                    
            })
          })

        }
      }
  
    }

  }

})()