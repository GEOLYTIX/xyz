import utils from './utils/_utils.mjs';

import layout from './layout.mjs';

import nav from './nav.mjs';

export default _xyz => {

  utils(_xyz);

  _xyz.tableview.init = () => {

    _xyz.tableview.container = document.getElementById('tableview');

    _xyz.tableview.resize_bar = _xyz.tableview.container.querySelector('.resize_bar');
    
    _xyz.tableview.nav_bar = _xyz.tableview.container.querySelector('.nav_bar');

    _xyz.tableview.table = _xyz.tableview.container.querySelector('.table');



    _xyz.tableview.createTable({
      layer: _xyz.layers.list.COUNTRIES,
      target: _xyz.tableview.table
    });

    //_xyz.tableview.appendChild(_xyz.layers.list.COUNTRIES.table);




    _xyz.tableview.resize_bar.addEventListener('mousedown', e => {

      e.preventDefault();
      document.body.style.cursor = 'grabbing';

      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResize);
    });

    // Resize the tableview container
    function resize(e) {

      // Get height from window height minus cursor position.
      const height = window.innerHeight - e.pageY;

      // Min height snap.
      if (height < 30) {

        // Stop resizing when minHeight is reached.
        _xyz.tableview.container.style.height = '40px';
        return stopResize();
      }

      // Full height snap.
      if (height > window.innerHeight) {

        // Stop resizing when full height is reached.
        _xyz.tableview.container.style.height = window.innerHeight + 'px';
        return stopResize();
      }

      _xyz.tableview.container.style.height = height + 'px';
    }

    function stopResize() {

      document.body.style.cursor = 'auto';
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResize);

      // Required for Firefox
      // window.dispatchEvent(new Event('resize'));

      _xyz.layers.list.COUNTRIES.tableView.table.redraw(true);
    }

    document.getElementById('toggleTableview').onclick = () =>{
      _xyz.tableview.container.style.height = window.innerHeight + 'px';
    };

    function resizeFull() {
      let top = parseInt(_xyz.tableview.container.style.top) >= 0 ? 'calc(100% - 16px)' : 0;
      _xyz.tableview.container.style.transition = '1s';
      _xyz.tableview.container.style.top = top;
      _xyz.tableview.container.addEventListener('transitionend', e => {
        e.target.style.transition = '';
      });
    }


    var tabs = document.getElementsByClassName('Tab');

    Array.prototype.forEach.call(tabs, function(tab) {
      tab.addEventListener('click', setActiveClass);
    });

    function setActiveClass(evt) {
      Array.prototype.forEach.call(tabs, function(tab) {
        tab.classList.remove('tab-current');
      });
	
      evt.currentTarget.classList.add('tab-current');


      _xyz.layers.list.COUNTRIES.tableView.table.redraw(true);


      // _xyz.tableview.createTable({
      //   layer: _xyz.layers.list.COUNTRIES,
      //   target: _xyz.tableview.table
      // });

      

    }

  };
    
};