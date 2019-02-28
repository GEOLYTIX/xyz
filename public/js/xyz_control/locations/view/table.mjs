export default (_xyz, record, entry) => {

  let tr = _xyz.utils.createElement({ tag: 'tr', appendTo: record.table });
  
  let td = _xyz.utils.createElement({ tag: 'td', style: {'paddingTop': '5px'}, appendTo: tr });
  
  _xyz.utils.createCheckbox({
    label: entry.name || 'Table',
    appendTo: td,
    checked: entry.display || false,
    onChange: e => {

      e.stopPropagation();

      if (e.target.checked) _xyz.tableview.locationTable({
        target: _xyz.tableview.node.querySelector('.table'),
        layer: record.location.layer,
        table: entry
      });

      if (!e.target.checked) _xyz.tableview.removeTab({
        table: entry
      });
        
    }
  });
  
  td = _xyz.utils.createElement({tag: 'td', appendTo: tr});

};