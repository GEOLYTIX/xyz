import assignBtn from './assignBtn.mjs';

export default _xyz => params => {

  if (!params.target) return;

  _xyz.tableview.tables = [];

  if (_xyz.tableview.node) {
    _xyz.tableview.node.style.display = 'none';
    _xyz.mapview.node.style.height = '100%';
  }
  
  // Set tableview node.
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

  // Resize tableview while holding mousedown on resize_bar.
  _xyz.tableview.resize_bar.addEventListener('touchstart', e => {

    // Prevent text selection.
    e.preventDefault();
    
    window.addEventListener('touchmove', resize);
    window.addEventListener('touchend', stopResizeTouch);
  });
      
  _xyz.tableview.nav_bar = _xyz.tableview.node.querySelector('.nav_bar > ul.nav_bar-nav');
  _xyz.tableview.nav_dropdown = _xyz.tableview.node.querySelector('.nav_bar .tab-dropdown-content ul'); 
  _xyz.tableview.nav_dropdown_content = _xyz.tableview.node.querySelector('.nav_bar .tab-dropdown-content');
  _xyz.tableview.nav_dropdown_btn = _xyz.tableview.node.querySelector('.nav_bar .tab-dropdown');

  _xyz.tableview.nav_bar.innerHTML = '';

  _xyz.tableview.btn = assignBtn(_xyz, params);


  if (_xyz.mapview.node) {

    _xyz.mapview.node.addEventListener('changeEnd', ()=>{
      _xyz.tableview.current_table &&
      _xyz.tableview.current_table.viewport &&
      _xyz.tableview.current_table.update();
    });

  }

  
  // Resize the tableview container
  function resize(e) {

    let height;

    if (e.touches) {

      // Get height from window height minus first finger touch position.
      height = window.innerHeight - e.touches[0].pageY;

    } else {

      // Get height from window height minus cursor position.
      height = window.innerHeight - e.pageY;

    }
  
    // Min height snap.
    if (height < 30) {
  
      // Stop resizing when minHeight is reached.
      _xyz.tableview.node.style.height = '40px';

      if (params.btn.toggleTableview) params.btn.toggleTableview.textContent = 'vertical_align_top';
    }
  
    // Full height snap.
    if (height > window.innerHeight) {
  
      // Stop resizing when full height is reached.
      _xyz.tableview.node.style.height = window.innerHeight + 'px';
      
      if (params.btn.toggleTableview) params.btn.toggleTableview.textContent = 'vertical_align_bottom';
    }
  
    _xyz.tableview.node.style.height = height + 'px';

  }
  
  // Remove eventListener after resize event.
  function stopResize() {
  
    document.body.style.cursor = 'auto';
    window.removeEventListener('mousemove', resize);
    window.removeEventListener('mouseup', stopResize);
   
    _xyz.tableview.current_table.Tabulator.redraw(true);
  }

  // Remove eventListener after resize event.
  function stopResizeTouch() {
  
    window.removeEventListener('touchmove', resize);
    window.removeEventListener('touchend', stopResizeTouch);
     
    _xyz.tableview.current_table.Tabulator.redraw(true);
  }

  // Show or hide dropdown with collapsed tabs
  _xyz.tableview.nav_dropdown_btn.addEventListener('click', e => {
    _xyz.tableview.nav_dropdown_content.classList.toggle('show');
  });

  _xyz.tableview.resizeObserve();
     
};