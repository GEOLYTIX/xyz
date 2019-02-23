export default (_xyz, record) => {
    
  _xyz.utils.createElement({
    tag: 'i',
    options: {
      textContent: 'search',
      className: 'material-icons cursor noselect btn_header',
      title: 'Zoom map to feature bounds'
    },
    style: {
      color: record.color
    },
    appendTo: record.header,
    eventListener: {
      event: 'click',
      funct: e => {

        e.stopPropagation();

        if (record.location.geometry.type === 'Point') {

          _xyz.map.flyTo(
            {
              lat: record.location.geometry.coordinates[1],
              lng: record.location.geometry.coordinates[0],
            },
            _xyz.workspace.locale.maxZoom);

        } else {

          _xyz.map.flyToBounds(record.location.Layer.getBounds());

        }

      }
    }
  });
  
};