export default _xyz => (entry) => {

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

      if (entry.display) {
        showTab();
      } else {
        _xyz.tableview.removeTab(entry);
        if (entry.chart) entry.chart.node.innerHTML = '';
      }

    }
  });

  if (entry.chart) {

    const tr = _xyz.utils.hyperHTML.wire()`<tr class="table-chart">`;
    
    const td = _xyz.utils.hyperHTML.wire()`<td colspan=2>`;

    tr.appendChild(td);

    entry.chart.node = _xyz.utils.hyperHTML.wire()`<div class="table-section">`;

    td.appendChild(entry.chart.node);

    entry.location.view.node.appendChild(tr);

  }

  if (entry.display && _xyz.tableview.node) showTab();

  function showTab() {

    entry.location.tables.push(entry);

    entry.target = _xyz.tableview.node.querySelector('.table');

    _xyz.tableview.locationTable(entry, tableChart);

  }

  function tableChart(data) {

    if (!entry.chart) return;

    const fields = data.map(field => ({
      label: field.rows,
      field: entry.chart.field,
      value: field[entry.chart.field],
      displayValue: field[entry.chart.field]
    }));

    if (fields.length && fields.some(field => field.displayValue)) {
       
      // const header = _xyz.utils.createElement({
      //   tag: 'div',
      //   options: { classList: 'btn_subtext cursor noselect' },
      //   style: { textAlign: 'left', fontStyle: 'italic' },
      //   appendTo: entry.chart.node
      // });

      // _xyz.utils.createElement({
      //   tag: 'span',
      //   options: { textContent: entry.title },
      //   appendTo: header
      // });

      entry.chart.node.appendChild(_xyz.utils.chart({
        label: entry.title,
        fields: fields,
        chart: entry.chart
      }));

    }

  }

};