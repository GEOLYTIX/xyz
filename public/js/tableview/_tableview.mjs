import utils from './utils/_utils.mjs';

import tableview from './tableview.mjs';

import layout from './layout.mjs';

import nav from './nav.mjs';

export default _xyz => {

  utils(_xyz);

  _xyz.tableview.init = () => {

    _xyz.tableview.container = document.getElementById('tableview');

    _xyz.tableview.resize_bar = _xyz.tableview.container.querySelector('.resize_bar');
    
    _xyz.tableview.nav_bar = _xyz.tableview.container.querySelector('.nav_bar');

    _xyz.tableview.table = _xyz.tableview.container.querySelector('.table');

    //tableview(_xyz);

    _xyz.tableview.createTable({
      layer: _xyz.layers.list.COUNTRIES,
      target: _xyz.tableview.table
    });


    _xyz.tableview.resize_bar.addEventListener('mousedown', e => {

      e.preventDefault();
      // e.target.style.cursor = 'grabbing';

      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResize);
    });

    function resize(e) {

      _xyz.tableview.container.style.height = _xyz.tableview.container.parentNode.clientHeight - e.pageY + 'px';

    }

    function stopResize(e) {

      // e.target.style.cursor = 'auto';

      window.removeEventListener('mousemove', resize);
    }

  };
    
};