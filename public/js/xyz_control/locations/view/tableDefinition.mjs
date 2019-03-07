export default _xyz => (entry) => {

  // Remove charts from location view if displayed
  for (let i = 0; i < entry.location.view.node.children.length; i++) {
    if (entry.location.view.node.children[i].classList.contains('table-chart')) {
      entry.location.view.node.removeChild(entry.location.view.node.children[i]);
    }
  }

  let td = _xyz.utils.createElement({
    tag: 'td',
    style: { paddingTop: '5px' },
    options: { colSpan: '2' },
    appendTo: entry.row
  });

  entry.checkbox = _xyz.utils.createCheckbox({
    label: entry.title || 'Show table',
    appendTo: td,
    checked: !!entry.display,
    onChange: e => {

      entry.display = e.target.checked;


      entry.display ?
        showTab() : _xyz.tableview.removeTab(entry);

    }
  });

  if (entry.display && _xyz.tableview.node) showTab();

  function showTab() {

    entry.location.tables.push(entry);

    entry.target = _xyz.tableview.node.querySelector('.table');

    _xyz.tableview.locationTable(entry);

  }

};