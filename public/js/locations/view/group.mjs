export default _xyz => group => {

  if (!group.label) return;

  group.td = _xyz.utils.wire()`<td colSpan=2>`;

  group.row.appendChild(group.td);

  group.div = _xyz.utils.wire()`
  <div class="drawer panel expandable">`;

  if (group.expanded) group.div.classList.add('expanded');

  group.td.appendChild(group.div);

  group.header = _xyz.utils.wire()`
  <div
    class="header primary-colour"
    style="text-align: left;"
    onclick=${ e => {
      _xyz.utils.toggleExpanderParent(e.target, true);
    }}><span>${group.label}`;

  group.div.appendChild(group.header);

  // Add table
  group.table = _xyz.utils.wire()`<table>`;

  group.div.appendChild(group.table);

  // If chart option specified
  if (group.chart) {

    if (group.dashboard || group.chart.class) return group;

    // Set up
    group.fields = group.location.infoj.filter(entry => entry.group === group.label);

    // Create chart element
    group.chartElem = _xyz.dataview.charts.create(group);

    // Add chart
    group.div.appendChild(group.chartElem);

    const chartIcon = {
      'line': 'icon-show-chart',
      'bar': 'icon-bar-chart',
      'pie': 'icon-pie-chart',
      'doughnut': 'icon-donut-small',
      'horizontalBar': 'icon-notes',
      'bubble': 'icon-bubble-chart',
      'scatter': 'icon-scatter-plot',
      'radar': 'icon-multiline-chart',
      'polarArea': 'icon-multiline-chart',
      'mixed': 'icon-multiline-chart',
      'stackedBar': 'icon-bar-chart',
    }

    group.chartIcon = group.chart.type && chartIcon[group.chart.type] || 'icon-show-chart';

    // Add chart control to group header for toggling
    group.viewToggler = _xyz.utils.wire()`
    <button
      class="btn-header xyz-icon primary-colour-filter"
      onclick=${e => {
        e.stopPropagation();
        group.viewToggler.classList.toggle(group.chartIcon);
        group.viewToggler.classList.toggle('icon-view-list');
        group.div.classList.contains('chart') ? group.showTable() : group.showChart();
      }}>`;

    group.header.appendChild(group.viewToggler);

    group.showChart = () => {

      group.table.style.display = 'none';
      group.chartElem.style.display = 'block';

      group.div.classList.add('chart');

      group.viewToggler.classList.remove(group.chartIcon);
      group.viewToggler.classList.add('icon-view-list');

      if (!group.div.classList.contains('expanded')) group.div.classList.add('expanded');
    };

    group.showTable = e => {

      group.table.style.display = 'table';
      group.chartElem.style.display = 'none';

      group.div.classList.remove('chart');

      group.viewToggler.classList.remove('icon-view-list');
      group.viewToggler.classList.add(group.chartIcon);

      if (!group.div.classList.contains('expanded')) group.div.classList.add('expanded');
    };

    // Use the appropriate toggle function to initialise
    if (group.chart.active) {

      group.showChart();
    } else {

      group.showTable();
    }
  }

  return group;

};