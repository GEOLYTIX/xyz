export default layer => {

  layer.style.hover.show = feature => {

    // The hover method must only execute if the display flag is set.
    if (!layer.style.hover.display) return;

    if (!layer.mapview.interaction.current) return;

    // Store current highlight key.
    let key = layer.mapview.interaction.current.key.toString()

    let paramString = mapp.utils.paramString({
      dbs: layer.dbs,
      locale: layer.mapview.locale.key,
      layer: layer.key,
      filter: feature.properties.count > 1 && layer.filter?.current,
      template: layer.style.hover.query || 'infotip',
      qID: layer.qID,
      id: feature.properties.id,
      table: layer.tableCurrent(),
      geom: layer.geom,
      field: layer.style.hover.field,
      coords: feature.properties.count > 1
        && ol.proj.transform(
          feature.getGeometry().getCoordinates(),
          `EPSG:${layer.mapview.srid}`,
          `EPSG:${layer.srid}`)
    })

    mapp.utils.xhr(`${layer.mapview.host}/api/query?${paramString}`)
      .then(response => {

        // Check whether highlight feature is still current.
        if(layer.mapview.interaction?.current?.key !== key) return;

        // Check whether cursor has position (in map).
        if (!layer.mapview.position) return;

        // Check whether there is a response to display.
        if (!response) return;

        // Check whether the response label field has a value.
        if (response.label == '') return;

        // Display the response label as infotip.
        layer.mapview.infotip(response.label)
      })
  }

}