export default _xyz => entry => {

  let td = _xyz.utils.createElement({
    tag: 'td',
    style: { 
      paddingTop: '5px'
    },
    options: { 
      colSpan: '2',
      classList: entry.class || ''   
    },
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
        removeTab();
      }

    }
  });

  if (entry.chart) {

    const tr = _xyz.utils.wire()`<tr class="${'table-chart ' + (entry.chart.class || '')}">`;
    
    const td = _xyz.utils.wire()`<td colspan=2>`;

    tr.appendChild(td);

    entry.chart.node = _xyz.utils.wire()`<div class="table-section">`;

    td.appendChild(entry.chart.node);

    entry.location.view.node.appendChild(tr);

  }

  if (entry.display) showTab();

  function showTab() {

    if(_xyz.tableview.node && !_xyz.tableview.node.querySelector('.table')) {
      _xyz.utils.createElement({
        tag: 'div',
        options: {
          classList: 'table'
        },
        appendTo: _xyz.tableview.node.querySelector('.tab-content')
      });
    }

    entry.location.tables.push(entry);

    entry.target = _xyz.tableview.node && _xyz.tableview.node.querySelector('.table') ||
      document.getElementById(entry.target_id);

    if (entry.target) _xyz.tableview.locationTable(entry, tableChart);

  }

  function removeTab() {

    let idx = entry.location.tables.indexOf(entry);

    if (idx < 0) return;
    
    entry.location.tables.splice(idx, 1);

    _xyz.tableview.removeTab(entry);

    if (entry.chart) entry.chart.node.innerHTML = '';

  }

  function tableChart(data) {

    if (!entry.chart) return;

    entry.chart.node.innerHTML = '';

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

      /*entry.chart.node.appendChild(_xyz.utils.chart({
        label: entry.title,
        fields: fields,
        chart: entry.chart
      }));*/
      entry.chart.node.appendChild(_xyz.charts.create({
        label: entry.title,
        fields: fields,
        chart: entry.chart
      }));

    }

  }

};