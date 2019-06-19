export default _xyz => entry => {

	console.log('hi I am a stacked bar chart chart');

	const graph = _xyz.utils.createElement({
		tag: 'div',
		style: {
			position: 'relative'
		}
	});

	const canvas = _xyz.utils.createElement({
		tag: 'canvas',
		options: {
			height: entry.chart.height || undefined
		},
		appendTo: graph
	});

	let stacked_labels = entry.fields.map(field => field.stack);

	if(!stacked_labels.length) return;

	stacked_labels = stacked_labels.filter((item, idx) => {return stacked_labels.indexOf(item) >= idx;});

	const data = entry.fields.map(field => (field.type === 'integer' ? parseInt(field.value) : field.value));

	const displayValues = group.fields.map(field => field.displayValue);

	let datasets = [];

	let tmp = {};

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
          tmp[key].backgroundColor = (entry.chart.backgroundColor[idx] || '#cf9');
          tmp[key].borderColor = (entry.chart.borderColor[idx] || '#079e00');
        }
      });
    });

    Object.values(tmp).map(val => datasets.push(val));

    new _xyz.Chart(canvas, {
    	type: 'bar',
    	data: {
    		labels: stacked_labels,
    		datasets: datasets
    	},
    	options: {
    		title: {
    			display: entry.chart.title || true,
    			position: 'bottom',
    			text: entry.label
    		},
    		responsive: true,
    		legend: {
    			display: entry.chart.legend
    		},
    		scales: {
    			yAxes: [{
    				ticks: {
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
}