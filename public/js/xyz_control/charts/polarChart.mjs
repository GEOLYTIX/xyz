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
            height: entry.chart.height || 150,
            width: entry.chart.width || 350
        },
        style: {
            height: `${entry.chart.height}px` || `150px`,
            width: `${entry.chart.width}px` || '350px'
        },
		appendTo: graph
	});

	const labels = entry.fields.map(field => field.label);

	const data = entry.fields.map(field => (field.type === 'integer' ? parseInt(field.value) : field.value));

	const displayValues = entry.fields.map(field => field.displayValue);

	const datasets = [];

	datasets[0] = {
      label: entry.label,
      backgroundColor: entry.chart.backgroundColor || _xyz.charts.fallbackStyle.backgroundColor,
      borderColor: entry.chart.borderColor || _xyz.charts.fallbackStyle.borderColor,
      data: data,
      spanGaps: true
    };

    new _xyz.Chart(canvas, {
    	type: 'polarArea',
    	data: {
    		labels: labels,
    		datasets: datasets  		
    	},
    	options: {
    		layout: {
    			padding: {
    				left: 0,
    				right: 0,
    				top: 10,
    				bottom: 10
    			}
    		},
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
    			yAxes: [],
    			xAxes: []
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