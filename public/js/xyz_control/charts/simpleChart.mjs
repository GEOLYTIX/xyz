// that will be line/bar
export default _xyz => entry => {

	//console.log('hi I am a simple chart: line, bar, horizontal bar');

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

	const labels = entry.fields.map(field => field.label);

	const data = entry.fields.map(field => (field.type === 'integer' ? parseInt(field.value) : field.value));

	const displayValues = entry.fields.map(field => field.displayValue);

	let datasets = [];

	if(entry.chart.excludeNull) data.map(item => {if(!item) labels.splice(data.indexOf(item), 1) });

	// this supports only one series. How to support more than one?
	datasets[0] = {
      label: entry.label,
      backgroundColor: entry.chart.backgroundColor || '#cf9',
      borderColor: entry.chart.borderColor || '#079e00',
      data: entry.chart.excludeNull ? data.filter(item => {return item != null}) : data
    };

    new _xyz.Chart(canvas, {
    	type: entry.chart.type,
    	data: {
    		labels: labels,
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
    					labelString: (entry.chart.unit ? _xyz.charts.scale(entry) : false)
    				}
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