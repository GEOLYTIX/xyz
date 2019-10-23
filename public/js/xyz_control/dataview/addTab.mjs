export default _xyz => table => {

  _xyz.map.updateSize();

  let style = {};

  // Give selection colour if relevant
  if(table.location && table.location.style && table.location.style.color) style = {
    background: `-moz-linear-gradient(180deg, ${table.location.style.color} 0%, rgba(255,255,255,1) 12%)`,
    background: `-webkit-linear-gradient(180deg, ${table.location.style.color} 0%, rgba(255,255,255,1) 12%)`,
    background: `linear-gradient(180deg, ${table.location.style.color} 0%, rgba(255,255,255,1) 12%)`
  };

  // Remove current from all tabs.
  Object
    .values(_xyz.dataview.nav_bar.children)
    .forEach(tab => tab.classList.remove('tab-current'));

  if(table.tab) table.tab.remove();

  if (_xyz.dataview.btn.dataViewport) _xyz.dataview.btn.dataViewport.style.display = 'none';

  _xyz.dataview.max_tabs = 6; // max tabs displayed in the panel
  
  let
    count1 = _xyz.dataview.nav_bar.children.length || 0,
    count2 = _xyz.dataview.nav_dropdown.children.length || 0,
    total_count = count1 + count2;

  table.tab = _xyz.utils.wire()`<li
  class="Tab cursor noselect"
  style="${style}"
  onclick=${e => {
    Object
      .values(_xyz.dataview.nav_bar.children)
      .forEach(tab => tab.classList.remove('tab-current'));

    if(e.target.classList.contains('folded')){
    // put last tab in the dropdown
      _xyz.dataview.nav_bar.lastChild.classList.add('folded');
      _xyz.dataview.nav_dropdown.appendChild(_xyz.dataview.nav_bar.lastChild);

      // put new tab in the nav bar
      e.target.classList.remove('folded');
      _xyz.dataview.nav_bar.appendChild(e.target);
    } 
    e.target.classList.add('tab-current');

    table.activate();

    // set tab to current
    if (_xyz.dataview.btn.dataViewport) _xyz.dataview.btn.dataViewport.style.display = 'none';

    // hide dropdown if visible
    _xyz.dataview.nav_dropdown_content.classList.remove('show');
  }}>${table.title}`;

  // assign the parent for tab based on count
  (total_count < _xyz.dataview.max_tabs) ?
    _xyz.dataview.nav_bar.appendChild(table.tab) :
    (table.tab.classList.add('folded'), _xyz.dataview.nav_dropdown.appendChild(table.tab));

  count1 = _xyz.dataview.nav_bar.children.length || 0;
  count2 = _xyz.dataview.nav_dropdown.children.length || 0;  
  total_count = count1 + count2;
  
  // activate only tab from navbar
  if(!table.tab.classList.contains('folded')) {
    table.tab.classList.add('tab-current');
  } else {
    _xyz.dataview.nav_bar.lastChild.classList.add('tab-current');
  }
  
  if(count2 > 0) _xyz.dataview.nav_dropdown_btn.style.display = 'inline-flex';


};