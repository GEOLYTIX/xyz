import Chart from 'chart.js';
import {createElement} from './createElement.mjs';

export default (group) => {

  const graph = createElement({
    tag: 'div',
    style: {
      position: 'relative'
    }
  });

  const canvas = createElement({
    tag: 'canvas',
    options: {
      height: group.chart.height || undefined
    },
    appendTo: graph
  });

  let stacked_labels = group.fields.map(field => field.stack);
  
  if(stacked_labels.length) stacked_labels = stacked_labels.filter((item, idx) => {return stacked_labels.indexOf(item) >= idx;});

  const labels = stacked_labels.length > 1 ? stacked_labels : group.fields.map(field => field.label);

  const data = group.fields.map(field => (field.type === 'integer' ? parseInt(field.value) : field.value));

  const displayValues = group.fields.map(field => field.displayValue);

  let datasets = [];

  if(stacked_labels.length > 1){

    let tmp = {};
    datasets = [];

    Object.values(group.fields).map(field => {
      tmp[field.label] = {};
      tmp[field.label].data = [];
    });

    Object.values(group.fields).map(field => {
      Object.keys(tmp).map(key => {
        if(key === field.label){
          let idx = Object.keys(tmp).indexOf(key);
          tmp[key].data.push(Number(field.value));
          tmp[key].label = field.label;
          tmp[key].backgroundColor = (group.chart.backgroundColor[idx] || '#cf9');
          tmp[key].borderColor = (group.chart.borderColor[idx] || '#079e00');
        }
      });
    });

    Object.values(tmp).map(val => datasets.push(val));

  } else {
    datasets[0] = {
      label: group.label,
      backgroundColor: group.chart.backgroundColor || '#cf9',
      borderColor: group.chart.borderColor || '#079e00',
      data: data
    };
  };

  new Chart(canvas, {
    type: group.chart.type || 'line',
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      title: {
        display: group.chart.title || true,
        position: 'bottom',
        text: group.label

      },
      responsive: true,
      legend: {
        display: group.chart.legend
      },
      scales: {
        // no axis for pie or doughnut charts
        yAxes: (group.chart.type == 'pie' || group.chart.type == 'doughnut') ? [] : 
          [
          // axis for all other charts
            {
              ticks: {
                callback: (label, index, labels) => {
                  return group.chart.unit ? units(group, label) : label;
                }
              },
              scaleLabel: {
                display: (group.chart.unit ? true : false),
                labelString: (group.chart.unit ? scale(group) : false)
              },
              stacked: (((group.chart.type == 'bar' || group.chart.type == 'horizontalBar') && stacked_labels.length && stacked_labels.length > 1) ? true : false)
            }
          ],
        xAxes: (!stacked_labels.length || stacked_labels.length < 1 || group.chart.type == 'pie' || group.chart.type == 'doughnut') ? [] : 
          [{
            stacked: (((group.chart.type == 'bar' || group.chart.type == 'horizontalBar') && stacked_labels.length && stacked_labels.length > 1) ? true : false)
          }]
      },
      tooltips: {
        mode: 'index',
        xAlign: group.chart.xAlign || null,
        yAlign: group.chart.yAlign || null,
        //intersect: false,
        callbacks: {
          title: () =>  ''//,
          /*label: (tooltipItem, data) => {
          return labels[tooltipItem.index] + ': ' + displayValues[tooltipItem.index];
          }
        }*/
        }
      }
    }
  });

  return graph;

  function scale(group){
    let _scale;
    switch(group.chart.unit){
    case 'k': _scale = '1k = 1 000'; break;
    case 'M': _scale = '1M = 1 000 000'; break;
    }
    return _scale;
  }
  
  function units(group, label){
    let _label;
    switch(group.chart.unit){
    case 'k': _label = label/1000 + 'k'; break;
    case 'M': _label = label/1000000 + 'M'; break;
    }
    return _label;
  }

};


