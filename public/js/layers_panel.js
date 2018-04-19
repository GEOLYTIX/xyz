const utils = require('./utils');
const d3 = require('d3');

function panel(layer) {

    let width = layer.drawer.clientWidth,
        panel = utils.createElement('div', {
            className: 'panel'
        });

    if (layer.meta) panel.appendChild(utils.createElement('p', {
        className: 'meta',
        textContent: layer.meta
    }));
    
    if(!!applyFilters(layer)) panel.appendChild(layerFilters(layer, applyFilters(layer)));
    
    if (layer.format === 'mvt' && layer.style && layer.style.categorized) panel.appendChild(mvtCategorized(layer));

    if (layer.format === 'cluster') panel.appendChild(clusterSettings(layer));

    if (layer.format === 'cluster' && layer.style && layer.style.theme && layer.style.theme.type === 'categorized') panel.appendChild(clusterCategorized(layer));

    if (layer.format === 'cluster' && layer.style && layer.style.theme && layer.style.theme.type === 'graduated') panel.appendChild(clusterGraduated(layer));

    if (layer.format === 'grid') panel.appendChild(gridControl(layer));

    return panel;
}

function applyFilters(layer){
    let enabled = 0;
    
    if(layer.infoj){
        Object.keys(layer.infoj).map(function(key){
            if(layer.infoj[key].filter){
                if(layer.infoj[key].filter === "text"){
                    enabled += 100;
                }
                if(layer.infoj[key].filter === "numeric"){
                    enabled += 120;
                }
                if(typeof(layer.infoj[key].filter) === 'object'){
                    enabled += 40*layer.infoj[key].filter.length + 50;
                }
            }
        });
        return enabled;
        
    } else {
        return false;
    }
}

function layerFilters(layer, height){
    
    // Add a filters div
    let filters = utils.createElement('div', {
        classList: 'settings filters'
    });
    
    filters.style.maxHeight = '30px';

    // Create control to toggle layer visibility.
    let div = utils.createElement('div', {
        textContent: 'Filtering',
        className: 'cursor noselect'
    });
    
    div.style.color = '#090';

    div.addEventListener('click', function () {
        if (filters.style.maxHeight === '30px') {
           
            filters.style.maxHeight = height.toString() + 'px';
            layer.drawer.style.maxHeight = (layer.panel.clientHeight + height) + 'px';
            div.style.color = '#333';
        } else {
            filters.style.maxHeight = '30px';
            layer.drawer.style.maxHeight = (layer.panel.clientHeight + 40) + 'px';
            div.style.color = '#090';
        }
    });
    filters.appendChild(div);
    
    let numeric_div = utils.createElement('div', {
        className: "filter--numeric"
    }),
        checkbox_div = utils.createElement('div', {
            className: "filter--checkbox"
        }),
        text_div = utils.createElement('div', {
            className: "filter--text"
        });
    
    numeric_div.style.marginLeft = "10px";
    checkbox_div.style.marginLeft = "10px";
    text_div.style.marginLeft = "10px";

    filters.style.color = '#090';
    
    Object.keys(layer.infoj).map(function(key){
        
        if(typeof(layer.infoj[key].filter) === "object"){
            
            Object.keys(layer.infoj[key].filter).map(function(_key){
            
                let _field = layer.infoj[key].field,
                    _label = layer.infoj[key].filter[_key],
                    _id = layer.table + "--" + layer.infoj[key].field + "--" + key + "--" + _key,
                    _table = layer.table,
                    _content;
                
                
                
                if(_key === "0"){
                    let _title = utils.createElement('h4', {
                       textContent: layer.infoj[key].filter[_key]
                    });
                    
                    checkbox_div.appendChild(_title);
                } else {
    
                    _content = filter_checkbox(_field, _label, _id);
                    
                    _content.style.marginLeft = '30px';
                    
                    checkbox_div.appendChild(_content);
                }
                
            });
        } else {
            
            let _field = layer.infoj[key].field,
                _label = layer.infoj[key].label,
                _table = layer.table,
                _content;
            
            
            if(layer.infoj[key].filter === "numeric"){
                
                _content = filter_numeric(_field, _label, _table); 
                
                _content.style.marginLeft = '10px';
                
                numeric_div.appendChild(_content);
            }
            
            if(layer.infoj[key].filter === "text"){
                
                let _content = filter_text(_field, _label, _table); 

                _content.style.marginLeft = '10px';
                
                text_div.appendChild(_content);
            }
        }
        
    });
    
    filters.appendChild(numeric_div);
    filters.appendChild(checkbox_div);
    filters.appendChild(text_div);
    
    return filters;
}

