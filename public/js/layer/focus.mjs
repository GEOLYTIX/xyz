export default (_xyz, layer) => {

  layer.zoomToExtent = zoomToExtent;

  layer.focus = _xyz.utils.createElement({
    tag: 'i',
    options: {
      textContent: 'fullscreen',
      className: 'material-icons cursor noselect btn_header',
      title: 'Zoom to layer extent'
    },
    appendTo: layer.header,
    eventListener: {
      event: 'click',
      funct: e => {
        e.stopPropagation();
        zoomToExtent();
      }
    }
  });

  function zoomToExtent(){

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

      const fGroup = [_xyz.L.polygon([
        [bounds[1], bounds[0]],
        [bounds[1], bounds[2]],
        [bounds[3], bounds[2]],
        [bounds[3], bounds[0]],
      ])];

      if (_xyz.mapview && _xyz.mapview.locate && _xyz.mapview.locate.active) fGroup.push(_xyz.mapview.locate.L);

      // Fly to the bounds.
      _xyz.map.flyToBounds(_xyz.L.featureGroup(fGroup).getBounds(),{
        padding: [25, 25]
      });
    
    };

    xhr.send();
  }
  
};