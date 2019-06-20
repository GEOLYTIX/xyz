export default _xyz => entry => {

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

	const datasets = [];

	let labels = entry.fields.map(field => field.label); // get labels

	labels = labels.filter((item, idx) => { return labels.indexOf(item) >= idx; }); // remove duplicates
    
	let series = entry.fields.map(field => field.dataset); // get series if any

    // strip off duplicates and nulls
	series = series.filter((item, idx) => { return !!item && series.indexOf(item) >= idx; });

	if(!series.length) { // process one dataset

		datasets[0] = {
			label: entry.label,
			backgroundColor: entry.chart.backgroundColor || _xyz.charts.fallbackStyle.backgroundColor,
			borderColor: entry.chart.borderColor || _xyz.charts.fallbackStyle.borderColor,
			spanGaps: true,
			data: entry.fields.map(field => (field.type === 'integer' ? parseInt(field.value) : field.value))
		};
	} 

	else { // process multiple series

		const tmp = {};

		series.map(serie => {

			tmp[serie] = {};
			tmp[serie].data = [];

			let idx = series.indexOf(serie);

			tmp[serie].backgroundColor = typeof(entry.chart.backgroundColor) === 'object' ?  entry.chart.backgroundColor[idx] : (entry.chart.backgroundColor || _xyz.charts.fallbackStyle.backgroundColor);
			tmp[serie].borderColor = typeof(entry.chart.borderColor) === 'object' ? entry.chart.borderColor[idx] : (entry.chart.borderColor || _xyz.charts.fallbackStyle.borderColor);
			tmp[serie].spanGaps = true;
		});

		Object.values(entry.fields).map(field => {
			tmp[(field.dataset)].data.push(field.type === 'integer' ? parseInt(field.value) : field.value);
		});

		Object.values(tmp).forEach(val => datasets.push(val));
	}

    new _xyz.Chart(canvas, {
    	type: entry.chart.type,
    	data: {
    		labels: labels,
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
    			display: entry.chart.legend
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