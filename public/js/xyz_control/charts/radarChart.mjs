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

  const datasets = [];

  let labels = entry.fields.map(field => field.label);

  labels = labels.filter((item, idx) => { return labels.indexOf(item) >= idx; }); // remove duplicates

  let series = entry.fields.map(field => field.dataset); // get all series

  series = series.filter((item, idx) => { return !!item && series.indexOf(item) >= idx; }); // strip off duplicates and nulls


  if(!series.length) { // process one dataset

    datasets[0] = {
      label: entry.label,
      backgroundColor: entry.chart.backgroundColor || _xyz.charts.fallbackStyle.backgroundColor,
      borderColor: entry.chart.borderColor || _xyz.charts.fallbackStyle.borderColor,
      pointBackgroundColor: entry.chart.backgroundColor || _xyz.charts.fallbackStyle.backgroundColor,
      pointBorderColor: entry.chart.borderColor || _xyz.charts.fallbackStyle.borderColor,
      lineTension: 0.5,
      spanGaps: true,
      data: entry.fields.map(field => (field.type === 'integer' ? parseInt(field.value) : field.value))
    };
  }

  else { // process multiple series
	    
	    const tmp = {};

	    series.map(serie => { 
	    	
	    	tmp[serie] = {};
	    	tmp[serie].data = [];
	    	tmp[serie].label = serie;

	    	let idx = series.indexOf(serie);

	    	// set dataset colours
	    	tmp[serie].backgroundColor = entry.chart.backgroundColor[idx] ||  null;
	    	tmp[serie].borderColor = entry.chart.borderColor[idx] ||  null;

	    	tmp[serie].pointBackgroundColor = entry.chart.backgroundColor[idx] ||  null;
	    	tmp[serie].pointBorderColor = entry.chart.borderColor[idx] ||  null;
	    	tmp[serie].lineTension = 0.5;

	    });

	    Object.values(entry.fields).map(field => {
	    	tmp[field.dataset].data.push(Number(field.displayValue || Number(field.value)));
	    });

	    Object.values(tmp).forEach(val => datasets.push(val));
  }

  new _xyz.utils.Chart(canvas, {
    type: 'radar',
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
        display: entry.chart.legend,
        position: entry.chart.legendPosition || 'left',
        labels: {
    				boxWidth: 30
    			}
      },
      tooltips: {
        enabled: true
      }
    }
  });
  return graph;
};