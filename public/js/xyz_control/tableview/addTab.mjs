export default _xyz => table => {

  // Remove current from all tabs.
  Object
    .values(_xyz.tableview.nav_bar.children)
    .forEach(tab => tab.classList.remove('tab-current'));

  if(table.tab) table.tab.remove();

  table.tab = _xyz.utils.createElement({
    tag: 'li',
    options: {
      textContent: table.title,
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

        table.activate();

      }
    },
    appendTo: _xyz.tableview.nav_bar
  });

};