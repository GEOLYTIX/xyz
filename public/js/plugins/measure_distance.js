// required for converting mapbox route polyline to geojson.
import mapboxPolyline from 'https://cdn.skypack.dev/@mapbox/polyline';

export default (function () {

  mapp.plugins.measure_distance = (plugin, mapview) => {

    // Assign route as routes array.
    if (plugin.route) {
      plugin.routes = [plugin.route]
    }

    // Find the btnColumn element.
    const btnColumn = document.getElementById('mapButton');

    // Append the plugin btn to the btnColumn.
    btnColumn && btnColumn.append(mapp.utils.html.node`
    <button
      title="Measure distance"
      onclick=${measure_distance}>
      <div class="mask-icon straighten">`);


    function measure_distance(e) {

      // Cancel draw interaction if active.
      if (e.target.classList.contains('active')) return mapview.interactions.highlight()

      // Style plugin button as active.
      e.target.classList.add('active')

      // Config for mapview draw interaction.
      const config = {
        type: 'LineString',

        // Prevent contextmenu showing at drawend event.
        drawend: null,

        // Tooltip for geometry drawn by interaction.
        tooltip: Object.assign(plugin.tooltip, {
          metric: 'length',
          onChange
        }),

        // Callback for interaction finished/cancelled.
        callback: () => {

          // Remove routeLayer from map.
          plugin.routes?.forEach(route => mapview.Map.removeLayer(route.L))

          // Remove active class from button.
          e.target.classList.remove('active')
        }
      }

      // Assign popup method for async routing methods.
      plugin.popup = ()=>{
        mapview.popup({
          content: mapp.utils.html.node`
            <div style="padding: 5px">
            <span style="white-space: nowrap;">${plugin.val}</span>
            ${plugin.routes?.filter(route=> route.val)
                .map(route => {
                  return mapp.utils.html`<br><span style="white-space: nowrap;">${route.val}</span>`})}`
        })
      }

      // Assigned to geometry onChange event on drawStart of interaction.
      async function onChange(e) {
        
        // Assign length value for drawing geometry.
        plugin.val = await mapp.utils.convert(mapview.metrics.length(e.target), config.tooltip)
        plugin.popup()
      }

      // Assign different routing methods to the routes object.
      const routes = {
        here,
        mapbox
      }

      // Create array of drawing geometry conditions from routing methods.
      config.conditions = plugin.routes?.map(route => routes[route.provider](route))

      // Initiate drawing on mapview with config as interaction argument.
      mapview.interactions.draw(config)

      function here(route) {

        route.waypoints = []; // Array for route waypoints.
        route.section; // The section of the route.
        delete route.val; // Delete value on new route.

        return async e => {

          // Push waypoint from click into array.
          route.waypoints.push(ol.proj.toLonLat([
            e.coordinate[0],
            e.coordinate[1]
          ], 'EPSG:3857'))

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
                + `${encodeURIComponent('https://router.hereapi.com/v8/routes?'
                  + `${mapp.utils.paramString(params)}&{HERE}`)}`)

            if (!response.routes.length) return;

            // Assign val string from converted route section distance.
            route.val = await mapp.utils.convert(response.routes[0].sections[0].summary.length, route)

            // Add route duration to display value.
            if (route.duration) {

              // Convert route section duration into route.duration key-value.
              route.val += ` (${await mapp.utils.convert(response.routes[0].sections[0].summary.duration, {units: 'seconds', convertTo: route.duration})} ${route.duration})`
            }

            // Redraw mapview popup.
            plugin.popup()

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

              // Assign style from route entry.
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
          ], 'EPSG:3857'))

          route.profile = route.profile || 'mapbox/driving';

          // Redraw route on each waypoint.
          if (route.waypoints.length > 1) {

            const response = await mapp.utils.xhr(`https://api.mapbox.com/directions/v5/${route.profile}/${route.waypoints.map(w => w.join(',')).join(';')}.json?access_token=${route.accessToken}`)

            if (!response.routes.length) return;

            // Assign val string from converted route section distance.
            route.val = await mapp.utils.convert(response.routes[0].distance, route)

            // Add route duration to display value.
            if (route.duration) {

              // Convert route section duration into route.duration key-value.
              route.val += ` (${await mapp.utils.convert(response.routes[0].duration, {units: 'seconds', convertTo: route.duration})} ${route.duration})`
            }

            // Redraw mapview popup.
            plugin.popup()

            // Remove existing routeLayer from map.
            route.L && mapview.Map.removeLayer(route.L)

            // Create routeLayer with linestring geometry from polyline coordinates.
            route.L = mapview.geoJSON({
              zIndex: Infinity,
              geometry: mapboxPolyline.toGeoJSON(response.routes[0].geometry),
              dataProjection: '4326',

              // Assign style from route entry.
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