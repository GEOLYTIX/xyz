export default _xyz => entry => {

  if(!_xyz.dataview.node && !document.getElementById(entry.target_id)) return;

  entry.row.appendChild(_xyz.utils.wire()`
  <td style="padding-top: 5px;" colSpan=2>
  <label class="checkbox">
  <input type="checkbox"
    checked=${!!entry.display}
    onchange=${e => {
    entry.display = e.target.checked;
    entry.display ? 
      showTab() :
      removeTab();
  }}></input><span>${entry.title || 'Show table'}`);


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

    if(_xyz.dataview.node && !_xyz.dataview.node.querySelector('.table')) {

      _xyz.dataview.node.querySelector('.tab-content').appendChild(_xyz.utils.wire()`<div class="table">`);

    }

    entry.location.tables.push(entry);

    entry.target = _xyz.dataview.node && _xyz.dataview.node.querySelector('.table') ||
      document.getElementById(entry.target_id);

    if (entry.target) _xyz.dataview.locationTable(entry, tableChart);

  }

  function removeTab() {

    let idx = entry.location.tables.indexOf(entry);

    if (idx < 0) return;
    
    entry.location.tables.splice(idx, 1);

    _xyz.dataview.removeTab(entry);

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

      // entry.chart.node.appendChild(_xyz.utils.wire()`<div
      //   class="btn_subtext cursor noselect"
      //   style="text-align: left; font-style: italic;">
      //   <span>${entry.title}`);

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