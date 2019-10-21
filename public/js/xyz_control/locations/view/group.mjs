export default _xyz => group => {

  group.location.view.groups[group.label] = group;

  group.td = _xyz.utils.wire()`<td colSpan=2>`;
  group.row.appendChild(group.td);

  /*_xyz.dataview.node.querySelector('.tab-content').appendChild(_xyz.utils.wire()`
   <div class="table">`);*/ // aga: why is this here?

  group.div = _xyz.utils.wire()`<div class="table-section expandable">`;
  group.td.appendChild(group.div);

  function toggleExpandedState(e) {
    if (e) {
      e.stopPropagation();
    }
    _xyz.utils.toggleExpanderParent({
      expandable: group.div,
      accordeon: true,
    });
  };

  group.header = _xyz.utils.wire()`
  <div class="btn_subtext cursor noselect"
  style="text-align: left; font-style: italic;"
  onclick=${ e => toggleExpandedState(e) }>`;

  group.div.appendChild(group.header);

  // Add label to group header.
  group.header.appendChild(_xyz.utils.wire()`<span>${group.label}`);
  
  // Add table
  group.table = _xyz.utils.wire()`
  <table
  style="position: relative; width: 95%; cell-padding: 0; cell-spacing: 0; 
  margin-top: -4px; margin-bottom: 10px;
  padding-left: 20px; border-left: 2px solid #B4B4B4;"
  >`;

  group.div.appendChild(group.table);

  // If chart option specified
  if (group.chart) {

    if(group.dashboard || group.chart.class) return;
    
    // Set up
    group.fields = group.location.infoj.filter(entry => entry.group === group.label);
    // Create chart element
    group.chartElem = _xyz.charts.create(group);

    // Add chart
    group.div.appendChild(group.chartElem);

    // Add chart control to group header for toggling
    group.viewToggler = _xyz.utils.wire()`
    <i class="material-icons cursor noselect btn_header"
    title="Show chart"
    style="margin: -6px 6px 0 0; float: right;"
    onclick=${
      e => {
        e.stopPropagation();
        group.viewToggler.textContent === chartIcon(group) ? group.showChart() : group.showTable(e);
      }
    }
    >`;

    group.viewToggler.textContent = chartIcon(group);

    group.header.appendChild(group.viewToggler);

    // Functions for toggeling between table view and chart view
    group.showChart = () => {
      group.table.style.display = 'none';
      group.chartElem.style.display = 'block';
      group.viewToggler.textContent = 'view_list';
      group.viewToggler.title = 'Show table';
      if (!group.div.classList.contains('expanded')) group.div.classList.add('expanded');
    };
    group.showTable = (e) => {
      group.table.style.display = 'table';
      group.chartElem.style.display = 'none';
      group.viewToggler.textContent = chartIcon(group);
      group.viewToggler.title = 'Show chart';
      if (e && !group.div.classList.contains('expanded')) group.div.classList.add('expanded');
    };

    // Use the appropriate toggle function to initialise
    if (group.chart.active) {
      group.showChart();  // if explicitly specified
    } else {
      group.showTable();  // default
    }
  }

};

function chartIcon(group) {
  if (!group.chart.type) {
    group.chart.type = 'line';
  }
  switch (group.chart.type) {
  case 'line': return 'show_chart';
  case 'bar': return 'insert_chart_outlined';
  case 'pie': return 'pie_chart';
  case 'doughnut': return 'donut_small';
  case 'horizontalBar': return 'notes';
  case 'bubble': return 'bubble_chart';
  case 'scatter': return 'scatter_plot';
  case 'radar': return 'multiline_chart';
  case 'polarArea': return 'multiline_chart';
  case 'mixed': return 'multiline_chart';
  case 'stackedBar': return 'insert_chart_outlined';
  default: return 'show_chart';
  }
}