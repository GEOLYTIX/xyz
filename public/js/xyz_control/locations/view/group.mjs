export default _xyz => group => {

  group.location.view.groups[group.label] = group;

  group.td = _xyz.utils.createElement({
    tag: 'td',
    options: {
      colSpan: '2'
    },
    appendTo: group.row
  });

  group.div = _xyz.utils.createElement({
    tag: 'div',
    options: {
      classList: 'table-section expandable'
    },
    appendTo: group.td
  });

  function toggleExpandedState(e) {
    if (e) {
      e.stopPropagation();
    }
    _xyz.utils.toggleExpanderParent({
      expandable: group.div,
      accordeon: true,
      scrolly: _xyz.desktop && _xyz.desktop.listviews
    });
  };

  group.header = _xyz.utils.createElement({
    tag: 'div',
    options: {
      className: 'btn_subtext cursor noselect'
    },
    style: {
      textAlign: 'left',
      fontStyle: 'italic'
    },
    appendTo: group.div,
    eventListener: {
      event: 'click',
      funct: toggleExpandedState
    }
  });

  // Add label to group header.
  _xyz.utils.createElement({
    tag: 'span',
    options: {
      textContent: group.label
    },
    appendTo: group.header
  });

  // // Add expander to group header.
  // _xyz.utils.createElement({
  //   tag: 'i',
  //   options: {
  //     className: 'material-icons cursor noselect btn_header t-expander',
  //     title: 'Show section'
  //   },
  //   appendTo: group.header,
  //   eventListener: {
  //     event: 'click',
  //     funct: toggleExpandedState
  //   }
  // });
  
  // Add table
  group.table = _xyz.utils.createElement({
    tag: 'table',
    style: {
      cellPadding: '0',
      cellSpacing: '0',
      width: '95%',
      marginTop: '-5px',
      marginBottom: '10px',
      paddingLeft: '20px',
      borderLeft: '2px solid #B4B4B4',
      position: 'relative' // required for responsive chart
    },
    appendTo: group.div
  });

  //console.log(group.table);

  // If chart option specified
  if (group.chart) {

    //console.log(group.chart);

    if(group.dashboard || group.chart.class) return;

    //console.log('hi chart');
    
    // Set up
    group.fields = group.location.infoj.filter(entry => entry.group === group.label);
    // Create chart element
    //group.chartElem = _xyz.utils.chart(group); // old style
    group.chartElem = _xyz.charts.create(group);
    //console.log(group.chartElem);
    //console.log(group.div);
    // Add chart
    group.div.appendChild(group.chartElem);

    //console.log(group.div);

    // Add chart control to group header for toggling
    group.viewToggler = _xyz.utils.createElement({
      tag: 'i',
      options: {
        className: 'material-icons cursor noselect btn_header',
        title: 'Show chart',
        textContent: chartIcon(group)
      },
      style: {
        margin: '-6px 6px 0 0',
        float: 'right'
      },
      appendTo: group.header,
      eventListener: {
        event: 'click',
        funct: e => {
          e.stopPropagation();
          if (group.viewToggler.textContent === chartIcon(group)) {
            group.showChart();
          } else {
            group.showTable(e);
          }
        }
      }
    });

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