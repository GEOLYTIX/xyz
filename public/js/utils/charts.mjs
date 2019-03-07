import Chart from 'chart.js';
import {createElement} from './createElement.mjs';

export default (group) => {

  console.log(group.fields);

  const graph = createElement({
    tag: 'div',
    style: {
      position: 'relative'
    }
  });

  const canvas = createElement({
    tag: 'canvas',
    appendTo: graph
  });

  const labels = (group.chart.stacks && group.chart.stacks.length) ? group.chart.stacks : group.fields.map(field => field.label);

  const data = group.fields.map(field => field.value);

  const displayValues = group.fields.map(field => field.displayValue);

  let datasets = [];

  let stack_labels = [];

  if(group.chart.stacks && group.chart.stacks.length){
    group.fields.map(field => { 
      if(!stack_labels.includes(field.label)) {
        stack_labels.push(field.label);
      } 
    });
      
    //console.log(stack_labels);
    //stack_labels.map()
    for(let i = 0; i < labels.length; i++){
      for(let j = 0; i < stack_labels.length; j++){
        let data = [];
        Object.values(group.fields).map(field => {
          /*if(field.stack === labels[i] && field.label === stack_labels[j]){
              console.log({
                 "stack": field.stack,
                 "label": field.label // ok
              });
            }*/
          if(field.stack === labels[i]){
              
          }
        });
      }
    }
  }

      
  new Chart(canvas, {
    type: group.chart.type || 'line',
    data: {
      labels: labels,
      datasets: [{
        label: group.label,
        backgroundColor: group.chart.backgroundColor || '#cf9',
        borderColor: group.chart.borderColor || '#079e00',
        data: data
      }]
    },
    options: {
      responsive: true,
      legend: {
        display: group.chart.legend
      },
      scales: {
        // no axis for pie or doughnut charts
        yAxes: (group.chart.type == 'pie' || group.chart.type == 'doughnut') ? [] : [
          {stacked: ((group.chart.type == 'bar' || group.chart.type == 'horizontalBar') && group.chart.stacks && group.chart.stacks.length) ? true : false},
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
            }
          }
        ],
        xAxes: [{
          stacked: ((group.chart.type == 'bar' || group.chart.type == 'horizontalBar') && group.chart.stacks && group.chart.stacks.length) ? true : false
        }]
      },
      tooltips: {
        callbacks: {
          title: () => '',
          label: (tooltipItem, data) => {
            return labels[tooltipItem.index] + ': ' + displayValues[tooltipItem.index];
          }
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


