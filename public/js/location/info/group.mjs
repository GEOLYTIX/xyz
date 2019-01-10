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
      funct: e => {
        e.stopPropagation();
        _xyz.utils.toggleExpanderParent({
          expandable: group.div,
          accordeon: true,
          scrolly: document.querySelector('.mod_container > .scrolly')
        });
      }
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
      funct: e => {
        e.stopPropagation();
        _xyz.utils.toggleExpanderParent({
          expandable: group.div,
          scrolly: document.querySelector('.mod_container > .scrolly')
        });
      }
    }
  });

  // Add chart control to group header.
  if (group.chart) _xyz.utils.createElement({
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
        if(e.target.textContent === chartIcon(group)) {
          group.fields = record.location.infoj.filter(entry => entry.group === group.label);
          group.div.appendChild(chart(_xyz, group));
          group.table.style.display = 'none';
          e.target.textContent = 'view_list';
          e.target.title = 'Show table';
        } else if(e.target.textContent === 'view_list'){
          e.target.textContent = chartIcon(group);
          e.target.title = 'Show chart';
          group.table.style.display = 'table';
          group.div.removeChild(group.div.lastChild);
        }
      }
    }
  });

  group.table = _xyz.utils.createElement({
    tag: 'table',
    style: {
      cellPadding: '0',
      cellSpacing: '0',
      width: '95%',
      position: 'relative' // required for responsive chart
    },
    appendTo: group.div
  });

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