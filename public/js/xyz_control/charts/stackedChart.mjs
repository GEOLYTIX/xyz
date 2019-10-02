export default _xyz => entry => {

  const graph = _xyz.utils.wire()`<div style="position: relative;">`;

  const canvas = _xyz.utils.wire()`<canvas>`;

  canvas.setAttribute("height", entry.chart.height || 150);
  canvas.setAttribute("width", entry.chart.width || 350);

  canvas.style.height = `${entry.chart.height ? entry.chart.height : 150}px`;
  canvas.style.width = `${entry.chart.width ? entry.chart.width : 350}px`;

  graph.appendChild(canvas);

  if(!entry.chart.datalabels) {
    _xyz.utils.Chart.defaults.global.plugins.datalabels.display = false;
  }

  let stacked_labels = entry.fields.map(field => field.stack);

  if(!stacked_labels.length) return;

  stacked_labels = stacked_labels.filter((item, idx) => {return stacked_labels.indexOf(item) >= idx;});

  const data = entry.fields.map(field => (field.type === 'integer' ? parseInt(field.value) : field.value));

  const displayValues = entry.fields.map(field => field.displayValue);

  const datasets = [];

  const tmp = {};

  Object.values(entry.fields).map(field => {
    tmp[field.label] = {};
    tmp[field.label].data = [];
  });

  Object.values(entry.fields).map(field => {
    Object.keys(tmp).map(key => {
      if(key === field.label){
        let idx = Object.keys(tmp).indexOf(key);
        tmp[key].data.push(Number(field.value));
        tmp[key].label = field.label;
        tmp[key].borderColor = (entry.chart.borderColor[idx] || _xyz.charts.fallbackStyle.borderColor);

        (entry.chart.type === 'stackedLine' && !entry.chart.fill) ? tmp[key].backgroundColor = null : tmp[key].backgroundColor = (entry.chart.backgroundColor[idx] || _xyz.charts.fallbackStyle.backgroundColor);

      }
    });
  });

  Object.values(tmp).map(val => datasets.push(val));

  let chartType;

  if(entry.chart.type === 'stackedBar') chartType = 'bar';
  if(entry.chart.type === 'stackedHorizontalBar') chartType = 'horizontalBar';
  if(entry.chart.type === 'stackedLine') chartType = 'line';


  new _xyz.utils.Chart(canvas, {
    	type: chartType,
    	data: {
    		labels: stacked_labels,
    		datasets: datasets
    	},
    	options: {
    		title: {
    			display: entry.chart.title || false,
    			position: 'bottom',
    			text: entry.label
    		},
    		responsive: true,
    		legend: {
    			display: entry.chart.legend,
    			position: entry.chart.legendPosition || 'left',
    			labels: {
    				boxWidth: 30
    			}
    		},
    		scales: {
    			yAxes: [{
    				ticks: {
    					beginAtZero: entry.chart.beginAtZero || false,
    					callback: (label, index, labels) => {
    						return entry.chart.unit ? _xyz.charts.units(entry, label) : label;
    					}
    				},
    				scaleLabel: {
    					display: (entry.chart.unit ? true : false),
    					labelString: (entry.chart.units ? _xyz.charts.scale(entry) : false)
    				},
    				stacked: true

    			}],
    			xAxes: [{
    				stacked: true
    			}]
    		},
    		tooltips: {
    			mode: 'index',
    			xAlign: entry.chart.xAlign || null,
    			yAlign: entry.chart.yAlign || null,
    			callbacks: {
    				title: () => ''
    			}
    		}
    	}
  });

  return graph;
};