
export default _xyz => function () {

    const location = this;

    location.Layer = _xyz.mapview.geoJSON({
        geometry: location.geometry,
        style: [
            new _xyz.mapview.lib.style.Style({
                stroke: new _xyz.mapview.lib.style.Stroke({
                    color: 'rgba(255, 255, 255, 0.2)',
                    width: 8
                }),
            }),
            new _xyz.mapview.lib.style.Style({
                stroke: new _xyz.mapview.lib.style.Stroke({
                    color: 'rgba(255, 255, 255, 0.2)',
                    width: 6
                }),
            }),
            new _xyz.mapview.lib.style.Style({
                stroke: new _xyz.mapview.lib.style.Stroke({
                    color: 'rgba(255, 255, 255, 0.2)',
                    width: 4
                }),
            }),
            new _xyz.mapview.lib.style.Style({
                stroke: location.style.strokeColor && new _xyz.mapview.lib.style.Stroke({
                    color: location.style.strokeColor,
                    width: location.style.strokeWidth || 1
                }),
                fill: location.style.fillColor && new _xyz.mapview.lib.style.Fill({
                    color: _xyz.utils.Chroma(location.style.fillColor).alpha(location.style.fillOpacity === 0 ? 0 : parseFloat(location.style.fillOpacity) || 1).rgba()
                }),
                // The default callback does not assign an image style for selected point locations.
            })
        ],
        dataProjection: location.layer.srid,
        featureProjection: _xyz.mapview.srid
    });

}