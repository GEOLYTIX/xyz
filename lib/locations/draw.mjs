
export default _xyz => function () {

    const location = this;

    location.Layer = _xyz.mapview.geoJSON({
        geometry: location.geometry,
        zIndex: 1999,
        style: [
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgba(255, 255, 255, 0.2)',
                    width: 8
                }),
            }),
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgba(255, 255, 255, 0.2)',
                    width: 6
                }),
            }),
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'rgba(255, 255, 255, 0.2)',
                    width: 4
                }),
            }),
            new ol.style.Style({
                stroke: location.style.strokeColor && new ol.style.Stroke({
                    color: location.style.strokeColor,
                    width: location.style.strokeWidth || 1
                }),
                fill: location.style.fillColor && new ol.style.Fill({
                    color: _xyz.utils.Chroma(location.style.fillColor).alpha(location.style.fillOpacity === undefined ? 1 : (parseFloat(location.style.fillOpacity)) || 0).rgba()
                }),
                // The default callback does not assign an image style for selected point locations.
            })
        ],
        dataProjection: location.layer.srid,
        featureProjection: _xyz.mapview.srid
    });

}