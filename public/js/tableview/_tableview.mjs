import createTable from './createTable.mjs';

import updateTable from './updateTable.mjs';

export default _xyz => {

  createTable(_xyz);

  updateTable(_xyz);

  _xyz.tableview.init = () => {

    _xyz.tableview.container = document.getElementById('tableview');

    _xyz.tableview.height = 'calc(100% - 55px)';

    _xyz.tableview.resize_bar = _xyz.tableview.container.querySelector('.resize_bar');
      
    _xyz.tableview.nav_bar = _xyz.tableview.container.querySelector('.nav_bar > ul');

    _xyz.tableview.nav_bar.innerHTML = '';

    // Show tableview if some layers have tableview
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

    // Create tabs in nav_bar for each layer with a table_view.
    Object.values(_xyz.layers.list).forEach(layer => {

      if (!layer.table_view) return;

      _xyz.utils.createElement({
        tag: 'li',
        options: {
          textContent: layer.name,
          classList: 'Tab cursor noselect'
        },
        eventListener: {
          event: 'click',
          funct: e => {

            // Remove current from all tabs.
            Object.values(_xyz.tableview.nav_bar.children).forEach(tab => tab.classList.remove('tab-current'));

            // Make target tab current.
            e.target.classList.add('tab-current');
              
            _xyz.tableview.createTable({
              layer: layer,
              target: _xyz.tableview.container.querySelector('.table')
            });

          }
        },
        appendTo: _xyz.tableview.nav_bar
      });

    });

    // Click first tab.
    Object.values(_xyz.tableview.nav_bar.children)[0].click();


    // Augment viewChangeEnd method to update table.
    _xyz.viewChangeEnd = _xyz.utils.compose(_xyz.viewChangeEnd, () => {
      _xyz.tableview.updateTable();
    });


    // Resize tableview while holding mousedown on resize_bar.
    _xyz.tableview.resize_bar.addEventListener('mousedown', e => {

      // Prevent text selection.
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

    // Remove eventListener after resize event.
    function stopResize() {

      document.body.style.cursor = 'auto';
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResize);

      // Required for Firefox
      // window.dispatchEvent(new Event('resize'));

      _xyz.tableview.current_layer.table_view.table.redraw(true);
    }

    // Toggle tableview between full and min height.
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

  };
    
};