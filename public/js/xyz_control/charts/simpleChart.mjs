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

  let labels = entry.fields.map(field => { return entry.chart.x ? String(field[entry.chart.x] ? field[entry.chart.x] : field.label) : field.label; }); // get labels

  labels = labels.filter((item, idx) => { return labels.indexOf(item) >= idx; }); // remove duplicates
    
  let series = entry.fields.map(field => field.dataset); // get series if any

  // strip off duplicates and nulls
  series = series.filter((item, idx) => { return !!item && series.indexOf(item) >= idx; });

  if(!series.length) { // process one dataset

    datasets[0] = {
      label: entry.label || entry.dashboard,
      backgroundColor: entry.chart.backgroundColor || _xyz.charts.fallbackStyle.backgroundColor,
      borderColor: entry.chart.borderColor || _xyz.charts.fallbackStyle.borderColor,
      spanGaps: true,
      data: entry.fields.map(field => (field.type === 'integer' ? parseInt(field.value) : entry.chart.y ? (field[entry.chart.y] ? field[entry.chart.y] : field.value) : field.value))
    };

    // sets offset
    if(entry.chart.offsetX) {

      entry.chart.raw_data = entry.fields.map(field => (field.type === 'integer' ? parseInt(field.value) : entry.chart.y ? field[entry.chart.y] : field.value));

      datasets[0].data = entry.chart.raw_data.map(d => { return d + entry.chart.offsetX; });
    }

    // sets negative color
    if(entry.chart.negativeBackgroundColor || entry.chart.negativeBorderColor){
      let bgColors = [], bdColors = [];
      datasets[0].data.map(d => {
        d > 0 ? bgColors.push(entry.chart.backgroundColor || _xyz.charts.fallbackStyle.backgroundColor) : bgColors.push(entry.chart.negativeBackgroundColor || _xyz.charts.fallbackStyle.borderColor);
        d > 0 ? bdColors.push(entry.chart.backgroundColor || _xyz.charts.fallbackStyle.backgroundColor) : bdColors.push(entry.chart.negativeBackgroundColor || _xyz.charts.fallbackStyle.borderColor);
      });

      datasets[0].backgroundColor = bgColors;
      datasets[0].borderColor = bdColors;
    }

    // sets datalabels and applies offset back
    if(entry.chart.datalabels){

      _xyz.utils.Chart.defaults.global.plugins.datalabels.display = true;

      datasets[0].datalabels = {
        align: 'right',
        anchor: 'end',
        formatter: (item, data) => { // uses raw data in labelling
          if(!entry.chart.raw_data) return;
          let idx = data.dataIndex;
          return entry.chart.raw_data[idx];
        }
      };
    }

  } 

  else { 

    const tmp = {};

    series.map(serie => {

      tmp[serie] = {};
      tmp[serie].data = [];
      tmp[serie].label = serie;


      let idx = series.indexOf(serie);

      tmp[serie].backgroundColor = typeof(entry.chart.backgroundColor) === 'object' ?  entry.chart.backgroundColor[idx] : (entry.chart.backgroundColor || _xyz.charts.fallbackStyle.backgroundColor);
      tmp[serie].borderColor = typeof(entry.chart.borderColor) === 'object' ? entry.chart.borderColor[idx] : (entry.chart.borderColor || _xyz.charts.fallbackStyle.borderColor);
      tmp[serie].spanGaps = true;
    });

    Object.values(entry.fields).map(field => {
      //tmp[(field.dataset)].data.push(field.type === 'integer' ? parseInt(field.value) : field.value);
      tmp[(field.dataset)].data.push(field.type === 'integer' ? parseInt(field.value) : field.y ? field[entry.chart.y] : field.value);
      tmp[(field.dataset)].type = field.chartType || (entry.chart.type || 'line');
    });

    Object.values(tmp).forEach(val => datasets.push(val));
  }

  const title = {
    display: entry.chart.title || false,
    position: 'bottom',
    text: entry.label
  };

  new _xyz.utils.Chart(canvas, {
    	type: entry.chart.type,
    	data: {
    		labels: labels,
    		datasets: datasets
    	},
    	options: {
      layout: entry.chart.layout ? entry.chart.layout : null,
    		title: (entry.chart.title && typeof(entry.chart.title) === 'object' ? entry.chart.title : title),
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
          gridlines: {
            display: true
          },
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
    			}],
        xAxes: [{
          ticks: {
            min: typeof(entry.chart.minX) !== undefined ?  entry.chart.minX : null,
            display: entry.chart.hideTicksX ? false : null
          }
        }]
    		},
    		tooltips: {
    			mode: 'index',
    			xAlign: entry.chart.xAlign || null,
    			yAlign: entry.chart.yAlign || null,
    			callbacks: {
    				title: () => '',
          label: item => {
            return entry.chart.offsetX ? `${item.yLabel}: ${item.xLabel -= entry.chart.offsetX}` : `${item.yLabel}: ${item.xLabel}`;
          }
    			}
    		}
    	}
  });


  return graph;

};