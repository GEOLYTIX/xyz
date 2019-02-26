export default _xyz => params => {

  if(_xyz.tableview.nav_bar.children) {
  // Remove current from all tabs.
    Object
      .values(_xyz.tableview.nav_bar.children)
      .forEach(tab => tab.classList.remove('tab-current'));
  }

  if(params.table.tab) params.table.tab.remove();

  params.table.tab = _xyz.utils.createElement({
    tag: 'li',
    options: {
      textContent: params.table.title || params.table.key,
      classList: 'Tab cursor noselect tab-current'
    },
    eventListener: {
      event: 'click',
      funct: e => {

        // Remove current from all tabs.
        Object
          .values(_xyz.tableview.nav_bar.children)
          .forEach(tab => tab.classList.remove('tab-current'));

        // Make target tab current.
        e.target.classList.add('tab-current');

        params.table.activate();

      }
    },
    appendTo: _xyz.tableview.nav_bar
  });

};