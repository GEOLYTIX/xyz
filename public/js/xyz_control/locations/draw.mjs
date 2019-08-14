export default _xyz => function (style = {}) {

  if (!_xyz.map) return;

  const location = this;

  location.style.zIndex = 20;

  Object.assign(location.style, style);

  location.Layer = _xyz.mapview.geoJSON({
    json: {
      type: 'Feature',
      geometry: location.geometry,
    },
    pane: location.style.pane || 'select',
    //style: style || location.style,
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
        stroke: new _xyz.mapview.lib.style.Stroke({
          color: location.style.color || '#FFF',
          width: 2
        }),
        fill: new _xyz.mapview.lib.style.Fill({
          color: _xyz.utils.chroma(location.style.color).alpha(location.style.fillOpacity === 0 ? 0 : parseFloat(location.style.fillOpacity) || 1).rgba()
        }),
        image: _xyz.mapview.icon(location.style.icon),
        // image: new _xyz.mapview.lib.style.Circle({
        //   radius: 7,
        //   fill: new _xyz.mapview.lib.style.Fill({
        //     color: 'rgba(0, 0, 0, 0.01)'
        //   }),
        //   stroke: new _xyz.mapview.lib.style.Stroke({
        //     color: '#EE266D',
        //     width: 2
        //   })
        // })
      })
    ],
    dataProjection: _xyz.layers.list[location.layer].srid,
    featureProjection: '3857'
  });

  //_xyz.map.addLayer(location.Layer);

};