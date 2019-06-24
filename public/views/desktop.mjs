export default _xyz => {

  _xyz.desktop = {};

  // remove polyfill for IE11
  if (!('remove' in Element.prototype)) {
    Element.prototype.remove = function () {
      if (this.parentNode) {
        this.parentNode.removeChild(this);
      }
    };
  }

  _xyz.desktop.mask = document.getElementById('desktop_mask');

  _xyz.desktop.listviews = document.querySelector('.listviews > .scrolly');

  // add scrollbar on the left to control container.
  _xyz.utils.scrolly(_xyz.desktop.listviews);

  // reset scrollbar on control container after window resize.
  window.addEventListener('resize', () => _xyz.utils.scrolly(_xyz.desktop.listviews));


  const vertDivider = document.getElementById('vertDivider');

  // Resize tableview while holding mousedown on resize_bar.
  vertDivider.addEventListener('mousedown', e => {

    // Prevent text selection.
    e.preventDefault();
    
    document.body.style.cursor = 'grabbing';
    window.addEventListener('mousemove', resize_x);
    window.addEventListener('mouseup', stopResize_x);
  });
  
  // Resize tableview while holding mousedown on resize_bar.
  vertDivider.addEventListener('touchstart', e => {
  
    // Prevent text selection.
    e.preventDefault();
      
    window.addEventListener('touchmove', resize_x);
    window.addEventListener('touchend', stopResizeTouch_x);
  });

  // Resize the tableview container
  function resize_x(e) {

    let width;
  
    if (e.touches) {

      if (e.touches[0].pageX < 333) return;
  
      // Get height from window height minus first finger touch position.
      width = e.touches[0].pageX;
  
    } else {

      if (e.pageX < 333) return;
  
      // Get height from window height minus cursor position.
      width = e.pageX;
    }
       
    // Full width snap.
    if (width > (window.innerWidth / 2)) width = window.innerWidth / 2;
    
    document.body.style.gridTemplateColumns = `${width}px 10px auto`;
  
  }
    
  // Remove eventListener after resize event.
  function stopResize_x() {

    _xyz.map.updateSize();
    
    document.body.style.cursor = 'auto';
    window.removeEventListener('mousemove', resize_x);
    window.removeEventListener('mouseup', stopResize_x);
  }
  
  // Remove eventListener after resize event.
  function stopResizeTouch_x() {

    _xyz.map.updateSize();
    
    window.removeEventListener('touchmove', resize_x);
    window.removeEventListener('touchend', stopResizeTouch_x);
  }


  const hozDivider = document.getElementById('hozDivider');

  // Resize tableview while holding mousedown on resize_bar.
  hozDivider.addEventListener('mousedown', e => {

    // Prevent text selection.
    e.preventDefault();
    
    document.body.style.cursor = 'grabbing';
    window.addEventListener('mousemove', resize_y);
    window.addEventListener('mouseup', stopResize_y);
  });
  
  // Resize tableview while holding mousedown on resize_bar.
  hozDivider.addEventListener('touchstart', e => {
  
    // Prevent text selection.
    e.preventDefault();
      
    window.addEventListener('touchmove', resize_y);
    window.addEventListener('touchend', stopResizeTouch_y);
  });

  // Resize the tableview container
  function resize_y(e) {

    let height;

    if (e.touches) {

      if (e.touches[0].pageY < 0) return;

      // Get height from window height minus first finger touch position.
      height = window.innerHeight - e.touches[0].pageY;

    } else {

      if (e.pageY < 0) return;

      // Get height from window height minus cursor position.
      height = window.innerHeight - e.pageY;
    }
    
    // Min height snap.
    if (height < 40) return;
    
    // Full height snap.
    if (height > (window.innerHeight - 10)) height = window.innerHeight;
    
    document.body.style.gridTemplateRows = `minmax(0, 1fr) ${height}px`;
  }
    
  // Remove eventListener after resize event.
  function stopResize_y() {

    _xyz.map.updateSize();
    
    document.body.style.cursor = 'auto';
    window.removeEventListener('mousemove', resize_y);
    window.removeEventListener('mouseup', stopResize_y);
     
    if(_xyz.tableview.current_table.Tabulator) _xyz.tableview.current_table.Tabulator.redraw(true);
  }
  
  // Remove eventListener after resize event.
  function stopResizeTouch_y() {

    _xyz.map.updateSize();
    
    window.removeEventListener('touchmove', resize_y);
    window.removeEventListener('touchend', stopResizeTouch_y);
       
    if(_xyz.tableview.current_table.Tabulator) _xyz.tableview.current_table.Tabulator.redraw(true);
  }
};