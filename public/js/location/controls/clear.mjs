export default (_xyz, record) => {

  _xyz.utils.createElement({
    tag: 'i',
    options: {
      textContent: 'clear',
      className: 'material-icons cursor noselect btn_header',
      title: 'Remove feature from selection'
    },
    style: {
      color: record.color
    },
    appendTo: record.header,
    eventListener: {
      event: 'click',
      funct: e => {

        e.stopPropagation();

        record.drawer.remove();

        if (_xyz.state && _xyz.state != 'select') _xyz.switchState(record.location.layer, _xyz.state);

        if (record.location.id) {
          _xyz.hooks.filter('select', record.location.layer + '!' + record.location.table + '!' + record.location.id + '!' + record.location.marker[0] + ';' + record.location.marker[1]);
        }
        
        // Clear geometries and delete location to free up record.
        record.location.geometries.forEach(geom => _xyz.map.removeLayer(geom));
        // Clear additional geometries
        if(record.location.geometries.additional) record.location.geometries.additional.forEach(geom => _xyz.map.removeLayer(geom));
        delete record.location;

        // Run locations init when all records are free.
        const freeRecords = _xyz.locations.list.filter(record => !record.location);
        if (freeRecords.length === _xyz.locations.list.length) _xyz.locations.init();

      }
    }
  });
  
};