function filter_text(field, label, table){
    let div = utils.createElement('div');
    
    let title = utils.createElement('h4', {
        textContent: label
    });
    
    div.appendChild(title);
    
    let input = utils.createElement('input', {
        id: table + "--" + field,
        placeholder: 'Search.'
    });
    
    input.style.width = "100%";
    
    div.appendChild(input);
    
    return div;
}


// create numeric filter 
function filter_numeric(field, label, table){
    let div = utils.createElement('div');
   
    let title = utils.createElement('h4', {
        textContent: label
    });
    
    div.appendChild(title);
    
    let operators = [{name: "less than", val: "<"}, {name: "more than", val: ">"}];
    
    let select = utils.createElement('select', {
        id: table + "--" + field + "--select",
    });
    
    Object.keys(operators).map(function(key){

        let operator = utils.createElement('option', {
            value: operators[key].val,
            textContent: operators[key].name
        }); 
        select.appendChild(operator);
    });
    
    select.selectedIndex = 0;
    
    div.appendChild(select);
    
    let input = utils.createElement('input', {
        id: table + "--" + field,
        placeholder: 'Set value.'
    });
    
    input.style.width = "100%";
    
    div.append(input);
    
    return div;
}

// create checkbox filter
function filter_checkbox(field, label, id){
    
    function filter_checkbox_onclick(e){
        console.log('filter checkbox checked');
    }
    
    let checkbox = utils.checkbox(id, label, filter_checkbox_onclick);
    
    return checkbox;
}

// Begin cluster settings

