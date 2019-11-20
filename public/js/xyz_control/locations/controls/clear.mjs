export default (_xyz, record) => {

  record.header.appendChild(_xyz.utils.wire()`
  <i
  style = "${'color: ' + record.color}"
  title = "Remove feature from selection"
  class = "material-icons cursor noselect btn_header"
  onclick = ${click}>clear`);

  function click(e) {
    e.stopPropagation();
    record.clear();
  }
 

  record.clear = () => {

    record.drawer.remove();

    if (_xyz.mapview.state && _xyz.mapview.state != 'select') _xyz.switchState(record.location.layer, _xyz.mapview.state);

    _xyz.hooks.filter(
      'locations',
      `${record.location.layer}!${record.location.table}!${record.location.id}`
    );

    record.location.remove();    
    
    delete record.location;

    delete record.clear;

    // Run listview clear if defined;
    if (_xyz.locations.listview.clear &&
      !_xyz.locations.listview.records.some(record => record.location)) {
      _xyz.locations.listview.clear.click();
    }

  };
  
};