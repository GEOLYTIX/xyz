export default _xyz => group => {

  group.location.view.groups[group.label] = group;

  group.td = _xyz.utils.wire()`<td colSpan=2>`;
  group.row.appendChild(group.td);

  /*if(_xyz.dataview.node) _xyz.dataview.node.querySelector('.tab-content').appendChild(_xyz.utils.wire()`
   <div class="table">`);*/

  group.div = _xyz.utils.wire()`<div class="table-section expandable">`;
  group.td.appendChild(group.div);


  group.header = _xyz.utils.wire()`
  <div class="btn_subtext cursor noselect"
  style="text-align: left; font-style: italic;"
  onclick=${ e => {

    _xyz.utils.toggleExpanderParent({
      expandable: group.div,
      accordeon: true,
    });
    
  }}>`;

  group.div.appendChild(group.header);

  // Add label to group header.
  group.header.appendChild(_xyz.utils.wire()`<span>${group.label}`);
  
  // Add table
  group.table = _xyz.utils.wire()`
  <table style="width: 100%; cell-padding: 0; cell-spacing: 0; padding-left: 20px; border-left: 2px solid #B4B4B4;">`;

  group.div.appendChild(group.table);


  // If chart option specified
  if (group.chart) {
    
    if(group.dashboard || group.chart.class) return;
    
    // Set up
    group.fields = group.location.infoj.filter(entry => entry.group === group.label);

    // Create chart element
    group.chartElem = _xyz.charts.create(group);

    group.chartElem.classList.add('chart');

    // Add chart
    group.div.appendChild(group.chartElem);


    const chartIcon = {
      'line':  'icons-bar-chart',
      'bar':  'icons-bar-chart',
      'pie':  'pie_chart',
      'doughnut':  'donut_small',
      'horizontalBar':  'notes',
      'bubble':  'bubble_chart',
      'scatter':  'scatter_plot',
      'radar':  'multiline_chart',
      'polarArea':  'multiline_chart',
      'mixed':  'multiline_chart',
      'stackedBar':  'icons-bar-chart',
   }

   group.chartIcon = group.chart.type && chartIcon[group.chart.type] || 'icons-bar-chart';

    // Add chart control to group header for toggling
    group.viewToggler = _xyz.utils.wire()`
    <button
    class="xyz-icon cursor noselect btn_header"
    
    style="margin: -6px 6px 0 0; float: right;"
    onclick=${
      e => {
        e.stopPropagation();

        e.target.classList.toggle(group.chartIcon);
        e.target.classList.toggle('icons-view-list');
        group.div.classList.toggle('chart');

      }
    }>`;

    group.header.appendChild(group.viewToggler);


    //// Functions for toggeling between table view and chart view ////
    group.showChart = () => {
  
      group.viewToggler.classList.remove('icons-bar-chart');
      group.viewToggler.classList.add('icons-view-list');
      
      if (!group.div.classList.contains('expanded')) group.div.classList.add('expanded');
    };
    group.showTable = (e) => {

      group.viewToggler.classList.remove('icons-view-list');
      group.viewToggler.classList.add('icons-bar-chart');

      if (!group.div.classList.contains('expanded')) group.div.classList.add('expanded');
    };

    // Use the appropriate toggle function to initialise
    if (group.chart.active) {
      group.showChart();
    // if explicitly specified
    } else {
      group.showTable();  // default
    }
  }

};
