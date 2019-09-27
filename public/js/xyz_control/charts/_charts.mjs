import bubbleChart from './bubbleChart.mjs';

import cakeChart from './cakeChart.mjs';

import radarChart from './radarChart.mjs';

import polarChart from './polarChart.mjs';

import scatterplot from './scatterplot.mjs';

import simpleChart from './simpleChart.mjs';

import stackedChart from './stackedChart.mjs';

export default _xyz => {

    const charts = {

        bubble: bubbleChart(_xyz),

        cake: cakeChart(_xyz),

        polarArea: polarChart(_xyz),

        radar: radarChart(_xyz),

        scatter: scatterplot(_xyz),

        simple: simpleChart(_xyz),

        stackedChart: stackedChart(_xyz)
    }

    function create(entry) {

        if (!entry.chart.type) {
            entry.chart.type = 'line';
            return charts.simple(entry);
        }

        if (entry.chart.type === 'mixed') entry.chart.type = 'bar';

        if (entry.chart.type === 'line' || entry.chart.type === 'bar' || entry.chart.type === 'horizontalBar') return charts.simple(entry);

        if (entry.chart.type === 'bubble') return charts.bubble(entry);

        if (entry.chart.type === 'pie' || entry.chart.type === 'doughnut') return charts.cake(entry);

        if (entry.chart.type === 'polarArea') return charts.polarArea(entry);

        if (entry.chart.type === 'radar') return charts.radar(entry);

        if (entry.chart.type === 'scatter') return charts.scatter(entry);

        if (entry.chart.type === 'stackedBar' || entry.chart.type === 'stackedHorizontalBar' || entry.chart.type === 'stackedLine') return charts.stackedChart(entry);

    }

    function bubble(entry) {
        charts.bubble(entry);
    }

    function cake(entry) {
        charts.cake(entry);
    }

    function polarArea(entry) {
        charts.polarArea(entry);
    }

    function radar(entry) {
        charts.radar(entry);
    }

    function scatter(entry) {
        charts.scatter(entry);
    }

    function simple(entry) {
        charts.simple(entry);
    }

    function stackedBar(entry) {
       charts.stackedBar(entry);
    }

    function scale(entry) {
    	let _scale;
    	switch(entry.chart.unit){
    		case 'k': _scale = '1k = 1 000'; break;
    		case 'M': _scale = '1M = 1 000 000'; break;
    	}
    	return _scale;
    }

    function units(entry, label) {
    	let _label;

    	switch(entry.chart.unit){
    		case 'k': _label = label/1000 + 'k'; break;
    		case 'M': _label = label/1000000 + 'M'; break;
    	}
    	return _label;
    }

    return {
        create: create,
        bubble: bubble,
        cake: cake,
        polarArea: polarArea,
        radar: radar,
        scatter: scatter,
        simple: simple,
        stackedBar: stackedBar,
        scale: scale,
        units: units,
        fallbackStyle: {
        	borderColor: '#079e00',
        	backgroundColor: '#DEF6CA'
        }
    }
};