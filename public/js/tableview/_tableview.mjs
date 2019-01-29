import createTable from './createTable.mjs';

import updateTable from './updateTable.mjs';

export default _xyz => {

  _xyz.tableview.createTable = createTable(_xyz);

  _xyz.tableview.updateTable = updateTable(_xyz);

  _xyz.tableview.container = document.getElementById('tableview');

  _xyz.tableview.resize_bar = _xyz.tableview.container.querySelector('.resize_bar');
    
  _xyz.tableview.nav_bar = _xyz.tableview.container.querySelector('.nav_bar > ul');

  _xyz.tableview.table = _xyz.tableview.container.querySelector('.table');

  _xyz.tableview.init = () => {

    _xyz.tableview.nav_bar.innerHTML = '';

    _xyz.tableview.table.innerHTML = '';

    if (Object.values(_xyz.layers.list).some(layer => layer.table_view)) {

      _xyz.map_dom.style.height = 'calc(100% - 40px)';
      _xyz.map.invalidateSize();
      _xyz.tableview.container.style.display = 'block';

    } else {

      _xyz.map_dom.style.height = '100%';
      _xyz.map.invalidateSize();
      _xyz.tableview.container.style.display = 'none';

      return;
    }

    Object.values(_xyz.layers.list).map(layer => {

      if (layer.table_view) {

        _xyz.utils.createElement({
          tag: 'li',
          options: {
            textContent: layer.name,
            classList: 'Tab cursor noselect'
          },
          eventListener: {
            event: 'click',
            funct: e => {
              Object.values(_xyz.tableview.nav_bar.children).forEach(tab => tab.classList.remove('tab-current'));

              e.target.classList.add('tab-current');

              _xyz.tableview.table.innerHTML = '';
              
              _xyz.tableview.createTable({
                layer: layer,
                target: _xyz.tableview.table
              });

            }
          },
          appendTo: _xyz.tableview.nav_bar
        });
        
      }
    });

    Object.values(_xyz.tableview.nav_bar.children)[0].click();


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

      _xyz.tableview.current_table.redraw(true);
    }

    document.getElementById('toggleTableview').onclick = function(){

      _xyz.tableview.container.style.transition = 'height 0.2s ease-out';

      setTimeout(()=>_xyz.tableview.container.style.transition = 'none', 200);

      if (this.textContent === 'vertical_align_bottom') {

        this.textContent = 'vertical_align_top';
        _xyz.tableview.container.style.height = '40px';
        return;

      }

      this.textContent = 'vertical_align_bottom';
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

  };
    
};