function clusterSettings(layer) {

    // Add a settings div
    let settings = utils.createElement('div', {
        className: 'settings'
    });

    settings.style.maxHeight = '30px';

    // Create control to toggle layer visibility.
    let div = utils.createElement('div', {
        textContent: 'Cluster Settings',
        className: 'cursor noselect'
    });

    div.style.color = '#090';

    div.addEventListener('click', function () {
        if (settings.style.maxHeight === '30px') {
            settings.style.maxHeight = '320px';
            layer.drawer.style.maxHeight = (layer.panel.clientHeight + 360) + 'px';
            div.style.color = '#333';
        } else {
            settings.style.maxHeight = '30px';
            layer.drawer.style.maxHeight = (layer.panel.clientHeight + 40) + 'px';
            div.style.color = '#090';
        }
    });
    settings.appendChild(div);


    // Set cluster defaults
    if (!layer.cluster_kmeans) layer.cluster_kmeans = 10;
    if (!layer.cluster_dbscan) layer.cluster_dbscan = 0.02;
    if (!layer.style.markerMin) layer.style.markerMin = 20;
    if (!layer.style.markerMax) layer.style.markerMax = 40;

    // KMeans
    settings.appendChild(utils.createElement('span', {
        textContent: 'KMeans: '
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
    sliKMeans.addEventListener('input', function () {
        lblKMeans.innerHTML = this.value;
        layer.cluster_kmeans = this.value;
        layer.getLayer();
    });

    let rKMeans = utils.createElement('div', {
        className: 'range'
    });
    rKMeans.appendChild(sliKMeans);
    settings.appendChild(rKMeans);


    // DBScan
    settings.appendChild(utils.createElement('span', {
        textContent: 'DBScan: '
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
        layer.getLayer();
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
    let table = utils.createElement('table', {
        className: 'checkbox'
    });

    let td = utils.createElement('td', {
        className: 'box'
    });

    layer.markerLog = utils.createElement('input', {
        id: layer.layer + '_logscale',
        type: 'checkbox'
    });

    layer.markerLog.checked = layer.style.markerLog;
    layer.markerLog.addEventListener('click', function () {
        layer.getLayer();
    });

    let label = utils.createElement('label', {
        htmlFor: layer.layer + '_logscale'
    });

    td.appendChild(layer.markerLog);
    td.appendChild(label);

    table.appendChild(td);
    table.appendChild(utils.createElement('td', {
        textContent: 'Log scale cluster'
    }));
    
    settings.appendChild(table);


    return settings;
}

function mvtCategorized(layer) {

    // Get width from the layer drawer client width and create a new SVG for the legend.
    let width = layer.drawer.clientWidth,
        legend = utils.createElement('div', {
            className: 'legend'
        }),
        svg = d3
            .select(legend)
            .append('svg')
            .attr('width', width),
        y = 10;

    // Create a legend title from the categorized.label property.
    if (layer.style.categorized.label) {
        svg.append('text')
            .attr('x', 0)
            .attr('y', y)
            .style('font-weight', 600)
            .style('font-size', '14px')
            .text(layer.style.categorized.label || 'Legend');
        y += 10;
    }

    Object.keys(layer.style.categorized.cat).map((item) => {

        // Attach box for the style category.
        svg.append('rect')
            .attr('x', 4)
            .attr('y', y + 3)
            .attr('width', 14)
            .attr('height', 14)
            .style('fill', layer.style.categorized.cat[item].style.fillColor)
            .style('fill-opacity', layer.style.categorized.cat[item].style.fillOpacity)
            .style('stroke', layer.style.categorized.cat[item].style.color);

        // Attach label with filter on click for the style category.
        svg.append('text')
            .attr('x', 25)
            .attr('y', y + 11)
            .style('font-size', '12px')
            .style('alignment-baseline', 'central')
            .style('cursor', 'pointer')
            .text(layer.style.categorized.cat[item].label || item)
            .on('click', function () {
                if (this.style.opacity == 0.5) {
                    this.style.opacity = 1;
                    layer.style.categorized.cat[item].style.stroke = true;
                    layer.style.categorized.cat[item].style.fill = true;
                } else {
                    this.style.opacity = 0.5;
                    layer.style.categorized.cat[item].style.stroke = false;
                    layer.style.categorized.cat[item].style.fill = false;
                }

                layer.getLayer();
            });

        y += 20;
    });

    // Attach box for other/default categories.
    if (layer.style.categorized.other) {
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
            className: 'legend'
        }),
        svg = d3
            .select(legend)
            .append('svg')
            .attr('width', width),
        y = 15;

    // Create a legend title from the categorized.label property.
    if (layer.style.theme.label) {
        svg.append('text')
            .attr('x', 0)
            .attr('y', y)
            .style('font-weight', 600)
            .style('font-size', '14px')
            .text(layer.style.theme.label);
        y += 10;
    }

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
                    layer.filter.cat.ni.splice(layer.filter[layer.cluster_cat].ni.indexOf(item),1);
                } else {
                    this.style.opacity = 0.5;
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
        .attr('r', 20)
        .style('fill', layer.style.markerMulti[1]);

    svg.append('text')
        .attr('x', 45)
        .attr('y', y)
        .style('font-size', '12px')
        .style('alignment-baseline', 'central')
        .style('cursor', 'pointer')
        .text('Multiple Locations');

    if (layer.style.theme.competitors) {

        let competitors = Object.keys(layer.style.theme.competitors),
            n = competitors.length,
            i = 0;

        competitors.map(comp => {

            svg.append('circle')
                .attr('cx', 20)
                .attr('cy', y)
                .attr('r', 20 - (i + 1) * 20 / (n + 1))
                .style('fill', layer.style.theme.competitors[comp].colour);

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
            className: 'legend'
        }),
        svg = d3
            .select(legend)
            .append('svg')
            .attr('width', width),
        y = 15;

    // Create a legend title from the categorized.label property.
    if (layer.style.theme.label) {
        svg.append('text')
            .attr('x', 0)
            .attr('y', y)
            .style('font-weight', 600)
            .style('font-size', '14px')
            .text(layer.style.theme.label);
        y += 10;
    }

    layer.style.theme.filter = [];
    layer.style.theme.filterOther = false;

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

function gridControl(layer) {

    let width = layer.drawer.clientWidth,
        legend = utils.createElement('div', {
            className: 'legend'
        });

    // Select dropdown for size.
    let selSize = utils.createElement('select', {
        className: 'selSize',
        name: 'selSize'
    });
    setDropDown(selSize, 'grid_size');
    legend.appendChild(selSize);

    // Create a D3 svg for the legend and nest between size and color drop down.
    let svg = d3
        .select(legend)
        .append('svg')
        .attr('width', width);

    // Select dropdown for color.
    let selColor = utils.createElement('select', {
        className: 'selColor',
        name: 'selColor'
    });
    setDropDown(selColor, 'grid_color');
    legend.appendChild(selColor);

    // Grid ration checkbox element.
    let checkbox = utils.createElement('table', { className: 'checkbox' }),
        td = utils.createElement('td', { className: 'box' });

    layer.chkGridRatio = utils.createElement('input', {
        type: 'checkbox',
        id: 'chkGridRatio'
    });

    // Set checked from either hook.grid_ratio or layer.grid_ratio.
    layer.chkGridRatio.checked = layer.grid_ratio || _xyz.hooks.grid_ratio;
    layer.grid_ratio = layer.chkGridRatio.checked;
    if (layer.chkGridRatio.checked) _xyz.setHook('grid_ratio', true);

    // Checkbox click event to toggle grid_ratio.
    layer.chkGridRatio.addEventListener('click', function () {
        layer.grid_ratio = this.checked;
        if (layer.grid_ratio) {
            _xyz.setHook('grid_ratio', true);
        } else {
            _xyz.removeHook('grid_ratio');
        }
        layer.getLayer();
    });

    // Add grid ratio checkbox to panel.
    td.appendChild(layer.chkGridRatio);
    td.appendChild(utils.createElement('label', {
        htmlFor: 'chkGridRatio'
    }));
    checkbox.appendChild(td);
    checkbox.appendChild(utils.createElement('td', {
        textContent: 'Display colour values as a ratio to the size value.'
    }));
    legend.appendChild(checkbox);

    // Set dropdown values and events.
    function setDropDown(select, query) {

        // Populate select options
        layer.queryFields.map(function (queryField) {
            select.appendChild(
                utils.createElement('option', {
                    value: queryField[0],
                    textContent: queryField[1]
                })
            );
        });

        // Set the select from either hook[query] or layer[query].
        select.selectedIndex = _xyz.hooks[query] || layer[query] ? utils.getSelectOptionsIndex(select.options, _xyz.hooks[query] || layer[query]) : 0;
        layer[query] = select.value;
        _xyz.setHook(query, select.value);

        // onchange event to set the hook and title.
        select.onchange = function () {
            _xyz.setHook(query, event.target.value);
            layer[query] = event.target.value;
            layer.getLayer();
        };
    }

    // Add default style.range if none exists.
    if (!layer.style) layer.style = {};
    if (!layer.style.range) layer.style.range = [
        "#15773f",
        "#66bd63",
        "#a6d96a",
        "#d9ef8b",
        "#fdae61",
        "#f46d43",
        "#d73027"
    ];

    // Create SVG grid legend
    let
        yTrack = 35,
        padding = 0,
        _width = width - (2 * padding),
        n = layer.style.range.length;

    for (let i = 0; i < n; i++) {

        let
            r = (i + 2) * 10 / n,
            w = _width / n,
            x = padding + (i * w);

        svg
            .append('circle')
            .attr('cx', x + w / 2 + 1)
            .attr('cy', yTrack + 1)
            .attr('r', r)
            .style('fill', '#333');

        svg
            .append('circle')
            .attr('cx', x + w / 2)
            .attr('cy', yTrack)
            .attr('r', r)
            .style('fill', '#999');

        if (i === 0) svg.append('text')
            .attr('x', x)
            .attr('y', yTrack - 20)
            .style('font-size', 13)
            .attr('text-anchor', 'start')
            .style('font-family', '"PT Mono", monospace')
            .attr('id', 'grid_legend_size__min')
            .text('min')
            .attr('id', 'grid_legend_size__min');

        if (i === (n / 2 % 1 != 0 && Math.round(n / 2) - 1)) svg.append('text')
            .attr('x', x + w / 2)
            .attr('y', yTrack - 20)
            .style('font-size', 13)
            .attr('text-anchor', 'middle')
            .style('font-family', '"PT Mono", monospace')
            .text('avg')
            .attr('id', 'grid_legend_size__avg');

        if (i === n - 1) svg.append('text')
            .attr('x', x + w)
            .attr('y', yTrack - 20)
            .style('font-size', 13)
            .attr('text-anchor', 'end')
            .style('font-family', '"PT Mono", monospace')
            .text('max')
            .attr('id', 'grid_legend_size__max');

    }

    yTrack += 20;

    for (let i = 0; i < n; i++) {

        let
            w = _width / n,
            x = padding + i * w;

        svg
            .append('rect')
            .attr('x', x)
            .attr('y', yTrack)
            .attr('width', w)
            .attr('height', 20)
            .style('fill', layer.style.range[i]);

        if (i === 0) svg.append('text')
            .attr('x', x)
            .attr('y', yTrack + 40)
            .style('font-size', 13)
            .attr('text-anchor', 'start')
            .style('font-family', '"PT Mono", monospace')
            .attr('id', 'grid_legend_color__min')
            .text('min');
        // .text(arrayColor[i].toLocaleString('en-GB', {
        //     maximumFractionDigits: 0
        // }));

        if (i === (n / 2 % 1 != 0 && Math.round(n / 2) - 1)) svg.append('text')
            .attr('x', x + w / 2)
            .attr('y', yTrack + 40)
            .style('font-size', 13)
            .attr('text-anchor', 'middle')
            .style('font-family', '"PT Mono", monospace')
            .attr('id', 'grid_legend_color__avg')
            .text('avg');

        if (i === n - 1) svg.append('text')
            .attr('x', x + w)
            .attr('y', yTrack + 40)
            .style('font-size', 13)
            .attr('text-anchor', 'end')
            .style('font-family', '"PT Mono", monospace')
            .attr('id', 'grid_legend_color__max')
            .text('max');
    }

    svg.attr('height', yTrack + 43);

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