const utils = require('./utils');
const d3 = require('d3');
const lfs = require('./layers_filters');
const lss = require('./layers_style');
const catchments = require('./layers_catchments');
const grid = require('./layers_grid');
const themes = require('./layers_theme');

function panel(layer) {

    let width = layer.drawer.clientWidth,
        panel = utils.createElement('div', {
            className: 'panel'
        });

    if (layer.meta) panel.appendChild(utils.createElement('p', {
        className: 'meta',
        textContent: layer.meta
    }));


    if (layer.format === 'cluster') panel.appendChild(clusterSettings(layer));
    
    // apply filters if exist
    if(!!lfs.applyFilters(layer)) panel.appendChild(lfs.layerFilters(layer));
    
    if (layer.format === 'mvt') panel.appendChild(lss.mvt_style(layer));
    
    /* legend container */
    let legend = createLegendContainer(layer);
    
    if(layer.style.themes) {
        
        let applied;
        
        // check for default `applied` theme
        Object.keys(layer.style.themes).map(function(key){
            if(!layer.style.theme && layer.style.themes[key].applied){
                layer.style.theme = layer.style.themes[key];
                applied = key;
            }
        }); 
        
        legend = themes.themes(layer, legend, applied);
        
        panel.appendChild(legend);
        
    }
    
    if (layer.format === 'grid') panel.appendChild(grid.gridControl(layer));

    if (layer.catchments) panel.appendChild(catchments.catchmentControl(layer));
    
    return panel;
}



// Create legend section
function createLegendContainer(layer){
    // Get width from the layer drawer client width and create a new SVG for the legend.
    let width = layer.drawer.clientWidth,
        legend = utils._createElement({
            tag: "div",
            options: {
                className: 'section report-block expandable expanded'
            }
        });
    
    utils._createElement({
        tag: 'div',
        options: {
            className: 'btn_text cursor noselect',
            textContent: 'Legend'
        },
        appendTo: legend,
        eventListener: {
            event: 'click',
            funct: e => {
                e.stopPropagation();
                utils.toggleExpanderParent({
                    expandable: legend,
                    accordeon: true,
                    scrolly: document.querySelector('.mod_container > .scrolly')
                })
            }
        }
    });
    return legend;
}

// Begin cluster settings
function clusterSettings(layer) {

    // Add a settings div
    let settings = utils.createElement('div', {
        classList: 'section expandable'
    });

    utils._createElement({
        tag: 'div',
        options: {
            className: 'btn_text cursor noselect',
            textContent: 'Cluster Settings'
        },
        appendTo: settings,
        eventListener: {
            event: 'click',
            funct: e => {
                e.stopPropagation();
                utils.toggleExpanderParent({
                    expandable: settings,
                    accordeon: true,
                    scrolly: document.querySelector('.mod_container > .scrolly')
                })
            }
        }
    });

    // Set cluster defaults
    if (!layer.cluster_kmeans) layer.cluster_kmeans = 100;
    if (!layer.cluster_dbscan) layer.cluster_dbscan = 0.01;
    if (!layer.style.markerMin) layer.style.markerMin = 20;
    if (!layer.style.markerMax) layer.style.markerMax = 40;

    // KMeans
    settings.appendChild(utils.createElement('span', {
        textContent: 'Minimum number of cluster (KMeans): '
    }));

    let lblKMeans = utils.createElement('span', {
        textContent: layer.cluster_kmeans,
        className: 'bold'
    });
    settings.appendChild(lblKMeans);

    let sliKMeans = utils.createElement('input', {
        type: 'range',
        min: layer.cluster_kmeans / 2,
        value: layer.cluster_kmeans,
        max: layer.cluster_kmeans * 1.5
    });

    let timeout;
    sliKMeans.addEventListener('input', function () {
        lblKMeans.innerHTML = this.value;
        layer.cluster_kmeans = this.value;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            timeout = null;
            layer.getLayer();
        }, 500);
    });

    let rKMeans = utils.createElement('div', {
        className: 'range'
    });
    rKMeans.appendChild(sliKMeans);
    settings.appendChild(rKMeans);


    // DBScan
    settings.appendChild(utils.createElement('span', {
        textContent: 'Maximum distance between locations in cluster (DBScan): '
    }));

    let lblDBScan = utils.createElement('span', {
        textContent: layer.cluster_dbscan,
        className: 'bold'
    });
    settings.appendChild(lblDBScan);

    let sliDBScan = utils.createElement('input', {
        type: 'range',
        min: layer.cluster_dbscan * 500,
        value: layer.cluster_dbscan * 1000,
        max: layer.cluster_dbscan * 1500
    });
    sliDBScan.addEventListener('input', function () {
        lblDBScan.innerHTML = this.value / 1000;
        layer.cluster_dbscan = this.value / 1000;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            timeout = null;
            layer.getLayer();
        }, 500);
    });

    let rDBScan = utils.createElement('div', {
        className: 'range'
    });
    rDBScan.appendChild(sliDBScan);
    settings.appendChild(rDBScan);


    // markerMin
    settings.appendChild(utils.createElement('span', {
        textContent: 'Marker Min: '
    }));

    let lblMarkerMin = utils.createElement('span', {
        textContent: layer.style.markerMin,
        className: 'bold'
    });
    settings.appendChild(lblMarkerMin);

    let sliMarkerMin = utils.createElement('input', {
        type: 'range',
        min: parseInt(layer.style.markerMin * 0.3),
        value: parseInt(layer.style.markerMin),
        max: parseInt(layer.style.markerMin * 3)
    });
    sliMarkerMin.addEventListener('input', function () {
        lblMarkerMin.innerHTML = this.value;
        layer.style.markerMin = parseInt(this.value);
        layer.getLayer();
    });

    let rMarkerMin = utils.createElement('div', {
        className: 'range'
    });
    rMarkerMin.appendChild(sliMarkerMin);
    settings.appendChild(rMarkerMin);


    // markerMax
    settings.appendChild(utils.createElement('span', {
        textContent: 'Marker Max: '
    }));

    let lblMarkerMax = utils.createElement('span', {
        textContent: layer.style.markerMax,
        className: 'bold'
    });
    settings.appendChild(lblMarkerMax);

    let sliMarkerMax = utils.createElement('input', {
        type: 'range',
        min: parseInt(layer.style.markerMax * 0.3),
        value: parseInt(layer.style.markerMax),
        max: parseInt(layer.style.markerMax * 3)
    });
    sliMarkerMax.addEventListener('input', function () {
        lblMarkerMax.innerHTML = this.value;
        layer.style.markerMax = parseInt(this.value);
        layer.getLayer();
    });

    let rMarkerMax = utils.createElement('div', {
        className: 'range'
    });
    rMarkerMax.appendChild(sliMarkerMax);
    settings.appendChild(rMarkerMax);
    
    
    // Log scale cluster.
    let logScale = utils.checkbox(function(e){
        layer.markerLog = e.target.checked;
        layer.style.markerLog = layer.markerLog;
        layer.getLayer();
    }, {label: 'Log scale cluster', id: layer.layer + '_logscale'});
    
    settings.appendChild(logScale);


    return settings;
}


module.exports = {
    panel: panel
}
