export default _xyz => params => {

  // Remove current from all tabs.
  Object.values(_xyz.tableview.nav_bar.children).forEach(tab => tab.classList.remove('tab-current'));

  _xyz.utils.createElement({
    tag: 'li',
    options: {
      textContent: params.layer.name,
      classList: 'Tab cursor noselect tab-current'
    },
    eventListener: {
      event: 'click',
      funct: e => {

        // Remove current from all tabs.
        Object.values(_xyz.tableview.nav_bar.children).forEach(tab => tab.classList.remove('tab-current'));

        // Make target tab current.
        e.target.classList.add('tab-current');

        _xyz.tableview.current_layer = params.layer;

        params.Tab();

      }
    },
    appendTo: _xyz.tableview.nav_bar
  });

};