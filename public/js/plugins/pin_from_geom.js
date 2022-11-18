export default (function () {

  // Check whether turf already exist in global window.
  if (!window.turf) {

    window.turf = {}
  }

  // Check whether turf.pointOnFeature already exists.
  if (!turf.pointOnFeature) {

    // Store imported module outside async import method.
    let mod;

    turf.pointOnFeature = async function() {

      // Assign mod from outside if exists or load mod from skypack.
      mod = mod || await import('https://cdn.skypack.dev/pin/@turf/point-on-feature@v6.5.0-0qTkAn4gSLAJLUEFe62Q/mode=imports,min/optimized/@turf/point-on-feature.js')
    
      // Return default module execution with arguments provided to the async load method.
      return mod.default(...arguments);
    }
  }

  const geoJSON = new ol.format.GeoJSON();

  mapp.ui.locations.entries.pin_from_geom = entry => {

    // Remove existing pin layer
    entry.location.layer.mapview.Map.removeLayer(entry.L);

    // Create a geoJSON layer without feature.
    entry.L = entry.location.layer.mapview.geoJSON({
      zIndex: Infinity,
      Style: entry.Style || entry.location.pinStyle
    });

    (async ()=>{

      // Find geom lookup entry.
      const geom = entry.geomField && entry.location.infoj
        .find(lookup => lookup.field === entry.geomField)

      // Calculate point on geom.
      const point = await turf.pointOnFeature(geom.value)

      // Create feature from point geoJSON.
      const feature = geoJSON.readFeature(point,
        {
          dataProjection: `EPSG:${geom.srid || entry.location.layer.mapview.srid}`,
          featureProjection: `EPSG:${entry.location.layer.mapview.srid}`
        });

      // Add point feature to entry layer.
      entry.L.getSource().addFeature(feature)

    })()

    entry.location.Layers.push(entry.L)

    const chkbox = mapp.ui.elements.chkbox({
      label: entry.label || 'Pin',
      checked: true,//!!entry.display,
      onchange: (checked) => {
        entry.display = checked
        checked ?
          entry.location.layer.mapview.Map.addLayer(entry.L) :
          entry.location.layer.mapview.Map.removeLayer(entry.L);
      }
    })

    const node = mapp.utils.html.node`${chkbox}`

    return node
  }

})()