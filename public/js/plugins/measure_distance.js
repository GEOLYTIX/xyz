import mapboxPolyline from 'https://cdn.skypack.dev/@mapbox/polyline';

export default (function () {

  mapp.plugins.measure_distance = (options, mapview) => {

    // Find the btnColumn element.
    const btnColumn = document.getElementById("mapButton");

    // Append the plugin btn to the btnColumn.
    btnColumn && btnColumn.append(mapp.utils.html.node`
    <button
      title="Measure distance"
      onclick=${measure_distance}>
      <div class="mask-icon straighten">`);


    options.content = {}

    function measure_distance(e) {

      // Cancel draw interaction if active.
      if (e.target.classList.contains('active')) return mapview.interactions.highlight()

      // Style plugin button as active.
      e.target.classList.add('active')

      const config = Object.assign({
        type: 'LineString',

        // Prevent contextmenu showing at drawend event.
        contextMenu: null,

        callback: () => {

          // Remove routeLayer from map.
          options.routes?.forEach(route => mapview.Map.removeLayer(route.L))

          // Remove active class from button.
          e.target.classList.remove('active')

          // Activate highlight interaction.
          mapview.interactions.highlight()
        }
      }, options)

      Object.assign(config.tooltip, {
        metric: 'length',
        onChange
      })

      options.popup = ()=>{
        mapview.popup({
          content: mapp.utils.html.node`
            <div style="padding: 5px">
            <span style="white-space: nowrap;">${options.val}</span>
            ${options.routes
                .filter(route=> route.val)
                .map(route => {
                  return mapp.utils.html`<br><span style="white-space: nowrap;">${route.val}</span>`})}`
        })
      }

      async function onChange(e) {

        options.val = await mapp.utils.convert(mapview.metrics.length(e.target), config.tooltip)
        options.popup()
      }

      // Assign different routing methods to the routes object.
      const routes = {
        here,
        mapbox
      }

      config.conditions = options.routes?.map(route => routes[route.provider](route))

      mapview.interactions.draw(config)

      function here(route) {

        route.waypoints = []; // Array for route waypoints.
        route.section; // The section of the route.
        delete route.val;

        return async e => {

          // Push waypoint from click into array.
          route.waypoints.push(ol.proj.toLonLat([
            e.coordinate[0],
            e.coordinate[1]
          ], `EPSG:3857`))

          // Redraw route on each waypoint.
          if (route.waypoints.length > 1) {

            // Set params for here request.
            const params = {
              transportMode: route.transportMode || 'car',
              origin: `${route.waypoints[0][1]},${route.waypoints[0][0]}`,
              destination: `${route.waypoints[[route.waypoints.length - 1]][1]},${route.waypoints[[route.waypoints.length - 1]][0]}`,
              return: 'polyline,summary'
            }

            // Create intermediate waypoints for route.
            if (route.waypoints.length > 2) {

              const via = []

              for (let i = 1; i < route.waypoints.length - 1; i++) {
                via.push(`${route.waypoints[i][1]},${route.waypoints[i][0]}!passThrough=true`)
              }

              params.via = via.join('&via=')
            }

            // Request route info from here API.
            const response = await mapp.utils
              .xhr(`${mapview.host}/api/proxy?url=`
                + `${encodeURIComponent(`https://router.hereapi.com/v8/routes?`
                  + `${mapp.utils.paramString(params)}&{HERE}`)}`)

            if (!response.routes.length) return;

            //console.log(response.routes[0].sections[0])

            route.val = await mapp.utils.convert(response.routes[0].sections[0].summary.length, route)

            if (route.duration) {

              route.val += ` (${await mapp.utils.convert(response.routes[0].sections[0].summary.duration, {units: 'seconds', convertTo: route.duration})} ${route.duration})`
            }

            options.popup()

            route.section = response.routes[0].sections[0]

            // Decode the section.polyline
            const decoded = mapp.utils.here.decodeIsoline(route.section.polyline)

            // Reverse coordinate order in decoded polyline.
            decoded.polyline.forEach(p => p.reverse())

            // Remove existing routeLayer from map.
            route.L && mapview.Map.removeLayer(route.L)

            // Create routeLayer with linestring geometry from polyline coordinates.
            route.L = mapview.geoJSON({
              zIndex: Infinity,
              geometry: {
                type: 'LineString',
                coordinates: decoded.polyline,
              },
              dataProjection: '4326',
              Style: new ol.style.Style({
                stroke: new ol.style.Stroke(Object.assign({
                  color: '#333',
                  opacity: 0.5,
                  width: 2
                }, route.style || {}))
              })
            })

          }

        };
      }

      function mapbox(route) {

        route.waypoints = [];
        delete route.val;

        return async e => {

          // Push waypoint from click into array.
          route.waypoints.push(ol.proj.toLonLat([
            e.coordinate[0],
            e.coordinate[1]
          ], `EPSG:3857`))

          route.profile = route.provile || 'mapbox/driving';

          // Redraw route on each waypoint.
          if (route.waypoints.length > 1) {

            const response = await mapp.utils.xhr(`https://api.mapbox.com/directions/v5/${route.profile}/${route.waypoints.map(w => w.join(',')).join(';')}.json?access_token=${route.accessToken}`)

            //console.log(response)

            if (!response.routes.length) return;

            route.val = await mapp.utils.convert(response.routes[0].distance, route)

            if (route.duration) {

              route.val += ` (${await mapp.utils.convert(response.routes[0].duration, {units: 'seconds', convertTo: route.duration})} ${route.duration})`
            }

            options.popup()

            // Remove existing routeLayer from map.
            route.L && mapview.Map.removeLayer(route.L)

            // Create routeLayer with linestring geometry from polyline coordinates.
            route.L = mapview.geoJSON({
              zIndex: Infinity,
              geometry: mapboxPolyline.toGeoJSON(response.routes[0].geometry),
              dataProjection: '4326',
              Style: new ol.style.Style({
                stroke: new ol.style.Stroke(Object.assign({
                  color: '#333',
                  opacity: 0.5,
                  width: 2
                }, route.style || {}))
              })
            })

          }

        }
      }

    }

  }

})()