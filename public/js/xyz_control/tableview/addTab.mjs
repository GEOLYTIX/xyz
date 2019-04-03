export default _xyz => table => {

  let style = {};

  // Give selection colour if relevant
  if(table.location && table.location.style && table.location.style.color) style = {
      background: `-moz-linear-gradient(180deg, ${table.location.style.color} 0%, rgba(255,255,255,1) 12%)`,
      background: `-webkit-linear-gradient(180deg, ${table.location.style.color} 0%, rgba(255,255,255,1) 12%)`,
      background: `linear-gradient(180deg, ${table.location.style.color} 0%, rgba(255,255,255,1) 12%)`
    };

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
    style: style,
    eventListener: {
      event: 'click',
      funct: e => {

        // Remove current from all tabs.
        Object
          .values(_xyz.tableview.nav_bar.children)
          .forEach(tab => tab.classList.remove('tab-current'));

        // Make target tab current.
        e.target.classList.add('tab-current');

        if (_xyz.tableview.btn.tableViewport) _xyz.tableview.btn.tableViewport.style.display = 'none';

        table.activate();

      }
    },
    appendTo: _xyz.tableview.nav_bar
  });

};