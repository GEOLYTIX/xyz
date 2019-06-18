import bubbleChart from './bubbleChart.mjs';
import cakeChart from './cakeChart.mjs';
import mixedChart from './mixedChart.mjs';
import radarChart from './radarChart.mjs';
import polarChart from './polarChart.mjs';
import scatterplot from './scatterplot.mjs';
import simpleChart from './simpleChart.mjs';
import stackedBarChart from './stackedBarChart.mjs';

export default _xyz => {

    const charts = {

        bubble: bubbleChart(_xyz),

        cake: cakeChart(_xyz),

        mixed: mixedChart(_xyz),

        polarArea: polarChart(_xyz),

        radar: radarChart(_xyz),

        scatter: scatterplot(_xyz),

        simple: simpleChart(_xyz),

        stackedBar: stackedBarChart(_xyz),

    }

    function create(entry) {

    	console.log('hey I am a create chart!');
    	console.log(entry);
    	return;

        if (!entry.chart.type) {
            entry.chart.type = 'line';
            charts.simple(entry);
        }

        if (entry.chart.type === 'line' || entry.chart.type === 'bar' || entry.chart.type === 'horizontalBar') charts.simple(entry);

        if (entry.chart.type === 'pie' || entry.chart.type === 'doughnut') charts.cake(entry);

        if (entry.chart.type === 'mixed') charts.mixed(entry);

        if (entry.chart.type === 'polarArea') chart.polarArea(entry);

        if (entry.chart.type === 'radar') chart.radar(entry);

        if (entry.chart.type === 'scatter') chart.scatter(entry);

        if (entry.chart.type === 'stackedBar') chart.stackedBar(entry)

    }

    function bubble(entry) {
        charts.bubble(entry);
    }

    function cake(entry) {
        charts.cake(entry);
    }

    function mixed(entry) {
        charts.mixed(entry);
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

    return {

        create: create,
        bubble: bubble,
        cake: cake,
        mixed: mixed,
        polarArea: polarArea,
        radar: radar,
        scatter: scatter,
        simple: simple,
        stackedBar: stackedBar

    }



};