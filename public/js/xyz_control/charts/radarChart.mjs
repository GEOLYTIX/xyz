export default _xyz => entry => {
	
	console.log('hi I am a radar chart');

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

	let series = entry.fields.map(field => field.dataset); // get all series

    // remove duplicates
	series = series.filter((item, idx) => {
		return series.indexOf(item) >= idx;
	});

	let labels = entry.fields.map(field => field.label);

	labels = labels.filter((item, idx) => {
		return labels.indexOf(item) >= idx;
	});

	let datasets = [];
	let tmp = {};

	series.map(serie => { 
		tmp[serie] = {}; 
		tmp[serie].data = [];

		let idx = series.indexOf(serie);

		// set dataset colours

		tmp[serie].backgroundColor = entry.chart.backgroundColor[idx] ||  null;
		tmp[serie].borderColor = entry.chart.borderColor[idx] ||  null;

		tmp[serie].pointBackgroundColor = entry.chart.backgroundColor[idx] ||  null;
		tmp[serie].pointBorderColor = entry.chart.borderColor[idx] ||  null;

		tmp[serie].lineTension = 0.5;

		if(entry.chart.fillOpacity){ // set fill opacity
			if(tmp[serie].backgroundColor) tmp[serie].backgroundColor = _xyz.utils.hexToRGBA(tmp[serie].backgroundColor, entry.chart.fillOpacity);
			if(tmp[serie].pointBackgroundColor) tmp[serie].pointBackgroundColor = _xyz.utils.hexToRGBA(tmp[serie].pointBackgroundColor, entry.chart.fillOpacity);
		}

	});

	Object.values(entry.fields).map(field => {
		tmp[field.dataset].data.push(Number(field.value));
	});

	Object.values(tmp).forEach(val => datasets.push(val));

	new _xyz.Chart(canvas, {
		type: 'radar',
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
			tooltips: {
				enabled: true
			}
		}
	});

	return graph;

}