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

        if (_xyz.mapview.state && _xyz.mapview.state != 'select') _xyz.switchState(record.location.layer, _xyz.mapview.state);

        if (record.location.id) {
          _xyz.hooks.filter('select', record.location.layer + '!' + record.location.table + '!' + record.location.id + '!' + record.location.marker[0] + ';' + record.location.marker[1]);
        }

        record.location.remove();
        
        delete record.location;

        // Run locations init when all records are free.
        const freeRecords = _xyz.locations.listview.list.filter(record => !record.location);
        if (freeRecords.length === _xyz.locations.listview.list.length) _xyz.locations.listview.init();

      }
    }
  });
  
};