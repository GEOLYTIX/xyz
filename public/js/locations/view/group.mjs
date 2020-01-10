export default _xyz => group => {

  if (!group.label) return;

  //const group = entry;

  // check if group has any data
  let values = Object.values(group.location.infoj).filter(field => { if (field.group === group.label) return field.value });

  if (!values.length) return; // break when no data to show

  group.td = _xyz.utils.wire()`<td colSpan=2>`;

  group.row.appendChild(group.td);

  group.div = _xyz.utils.wire()`
  <div style="display: none;" class="drawer panel expandable">`;

  group.expanded && group.div.classList.add('expanded');

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
        group.showData();
      }}>`;

    group.header.appendChild(group.viewToggler);

    group.showData = () => {

      group.div.classList.add('expanded');

      if (!group.div.classList.contains('chart')) {

        group.table.style.display = 'none';
        group.chartElem.style.display = 'block';

        group.div.classList.add('chart');

        group.viewToggler.classList.remove(group.chartIcon);
        group.viewToggler.classList.add('icon-view-list');

      } else {

        group.table.style.display = 'table';
        group.chartElem.style.display = 'none';

        group.div.classList.remove('chart');

        group.viewToggler.classList.remove('icon-view-list');
        group.viewToggler.classList.add(group.chartIcon);

      }
    }

    group.showData();

  }

  //return group;

};