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

  if (_xyz.tableview.btn.tableViewport) _xyz.tableview.btn.tableViewport.style.display = 'none';

  _xyz.tableview.max_tabs = 6; // max tabs displayed in the panel
  
  let count1 = _xyz.tableview.nav_bar.children.length || 0,
      count2 = _xyz.tableview.nav_dropdown.children.length || 0,
      total_count = count1 + count2;

  console.log("hi I'm an add tab " + table.title);

  table.tab = _xyz.utils.createElement({
    tag: 'li',
    options: {
      textContent: table.title,
      classList: 'Tab cursor noselect'
    },
    style: style,
    eventListener: {
      event: 'click',
      funct: e => {
        
        Object
          .values(_xyz.tableview.nav_bar.children)
          .forEach(tab => tab.classList.remove('tab-current'));

        if(e.target.classList.contains('folded')){
          // put last tab in the dropdown
          _xyz.tableview.nav_bar.lastChild.classList.add('folded');
          _xyz.tableview.nav_dropdown.appendChild(_xyz.tableview.nav_bar.lastChild);

          // put new tab in the nav bar
          e.target.classList.remove('folded');
          _xyz.tableview.nav_bar.appendChild(e.target);
        } //else {
          //e.target.classList.add('tab-current');
        //}
          e.target.classList.add('tab-current');
          table.activate();

        //e.target.classList.add('tab-current');

        // set tab to current
        if (_xyz.tableview.btn.tableViewport) _xyz.tableview.btn.tableViewport.style.display = 'none';

        // hide dropdown if visible
        _xyz.tableview.nav_dropdown_content.classList.remove('show');
        
      }
    }
  });

  // assign the parent for tab based on count
  (total_count < _xyz.tableview.max_tabs) ? _xyz.tableview.nav_bar.appendChild(table.tab) : (table.tab.classList.add('folded'), _xyz.tableview.nav_dropdown.appendChild(table.tab));

  count1 = _xyz.tableview.nav_bar.children.length || 0;
  count2 = _xyz.tableview.nav_dropdown.children.length || 0;  
  total_count = count1 + count2;

  //_xyz.tableview.nav_bar.lastChild.classList.add('tab-current');
  if(!table.tab.classList.contains('folded')) {
    table.tab.classList.add('tab-current');
  } else {
    _xyz.tableview.nav_bar.lastChild.classList.add('tab-current');
  }
  
  if(count2 > 0) _xyz.tableview.nav_dropdown_btn.style.display = 'inline-flex';



  /*table.tab = _xyz.utils.createElement({
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
  });*/

};