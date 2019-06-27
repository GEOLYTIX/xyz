export default _xyz => (entry, callback) => {

  if (!entry || !entry.location) return;

  if (_xyz.tableview.node) {
    // _xyz.tableview.node.style.display = 'block';
    //_xyz.mapview.node.style.height = 'calc(100% - 40px)';
    document.body.style.gridTemplateRows = 'minmax(0, 1fr) 40px';

  }

  if (_xyz.tableview.tables.indexOf(entry) < 0) _xyz.tableview.tables.push(entry);

  if (_xyz.tableview.nav_bar) _xyz.tableview.addTab(entry);

  entry.update = () => {

    entry.target.innerHTML = '';

    let flex_container = _xyz.utils.createElement({
      tag: 'div',
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        position: 'relative',
        padding: '20px'
      },
      appendTo: entry.target
    });

    Object.values(entry.location.infoj).map(val => {

      if(val.type === 'group' && val.chart && val.dashboard && entry.title === val.dashboard){

        entry.group = Object.assign({}, val);

        entry.group.fields = entry.location.infoj.filter(_entry => _entry.group === entry.group.label);

        let chartElem = _xyz.charts.create(entry.group);
        
        if(chartElem && chartElem.style){
          // temporary check for development
          chartElem.style.width = '450px';
          chartElem.style.height = '300px';
          flex_container.appendChild(chartElem);
        }

      }
    });

  };

  entry.activate = () => {

    console.log('activate dashboard');

    entry.update();

    _xyz.tableview.current_table = entry;

  };

  // active only if displayed in the navbar 
  if(!entry.tab || !entry.tab.classList.contains('folded')) entry.activate();

};