export default _xyz => (entry, callback) => {

  if (!entry || !entry.location) return;

  if (_xyz.dataview.node) document.body.style.gridTemplateRows = 'minmax(0, 1fr) 40px';

  if (_xyz.dataview.tables.indexOf(entry) < 0) _xyz.dataview.tables.push(entry);

  if (_xyz.dataview.nav_bar) _xyz.dataview.addTab(entry);

  entry.update = () => {

    entry.target.innerHTML = '';

    let flex_container = _xyz.utils.wire()`<div 
    style="display: flex; flex-wrap: wrap; position: relative; padding: 20px;">`;

    entry.target.appendChild(flex_container);

    Object.values(entry.location.infoj).map(val => {

      if(val.type === 'group' && val.chart && val.dashboard && entry.title === val.dashboard){

        entry.group = Object.assign({}, val);

        entry.group.fields = entry.location.infoj.filter(_entry => _entry.group === entry.group.label);

        let chartElem = _xyz.charts.create(entry.group);

        if(!chartElem || !chartElem.style) return;

        flex_container.appendChild(chartElem);

      }

      if(val.type === 'pgFunction' && val.dashboard && entry.title === val.dashboard) {

        _xyz.dataview.pgFunction({
          entry: val, 
          container: document.getElementById(val.target_id) || flex_container
        });
      
      }
    });
  };

  entry.activate = () => {

    console.log('activate dashboard');

    entry.update();

    _xyz.dataview.current_table = entry;

  };

  // active only if displayed in the navbar 
  if(!entry.tab || !entry.tab.classList.contains('folded')) entry.activate();

};