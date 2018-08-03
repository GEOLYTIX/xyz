const utils = require('./utils');

module.exports = (layer, panel) => {

    // Create panel block.
    let block = utils._createElement({
        tag: 'div',
        options: {
            classList: 'section expandable'
        },
        appendTo: panel
    });

    // Create block title expander.
    utils._createElement({
        tag: 'div',
        options: {
            className: 'btn_text cursor noselect',
            textContent: 'Cluster'
        },
        appendTo: block,
        eventListener: {
            event: 'click',
            funct: e => {
                e.stopPropagation();
                utils.toggleExpanderParent({
                    expandable: block,
                    accordeon: true,
                    scrolly: document.querySelector('.mod_container > .scrolly')
                })
            }
        }
    });

    // Set cluster defaults
    if (!layer.cluster_kmeans) layer.cluster_kmeans = 0.05;
    if (!layer.cluster_dbscan) layer.cluster_dbscan = 0.01;
    if (!layer.style.markerMin) layer.style.markerMin = 20;
    if (!layer.style.markerMax) layer.style.markerMax = 40;


    // KMeans
    utils._createElement({
        tag: 'span',
        options: {
            textContent: 'Minimum number of cluster (KMeans): '
        },
        appendTo: block
    });

    let lblKMeans = utils._createElement({
        tag: 'span',
        options: {
            textContent: layer.cluster_kmeans,
            className: 'bold'
        },
        appendTo: block
    });

    let rKMeans = utils._createElement({
        tag: 'div',
        options: {
            className: 'range'
        },
        appendTo: block
    });

    let timeout;

    utils._createElement({
        tag: 'input',
        options: {
            type: 'range',
            min: 1,
            value: parseInt(layer.cluster_kmeans * 100),
            max: 50,
            step: 1
        },
        appendTo: rKMeans,
        eventListener: {
            event: 'input',
            funct: e => {
                lblKMeans.innerHTML = e.target.value / 100;
                layer.cluster_kmeans = e.target.value / 100;
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    timeout = null;
                    layer.getLayer(_xyz);
                }, 500); 
            }
        }
    });


    // DBScan
    utils._createElement({
        tag: 'span',
        options: {
            textContent: 'Maximum distance between locations in cluster (DBScan): '
        },
        appendTo: block
    });

    let lblDBScan = utils._createElement({
        tag: 'span',
        options: {
            textContent: layer.cluster_dbscan,
            className: 'bold'
        },
        appendTo: block
    });

    let rDBScan = utils._createElement({
        tag: 'div',
        options: {
            className: 'range'
        },
        appendTo: block
    });

    utils._createElement({
        tag: 'input',
        options: {
            type: 'range',
            min: 1,
            value: parseInt(layer.cluster_dbscan * 100),
            max: 50,
            step: 1
        },
        appendTo: rDBScan,
        eventListener: {
            event: 'input',
            funct: e => {
                lblDBScan.innerHTML = e.target.value / 100;
                layer.cluster_dbscan = e.target.value / 100;
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    timeout = null;
                    layer.getLayer(_xyz);
                }, 500);
            }
        }
    });


    // markerMin
    utils._createElement({
        tag: 'span',
        options: {
            textContent: 'Marker Min: '
        },
        appendTo: block
    });

    let lblMarkerMin = utils._createElement({
        tag: 'span',
        options: {
            textContent: layer.style.markerMin,
            className: 'bold'
        },
        appendTo: block
    });

    let rMarkerMin = utils._createElement({
        tag: 'div',
        options: {
            className: 'range'
        },
        appendTo: block
    });

    utils._createElement({
        tag: 'input',
        options: {
            type: 'range',
            min: parseInt(layer.style.markerMin * 0.3),
            value: parseInt(layer.style.markerMin),
            max: parseInt(layer.style.markerMin * 3)
        },
        appendTo: rMarkerMin,
        eventListener: {
            event: 'input',
            funct: e => {
                lblMarkerMin.innerHTML = e.target.value;
                layer.style.markerMin = parseInt(e.target.value);
                layer.getLayer(_xyz);
            }
        }
    });


    // markerMax
    utils._createElement({
        tag: 'span',
        options: {
            textContent: 'Marker Max: '
        },
        appendTo: block
    });

    let lblMarkerMax = utils._createElement({
        tag: 'span',
        options: {
            textContent: layer.style.markerMax,
            className: 'bold'
        },
        appendTo: block
    });

    let rMarkerMax = utils._createElement({
        tag: 'div',
        options: {
            className: 'range'
        },
        appendTo: block
    });

    utils._createElement({
        tag: 'input',
        options: {
            type: 'range',
            min: parseInt(layer.style.markerMax * 0.3),
            value: parseInt(layer.style.markerMax),
            max: parseInt(layer.style.markerMax * 3)
        },
        appendTo: rMarkerMax,
        eventListener: {
            event: 'input',
            funct: e => {
                lblMarkerMax.innerHTML = e.target.value;
                layer.style.markerMax = parseInt(e.target.value);
                layer.getLayer(_xyz);
            }
        }
    });


    // Log scale cluster.
    let logScale = utils.checkbox(function (e) {
        layer.markerLog = e.target.checked;
        layer.style.markerLog = layer.markerLog;
        layer.getLayer(_xyz);
    }, { label: 'Log scale cluster', id: layer.layer + '_logscale' });

    block.appendChild(logScale);
}