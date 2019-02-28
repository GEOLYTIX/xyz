export default _xyz => entry => {

  // let tr = _xyz.utils.createElement({ tag: 'tr', appendTo: entry.row });
  
  let td = _xyz.utils.createElement({
    tag: 'td',
    style: {'paddingTop': '5px'},
    appendTo: entry.row
  });
  
  _xyz.utils.createCheckbox({
    label: entry.name || 'Table',
    appendTo: td,
    checked: entry.display || false,
    onChange: e => {

      e.stopPropagation();

      if (e.target.checked) _xyz.tableview.locationTable({
        target: _xyz.tableview.node.querySelector('.table'),
        layer: entry.location.layer,
        table: entry
      });

      if (!e.target.checked) _xyz.tableview.removeTab({
        table: entry
      });
        
    }
  });
  
  td = _xyz.utils.createElement({tag: 'td', appendTo: tr});

};