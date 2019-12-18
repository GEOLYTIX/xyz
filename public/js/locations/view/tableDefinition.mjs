export default _xyz => entry => {

  if(!_xyz.dataview.node && !document.getElementById(entry.target_id)) return;

  entry.row.appendChild(_xyz.utils.wire()`
  <td style="padding-top: 5px;" colSpan=2>
  <label class="input-checkbox">
  <input type="checkbox"
    checked=${!!entry.display}
    onchange=${e => {
      entry.display = e.target.checked;
      entry.display ? showTab() : removeTab();
    }}>
  </input>
  <div></div><span>${entry.title || 'Show table'}`);

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

  }

  function tableChart(data) {

    if (!entry.chart) return;

    entry.target.innerHTML = '';

    const fields = data.map(field => ({
      label: field.rows,
      field: entry.chart.field,
      value: field[entry.chart.field],
      displayValue: field[entry.chart.field]
    }));

    const values = Object.values(fields).filter(field => { if(field.value) return field.value });

    if(!values.length) return entry.target.appendChild(_xyz.utils.wire()`<div style="text-align: center;">No information to show here.`);

    if (fields.length && fields.some(field => field.displayValue)) {

      entry.target.appendChild(_xyz.dataview.charts.create({
        label: entry.title,
        fields: fields,
        chart: entry.chart
      }));

    }
  }

};