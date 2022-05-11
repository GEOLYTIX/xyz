export default (function () {

  mapp.ui.locations.entries.isoline_pin = entry => {

    let point;

    if (entry.value) {

      point = new ol.Feature({
        geometry: new ol.geom.Point(
          ol.proj.fromLonLat(entry.value)),
      });
    }

    if (entry.location.layer.edit.isoline_here.lat && entry.location.layer.edit.isoline_here.lon) {

      mapp.utils.xhr({
        method: "POST",
        url: `${entry.location.layer.mapview.host}/api/location/update?` +
          mapp.utils.paramString({
            locale: entry.location.layer.mapview.locale.key,
            layer: entry.location.layer.key,
            table: entry.location.layer.table,
            id: entry.location.id,
          }),
        body: JSON.stringify({
          [entry.fields.lat]: entry.location.layer.edit.isoline_here.lat,
          [entry.fields.lon]: entry.location.layer.edit.isoline_here.lon
        }),
      });

      point = new ol.Feature({
        geometry: new ol.geom.Point(
          ol.proj.fromLonLat([
            entry.location.layer.edit.isoline_here.lon,
            entry.location.layer.edit.isoline_here.lat])),
      });

      delete entry.location.layer.edit.isoline_here.lat
      delete entry.location.layer.edit.isoline_here.lon
    }

    if (point) {
      const L = new ol.layer.Vector({
        zIndex: entry.location.layer.style.zIndex || 1,
        source: new ol.source.Vector({
          features: [point]
        })
      })

      entry.location.Layers.push(L)

      entry.location.layer.mapview.Map.addLayer(L)
    }

  }

})()