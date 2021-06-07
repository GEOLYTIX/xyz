export default _xyz => entry => {

    if (!entry.value.features) return;

    entry.value.features.map(feature => {

        let style;

        if (!entry.style) style = entry.location.style;

        if (!entry.style.theme) style = entry.style;

        if (entry.style.theme && entry.style.theme.type === 'categorized') style = entry.style.theme && entry.style.theme.cat[feature.properties[entry.style.theme.field]].style;

        if (entry.style.theme && entry.style.theme.type === 'graduated') {

            for (let i = 0; i < entry.style.theme.cat_arr.length; i++) {

                if (feature.properties[entry.style.theme.field] < entry.style.theme.cat_arr[i].value) break;

                style = entry.style.theme.cat_arr[i].style;
            }

        }

        let f = _xyz.mapview.geoJSON({
            geometry: feature.geometry,
            dataProjection: '4326',
            zIndex: entry.location.layer.L.getZIndex() - 1,
            style: new ol.style.Style({
                image: _xyz.mapview.icon(style.marker || {}),
                stroke: style.strokeColor && new ol.style.Stroke({
                    color: _xyz.utils.Chroma(style.color || style.strokeColor).alpha(1),
                    width: entry.style.strokeWidth || 1
                }),
                fill: new ol.style.Fill({
                    color: _xyz.utils.Chroma(style.fillColor || style.strokeColor).alpha(style.fillOpacity === undefined ? 1 : parseFloat(style.fillOpacity) || 0).rgba()
                })
            })
        });

        entry.location.geometryCollection.push(f);

    });

    entry.location.geometries.push(entry.location.geometryCollection);
    entry.display = true;

    if (!entry.style || !entry.style.theme) return;

    if (!entry.style.theme.legend) return;

    entry.legend = _xyz.utils.html.node `
      <div class="${`${entry.class} legend`}">`;

    Object.entries(entry.style.theme.cat).forEach(cat => {

      entry.legend.appendChild(_xyz.utils.svg.node `
        <svg height=20 width=20>
          <rect
            width=20 height=20
            fill=${cat[1].style.fillColor || '#FFF'}
            fill-opacity=${cat[1].style.fillOpacity}
            stroke=${cat[1].style.strokeColor}
            stroke-width=${cat[1].style.strokeWidth || 1}>`)


      entry.legend.appendChild(_xyz.utils.html.node `
        <div
          class="label switch">${cat[1].label || cat[0]}`)

    });

    entry.container.style.display = "block";

    entry.container.appendChild(entry.legend);

}