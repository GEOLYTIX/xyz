const utils = require('./utils');
const d3 = require('d3');
const lfs = require('./layers_filters');
const lss = require('./layers_style');
const catchments = require('./layers_catchments');
const grid = require('./layers_grid');

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
        
    if ((layer.format === 'mvt' || layer.format === 'geojson') && layer.style && layer.style.theme && layer.style.theme.type === 'categorized') panel.appendChild(mvtCategorized(layer));

    if ((layer.format === 'mvt' || layer.format === 'geojson') && layer.style && layer.style.theme && layer.style.theme.type === 'graduated') panel.appendChild(mvtGraduated(layer));

    if (layer.format === 'cluster' && layer.style && layer.style.theme && layer.style.theme.type === 'categorized') panel.appendChild(clusterCategorized(layer));

    if (layer.format === 'cluster' && layer.style && layer.style.theme && layer.style.theme.type === 'graduated') panel.appendChild(clusterGraduated(layer));

    if (layer.format === 'grid') panel.appendChild(grid.gridControl(layer));

    if (layer.catchments) panel.appendChild(catchments.catchmentControl(layer));
    
    return panel;
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

function mvtCategorized(layer) {

    // Get width from the layer drawer client width and create a new SVG for the legend.
    let width = layer.drawer.clientWidth,
        legend = utils.createElement('div', {
            className: 'section report-block expandable expanded'
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

            // Create a legend title from the categorized.label property.
    if (layer.style.theme.label) utils._createElement({
        tag: 'div',
        options: {
            className: 'title',
            textContent: layer.style.theme.label
        },
        appendTo: legend
    });

    let svg = d3
        .select(legend)
        .append('svg')
        .attr('width', width),
        y = 0;

    Object.keys(layer.style.theme.cat).map((item) => {

        // Attach box for the style category.
        svg.append('rect')
            .attr('x', 4)
            .attr('y', y + 3)
            .attr('width', 14)
            .attr('height', 14)
            .style('fill', layer.style.theme.cat[item].style.fillColor)
            .style('fill-opacity', layer.style.theme.cat[item].style.fillOpacity)
            .style('stroke', layer.style.theme.cat[item].style.color);

        // Attach label with filter on click for the style category.
        svg.append('text')
            .attr('x', 25)
            .attr('y', y + 11)
            .style('font-size', '12px')
            .style('alignment-baseline', 'central')
            .style('cursor', 'pointer')
            .text(layer.style.theme.cat[item].label || item)
            .on('click', function () {
                if (this.style.opacity == 0.5) {
                    this.style.opacity = 1;
                    if(layer.style.theme.cat[item].style.stroke) layer.style.theme.cat[item].style.stroke = true;
                    layer.style.theme.cat[item].style.fill = true;
                } else {
                    this.style.opacity = 0.5;
                    layer.style.theme.cat[item].style.stroke = false;
                    layer.style.theme.cat[item].style.fill = false;
                }

                layer.getLayer();
            });

        y += 20;
    });

    // Attach box for other/default categories.
    if (layer.style.theme.other) {
        svg.append('rect')
            .attr('x', 4)
            .attr('y', y + 3)
            .attr('width', 14)
            .attr('height', 14)
            .style('fill', layer.style.default.fillColor)
            .style('fill-opacity', layer.style.default.fillOpacity)
            .style('stroke', layer.style.default.color);

        // Attach text with filter on click for the other/default category.
        svg.append('text')
            .attr('x', 25)
            .attr('y', y + 11)
            .style('font-size', '12px')
            .style('alignment-baseline', 'central')
            .text('other')
            .on('click', function () {
                if (this.style.opacity == 0.5) {
                    this.style.opacity = 1;
                    layer.style.default.stroke = true;
                    layer.style.default.fill = true;
                } else {
                    this.style.opacity = 0.5;
                    layer.style.default.stroke = false;
                    layer.style.default.fill = false;
                }

                layer.getLayer();
            });

        y += 20
    }       

    // Set height of the svg element.
    svg.attr('height', y);

    return legend;
}

function clusterCategorized(layer) {

    // Get width from the layer drawer client width and create a new SVG for the legend.
    let width = layer.drawer.clientWidth,
        legend = utils.createElement('div', {
            className: 'section report-block expandable expanded'
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

            // Create a legend title from the categorized.label property.
    if (layer.style.theme.label) utils._createElement({
        tag: 'div',
        options: {
            className: 'title',
            textContent: layer.style.theme.label
        },
        appendTo: legend
    });

    let svg = d3
        .select(legend)
        .append('svg')
        .attr('width', width),
        y = 0;

    if (!layer.filter[layer.cluster_cat]) layer.filter[layer.cluster_cat] = {};
    if (!layer.filter[layer.cluster_cat].in) layer.filter[layer.cluster_cat].in = [];
    if (!layer.filter[layer.cluster_cat].ni) layer.filter[layer.cluster_cat].ni = [];

    Object.keys(layer.style.theme.cat).map((item) => {

        // // two columns
        // for (let i = 0; i < keys.length; i++) {
        //     y = i % 2 ? y : y += 25;
        //     x = i % 2 ? w / 2 + 15 : 15;
        // }

        // Attach box for the style category.
        svg.append('image')
            .attr('x', 0)
            .attr('y', y)
            .attr('width', 20)
            .attr('height', 20)
            .attr('xlink:href', layer.style.theme.cat[item].marker);

        // Attach label with filter on click for the style category.
        svg.append('text')
            .attr('x', 25)
            .attr('y', y + 11)
            .style('font-size', '12px')
            .style('alignment-baseline', 'central')
            .style('cursor', 'pointer')
            .text(layer.style.theme.cat[item].label || item)
            .on('click', function () {
                if (this.style.opacity == 0.5) {
                    this.style.opacity = 1;
                    layer.filter[layer.cluster_cat].ni.splice(layer.filter[layer.cluster_cat].ni.indexOf(item), 1);
                } else {
                    this.style.opacity = 0.5;
                    if(!layer.filter[layer.cluster_cat].ni) layer.filter[layer.cluster_cat].ni = [];
                    layer.filter[layer.cluster_cat].ni.push(item);
                }

                layer.getLayer();
            });

        y += 20;
    });

    // Attach box for other/default categories.
    if (layer.style.theme.other) {
        svg.append('image')
            .attr('x', 0)
            .attr('y', y)
            .attr('width', 20)
            .attr('height', 20)
            .attr('xlink:href', layer.style.marker);

        // Attach text with filter on click for the other/default category.
        svg.append('text')
            .attr('x', 25)
            .attr('y', y + 11)
            .style('font-size', '12px')
            .style('alignment-baseline', 'central')
            .style('cursor', 'pointer')
            .text('other')
            .on('click', function () {
                if (this.style.opacity == 0.5) {
                    this.style.opacity = 1;
                    layer.filter[layer.cluster_cat].in = [];
                } else {
                    this.style.opacity = 0.5;
                    layer.filter[layer.cluster_cat].in = Object.keys(layer.style.theme.cat);
                }

                layer.getLayer();
            });

        y += 20;
    }

    y += 25;

    // Add markerMulti default colour if not set.
    if (!layer.style.markerMulti) layer.style.markerMulti = [400,'#333']

    // Add section for clusters and competitors title
    
        svg.append('circle')
        .attr('cx', 20)
        .attr('cy', y)
        .attr('r', 18)
        .attr('fill', layer.style.markerMulti[1]);


    svg.append('text')
        .attr('x', 44)
        .attr('y', y)
        .style('font-size', '12px')
        .style('alignment-baseline', 'central')
        .style('cursor', 'pointer')
        .text('Multiple Locations');

    if (layer.style.theme.competitors) {

        let competitors = Object.keys(layer.style.theme.competitors),
            n = competitors.length,
            i = 0;

        competitors.reverse().forEach(comp => {

            svg.append('circle')
                .attr('cx', 20)
                .attr('cy', y)
                .attr('r', 20 - (i + 1) * 20 / (n + 1))
                .style('fill', layer.style.theme.competitors[comp].colour);

            i++;
        });

        i = 0;

        competitors.reverse().forEach(comp => {

            svg.append('circle')
                .attr('cx', 20)
                .attr('cy', y + 35 + (i * 20))
                .attr('r', 8)
                .style('fill', layer.style.theme.competitors[comp].colour);

            svg.append('text')
                .attr('x', 45)
                .attr('y', y + 35 + (i * 20))
                .attr('alignment-baseline', 'central')
                .style('font-size', '12px')
                .text(layer.style.theme.competitors[comp].label);

            i++;
        });

        y += 15 + (n * 20);

    } else { y += 15 };
        
    // Set height of the svg element.
    svg.attr('height', y += 10);

    return legend;
}

function clusterGraduated(layer) {

    // Get width from the layer drawer client width and create a new SVG for the legend.
    let width = layer.drawer.clientWidth,
        legend = utils.createElement('div', {
            className: 'section report-block expandable expanded'
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

    // Create a legend title from the categorized.label property.
    if (layer.style.theme.label) utils._createElement({
        tag: 'div',
        options: {
            className: 'title',
            textContent: layer.style.theme.label
        },
        appendTo: legend
    });

    let svg = d3
        .select(legend)
        .append('svg')
        .attr('width', width),
        y = 0;

        layer.style.theme.cat.map((cat) => {

        // // two columns
        // for (let i = 0; i < keys.length; i++) {
        //     y = i % 2 ? y : y += 25;
        //     x = i % 2 ? w / 2 + 15 : 15;
        // }

        // Attach box for the style category.
        svg.append('image')
            .attr('x', 0)
            .attr('y', y)
            .attr('width', 20)
            .attr('height', 20)
            .attr('xlink:href', cat.marker || '');

        // Attach label with filter on click for the style category.
        svg.append('text')
            .attr('x', 25)
            .attr('y', y + 11)
            .style('font-size', '12px')
            .style('alignment-baseline', 'central')
            .style('cursor', 'pointer')
            .text(cat.label || '');

        y += 20;
    });  
        
    // Set height of the svg element.
    svg.attr('height', y);

    return legend;
}

function mvtGraduated(layer) {

    // Get width from the layer drawer client width and create a new SVG for the legend.
    let width = layer.drawer.clientWidth,
        legend = utils.createElement('div', {
            className: 'section report-block expandable expanded'
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

        // Create a legend title from the categorized.label property.
        if (layer.style.theme.label) utils._createElement({
            tag: 'div',
            options: {
                className: 'title',
                textContent: layer.style.theme.label
            },
            appendTo: legend
        });

    let svg = d3
        .select(legend)
        .append('svg')
        .attr('width', width),
        y = 0;

    layer.style.theme.cat.map((cat) => {

        // // two columns
        // for (let i = 0; i < keys.length; i++) {
        //     y = i % 2 ? y : y += 25;
        //     x = i % 2 ? w / 2 + 15 : 15;
        // }

        // Attach box for the style category.
        svg.append('rect')
            .attr('x', 4)
            .attr('y', y + 3)
            .attr('width', 14)
            .attr('height', 14)
            .style('fill', cat.style.fillColor)
            .style('fill-opacity', cat.style.fillOpacity)
            .style('stroke', cat.style.color);

        // Attach label with filter on click for the style category.
        svg.append('text')
            .attr('x', 25)
            .attr('y', y + 11)
            .style('font-size', '12px')
            .style('alignment-baseline', 'central')
            .style('cursor', 'pointer')
            .text(cat.label || '');

        y += 20;
    });  
        
    // Set height of the svg element.
    svg.attr('height', y);

    return legend;
}

function wrap(text, width) {
    text.each(function () {
        let
            text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            x = text.attr("x"),
            y = text.attr("y"),
            dy = 1.1,
            tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    });
}

module.exports = {
    panel: panel
}
