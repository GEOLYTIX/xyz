export default _xyz => function () {

  const layer = this;
  
  // Request to get the extent of layer data.
  const xhr = new XMLHttpRequest();

  // Create filter from legend and current filter.
  const filter = Object.assign({}, layer.filter.legend, layer.filter.current);

  xhr.open('GET', _xyz.host + '/api/layer/extent?' + _xyz.utils.paramString({
    locale: _xyz.workspace.locale.key,
    layer: layer.key,
    filter: JSON.stringify(filter),
    token: _xyz.token
  }));

  xhr.onload = e => {
    if (e.target.status !== 200) return;

    // Show the layer on map.
    layer.show();

    // Split the bounds from response.
    const bounds = e.target.responseText.split(',');

    const fGroup = [_xyz.mapview.lib.polygon([
      [bounds[1], bounds[0]],
      [bounds[1], bounds[2]],
      [bounds[3], bounds[2]],
      [bounds[3], bounds[0]],
    ])];

    if (_xyz.mapview && _xyz.mapview.locate && _xyz.mapview.locate.active) fGroup.push(_xyz.mapview.locate.L);

    // Fly to the bounds.
    _xyz.map.flyToBounds(_xyz.mapview.lib.featureGroup(fGroup).getBounds(),{
      padding: [25, 25]
    });
    
  };

  xhr.send();
  
};