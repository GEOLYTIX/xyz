import assignBtn from './assignBtn.mjs';

export default _xyz => params => {

  // Remove existing Leaflet map object.
  if (_xyz.tableview.node) {
    //_xyz.tableview.node.innerHTML = '';
    _xyz.tableview.node.style.display = 'none';
  }
    
  if (!params.target) return console.error('No target for tableview!');

  // Set XYZ map DOM.
  _xyz.tableview.node = params.target;

  _xyz.tableview.height = 'calc(100% - 55px)';
    
  // Load locale if defined in params or if no locale is yet loaded.
  if (!_xyz.workspace.locale || params.locale) _xyz.workspace.loadLocale(params);
                
  // Assign params to locale.
  // This makes it possible to override client side workspace entries.
  Object.assign(_xyz.workspace.locale, params);

  _xyz.tableview.resize_bar = _xyz.tableview.node.querySelector('.resize_bar');

  // Resize tableview while holding mousedown on resize_bar.
  _xyz.tableview.resize_bar.addEventListener('mousedown', e => {

    // Prevent text selection.
    e.preventDefault();
  
    document.body.style.cursor = 'grabbing';
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResize);
  });
      
  _xyz.tableview.nav_bar = _xyz.tableview.node.querySelector('.nav_bar > ul');

  _xyz.tableview.nav_bar.innerHTML = '';

  _xyz.tableview.btn = assignBtn(_xyz, params);

  // Augment viewChangeEnd method to update table.
  _xyz.mapview.changeEnd = _xyz.utils.compose(_xyz.mapview.changeEnd, () => {
    _xyz.tableview.updateTable();
  });

  // Resize the tableview container
  function resize(e) {

    // Get height from window height minus cursor position.
    const height = window.innerHeight - e.pageY;
  
    // Min height snap.
    if (height < 30) {
  
      // Stop resizing when minHeight is reached.
      _xyz.tableview.node.style.height = '40px';
      return stopResize();
    }
  
    // Full height snap.
    if (height > window.innerHeight) {
  
      // Stop resizing when full height is reached.
      _xyz.tableview.node.style.height = window.innerHeight + 'px';
      return stopResize();
    }
  
    _xyz.tableview.node.style.height = height + 'px';
  }
  
  // Remove eventListener after resize event.
  function stopResize() {
  
    document.body.style.cursor = 'auto';
    window.removeEventListener('mousemove', resize);
    window.removeEventListener('mouseup', stopResize);
  
    // Required for Firefox
    // window.dispatchEvent(new Event('resize'));
  
    _xyz.tableview.current_layer.tableview.table.redraw(true);
  }
     
};