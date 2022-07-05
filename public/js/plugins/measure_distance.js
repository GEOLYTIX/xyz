export default (function(){

  mapp.plugins.measure_distance = (options, mapview) => {

    const pluginBtn = document.getElementById("plugin-btn");
  
    if(!pluginBtn) return;
  
    pluginBtn.after(mapp.utils.html.node`
      <button
        title="Measure distance"
        onclick=${measure_distance}>
        <div class="mask-icon straighten">`);
  
    function measure_distance(e){
  
      // Cancel draw interaction if active.
      if (e.target.classList.contains('active')) return mapview.interactions.highlight()
  
      e.target.classList.add('active')
  
      // Call drawing interaction with tooltip to show distance.
      mapview.interactions.draw(Object.assign({
        type: 'LineString',
        tooltip: options.tooltip,

        // Prevent contextmenu showing at drawend event.
        contextMenu: null,

        callback: () => {

          // Remove routeLayer from map.
          mapview.Map.removeLayer(routeLayer)

          // Remove active class from button.
          e.target.classList.remove('active')

          // Activate highlight interaction.
          mapview.interactions.highlight()
        }

      // Assign condition and metricFunction methods for route options.
      }, options.hereRoute && {
        condition,
        metricFunction
      }))

      // Array for route waypoints.
      const waypoints = []

      // Condition method is called on click in drawing interaction.
      function condition(e){

        // Push waypoint from click into array.
        waypoints.push(ol.proj.toLonLat([
          e.coordinate[0],
          e.coordinate[1]
        ], `EPSG:3857`))

        // Redraw route on each waypoint.
        if (waypoints.length > 1) route()

      }

      let routeLayer, section;

      async function route() {

        // Set params for here request.
        const params = {
          transportMode: options.hereRoute,
          origin: `${waypoints[0][1]},${waypoints[0][0]}`,
          destination: `${waypoints[[waypoints.length-1]][1]},${waypoints[[waypoints.length-1]][0]}`,
          return: 'polyline,summary'
        }

        // Create intermediate waypoints for route.
        if (waypoints.length > 2) {

          const via = []

          for (let i=1; i<waypoints.length-1; i++) {
            via.push(`${waypoints[i][1]},${waypoints[i][0]}!passThrough=true`)
          }

          params.via = via.join('&via=')
        }

        // Request route info from here API.
        const response = await mapp.utils
          .xhr(`${mapview.host}/api/proxy?url=`
            +`${encodeURIComponent(`https://router.hereapi.com/v8/routes?`
            +`${mapp.utils.paramString(params)}&{HERE}`)}`)

        if (!response.routes.length) return;

        section = response.routes[0].sections[0]

        // Decode the section.polyline
        const decoded = mapp.utils.here.decodeIsoline(section.polyline)

        // Reverse coordinate order in decoded polyline.
        decoded.polyline.forEach(p => p.reverse())

        // Remove existing routeLayer from map.
        routeLayer && mapview.Map.removeLayer(routeLayer)

        // Create routeLayer with linestring geometry from polyline coordinates.
        routeLayer = mapview.geoJSON({
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

      // The metricFunction is called on drawstart. 
      function metricFunction(geometry, metric) {

        const metrics = {
          distance: (geometry) => ol.sphere.getLength(new ol.geom
              .LineString([geometry.getInteriorPoint().getCoordinates(), mapview.position])),
          area: (geometry) => ol.sphere.getArea(geometry),
          length: (geometry) => ol.sphere.getLength(geometry),
        }

        // A popup is set with metrics when the draw interaction geometry changes.
        geometry.on('change', () => {
          mapview.popup({
            content: mapp.utils.html.node`
              <div style="padding: 5px">
                ${parseInt(metrics[metric](geometry)).toLocaleString('en-GB') + (metric === 'area' ? 'sqm' : 'm')}
                ${section && mapp.utils.html`
                <br>
                Distance(${options.hereRoute})
                <br>
                ${section.summary.length.toLocaleString('en-GB')}m
                <br>
                Time(${options.hereRoute})
                <br>
                ${parseInt(section.summary.duration / 60)}min`}`
                  
          })
        })

        mapview.Map.on('contextmenu', e => {
          e.preventDefault()
          pluginBtn.nextSibling.classList.remove('active') 
          mapview.interaction?.finish()
          mapview.interactions.highlight()
        })
      }

    }

  }

})()