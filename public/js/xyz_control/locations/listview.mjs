export default _xyz => {

  return {

    init: init,

    add: add,

  };


  function init(params) {

    if (_xyz.mobile) {
      _xyz.mobile.tabLocations.classList.add('displaynone');
      _xyz.mobile.activateLayersTab();
    }
    
    _xyz.locations.listview.node = params.target;

    // Hide the Locations Module.
    _xyz.locations.listview.node.parentElement.style.display = 'none';
    
    // Empty the locations list.
    _xyz.locations.listview.node.innerHTML = '';

    _xyz.locations.list
      .filter(record => !!record.location)
      .forEach(record => record.location.remove());


    _xyz.locations.list = [
      '#9c27b0',
      '#2196f3',
      '#009688',
      '#cddc39',
      '#ff9800',
      '#673ab7',
      '#03a9f4',
      '#4caf50',
      '#ffeb3b',
      '#ff5722',
      '#0d47a1',
      '#00bcd4',
      '#8bc34a',
      '#ffc107',
      '#d32f2f'
    ].map(color => ({
      style: {
        strokeColor: color
      }
    }));
         
  };


  function add(location) {

    if(!_xyz.locations.listview.node) return;

    _xyz.locations.listview.node.parentElement.style.display = 'block';
  
    Object.values(_xyz.locations.listview.node.children).forEach(el => el.classList.remove('expanded'));
     
    _xyz.locations.listview.node.insertBefore(location.view.drawer, _xyz.locations.listview.node.firstChild);
  
    if (_xyz.desktop) setTimeout(() => {
      _xyz.desktop.listviews.scrollTop = _xyz.desktop.listviews.clientHeight;
    }, 500);
  
    // Make select tab active on mobile device.
    if (_xyz.mobile) _xyz.mobile.activateLocationsTab();

  }

};