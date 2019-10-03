export default _xyz => {

  return {

    init: init,

    add: add

  };


  function init(params) {

    _xyz.locations.listview.callbackAdd = _xyz.locations.listview.callbackAdd || params.callbackAdd;

    _xyz.locations.listview.callbackInit = _xyz.locations.listview.callbackInit || params.callbackInit;
  
    _xyz.locations.listview.node = _xyz.locations.listview.node || params.target;
   
    // Empty the locations list.
    _xyz.locations.listview.node.innerHTML = '';

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

    _xyz.locations.listview.callbackInit && _xyz.locations.listview.callbackInit();
         
  };


  function add(location) {

    if(!_xyz.locations.listview.node) return;

    _xyz.locations.listview.node.parentElement.style.display = 'block';
  
    Object.values(_xyz.locations.listview.node.children).forEach(el => el.classList.remove('expanded'));
     
    _xyz.locations.listview.node.insertBefore(location.view.drawer, _xyz.locations.listview.node.firstChild);
  
    _xyz.locations.listview.callbackAdd && _xyz.locations.listview.callbackAdd();

  }

};