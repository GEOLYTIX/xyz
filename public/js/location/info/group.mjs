import chart from './charts.mjs';

export default (_xyz, record, group) => {

  record.location.infogroups[group.label] = group;

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

  const toggleExpandedState = e => {
    if(e) {
      e.stopPropagation();
    }
    _xyz.utils.toggleExpanderParent({
      expandable: group.div,
      accordeon: true,
      scrolly: document.querySelector('.mod_container > .scrolly')
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

  // Add expander to group header.
  _xyz.utils.createElement({
    tag: 'i',
    options: {
      className: 'material-icons cursor noselect btn_header t-expander',
      title: 'Show section'
    },
    appendTo: group.header,
    eventListener: {
      event: 'click',
      funct: toggleExpandedState
    }
  });

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
      borderLeft: '3px solid #009900',
      position: 'relative' // required for responsive chart
    },
    appendTo: group.div
  });

  // If chart option specified
  if (group.chart) {
    // Set up
    group.fields = record.location.infoj.filter(entry => entry.group === group.label);
    // Create chart element
    group.chartElem = chart(_xyz, group);
    // Add chart
    group.div.appendChild(group.chartElem);

    // Add chart control to group header for toggling
    group.viewToggler = _xyz.utils.createElement({
      tag: 'i',
      options: {
        className: 'material-icons cursor noselect btn_header',
        title: 'Show chart',
        textContent: chartIcon(group)
      },
      style: {
        margin: '-6px 10px 0 0'
      },
      appendTo: group.header,
      eventListener: {
        event: 'click',
        funct: e => {
          e.stopPropagation();
          if(group.viewToggler.textContent === chartIcon(group)) {
            group.showChart();
          } else {
            group.showTable();
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
    };
    group.showTable = () => {
      group.table.style.display = 'table';
      group.chartElem.style.display = 'none';
      group.viewToggler.textContent = chartIcon(group);
      group.viewToggler.title = 'Show chart';
    };

    // Use the appropriate toggle function to initialise
    if(group.chart.active) {
      group.showChart();  // if explicitly specified
    } else {
      group.showTable();  // default
    }
  }

  // If the group is configured to be shown in an expanded state when initialised
  if(group.expanded) {
    // call toggleExpandedState once to toggle the state from the default collapsed style to the expanded style
    toggleExpandedState();
  }
};

function chartIcon(group){
  let _icon;
  switch(group.chart.type){
  case 'bar': _icon = 'insert_chart_outlined'; break;
  case 'pie' : _icon = 'pie_chart'; break;
  case 'doughnut': _icon = 'donut_small'; break;
  case 'horizontalBar': _icon = 'notes'; break;
  case 'bubble': _icon = 'bubble_chart'; break;
  case 'scatter': _icon = 'scatter_plot'; break;
  default: 'show_chart';
  }
  return _icon;
}