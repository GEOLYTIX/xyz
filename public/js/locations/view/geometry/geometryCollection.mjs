export default _xyz => entry => {

	entry.location.geometryCollection = [];

	entry.value.features.map(feature => {

		let style;

		if(entry.style.theme.type === 'categorized') style = entry.style.theme && entry.style.theme.cat[feature.properties[entry.style.theme.field]].style;

        if(entry.style.theme.type === 'graduated') {

        	for (let i = 0; i < entry.style.theme.cat_arr.length; i++) {

        		if (feature.properties[entry.style.theme.field] < entry.style.theme.cat_arr[i].value) break;

        		style = entry.style.theme.cat_arr[i].style;
            }

          }

          let f = _xyz.mapview.geoJSON({
            geometry: feature.geometry,
            dataProjection: '4326',
            zIndex: 999,
            style: new _xyz.mapview.lib.style.Style({
              stroke: style.strokeColor && new _xyz.mapview.lib.style.Stroke({
                color: _xyz.utils.Chroma(style.color || style.strokeColor).alpha(1),
                width: entry.style.strokeWidth || 1
              }),
              fill: new _xyz.mapview.lib.style.Fill({
                color: _xyz.utils.Chroma(style.fillColor || style.strokeColor).alpha(style.fillOpacity === undefined ? 1 : parseFloat(style.fillOpacity) || 0).rgba()
              })
            })
          });

          entry.location.geometryCollection.push(f);

        });

	entry.location.geometries.push(entry.location.geometryCollection);
    entry.display = true;

}