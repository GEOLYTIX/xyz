const utils = require('./utils');
const d3 = require('d3');
const svg_symbols = require('./svg_symbols');

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
            textContent: 'Themes'
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

    // Create panel block.
    layer.legend = utils._createElement({
        tag: 'div',
        options: {
            classList: 'legend'
        }
    });

    // set theme to first theme from array
    if (!layer.style.theme) layer.style.theme = layer.style.themes[0] || undefined;

    if (layer.style.themes) {

        // Theme drop down
        utils._createElement({
            tag: 'span',
            options: {
                textContent: 'Select thematic style…'
            },
            appendTo: block
        });

        let select = utils._createElement({
            tag: 'select',
            options: {
                onchange: e => {
                    layer.legend.innerHTML = '';

                    // clear any applied 'ni' filters when theme changes
                    if (layer.style.theme && layer.filter[layer.style.theme.field] && layer.filter[layer.style.theme.field].ni) layer.filter[layer.style.theme.field].ni = [];

                    layer.style.theme = layer.style.themes[e.target.selectedIndex];
                    applyTheme(layer);
                    layer.getLayer();
                }
            },
            appendTo: block
        });

        // add themes to dropdown
        Object.keys(layer.style.themes).forEach(key => {
            utils._createElement({
                tag: 'option',
                options: {
                    value: key,
                    textContent: layer.style.themes[key].label || key
                },
                appendTo: select
            });
        });

        if (layer.style.themes.length === 1) select.disabled = true;

        // utils._createElement({
        //     tag: 'option',
        //     options: {
        //         textContent: 'Create new theme…'
        //     },
        //     appendTo: select
        // });

    } else {

        // Single theme title.
        if (layer.style.theme.label) utils._createElement({
            tag: 'span',
            options: {
                classList: 'title',
                textContent: layer.style.theme.label
            },
            appendTo: block
        });
    }

    block.appendChild(layer.legend);
    
    applyTheme(layer);
    
    function applyTheme(layer) {
        
        if(layer.style.theme){
            
            layer.legend.innerHtml = '';
            
            if ((layer.format === 'mvt' || layer.format === 'geojson')
            && layer.style.theme.type === 'categorized') polyCategorized(layer);
            
            if ((layer.format === 'mvt' || layer.format === 'geojson')
            && layer.style.theme.type === 'graduated') polyGraduated(layer);
            
            if (layer.format === 'cluster'
            && layer.style.theme.type === 'categorized') clusterCategorized(layer);
            
            if (layer.format === 'cluster'
            && layer.style.theme.type === 'graduated') clusterGraduated(layer);
        }
    }
}

function polyGraduated(layer) {

    let width = layer.drawer.clientWidth;

    let svg = d3
        .select(layer.legend)
        .append('svg')
        .attr('width', width),
        y = 10;

    layer.style.theme.cat.forEach(cat => {
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
}

function polyCategorized(layer) {

    let width = layer.drawer.clientWidth;

    let svg = d3
        .select(layer.legend)
        .append('svg')
        .attr('width', width),
        y = 10;

    Object.keys(layer.style.theme.cat).forEach(item => {
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
                    //if(layer.style.theme.cat[item].style.stroke) {
                    layer.style.theme.cat[item].style.stroke = true;
                    //}
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
}

function clusterCategorized(layer) {

    let width = layer.drawer.clientWidth;

    let svg = d3
        .select(layer.legend)
        .append('svg')
        .attr('width', width),
        y = 10;

    if (!layer.style.theme.field) return;

    let _field = layer.style.theme.field;

    if (!layer.filter[_field]) layer.filter[_field] = {};
    if (!layer.filter[_field].in) layer.filter[_field].in = [];
    if (!layer.filter[_field].ni) layer.filter[_field].ni = [];

    Object.keys(layer.style.theme.cat).forEach(item => {

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
            .attr('xlink:href', svg_symbols.create(layer.style.theme.cat[item].marker));

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
                    layer.filter[_field].ni.splice(layer.filter[_field].ni.indexOf(item), 1);
                } else {
                    this.style.opacity = 0.5;
                    //if(!layer.filter[_field]) layer.filter[_field] = {};
                    //if(!layer.filter[_field].ni) layer.filter[_field].ni = [];
                    layer.filter[_field].ni.push(item);
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
            .attr('xlink:href', svg_symbols.create(layer.style.marker));

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
                    //if(!layer.filter[_field]) layer.filter[_field] = {};
                    layer.filter[_field].in = [];
                } else {
                    this.style.opacity = 0.5;
                    layer.filter[_field].in = Object.keys(layer.style.theme.cat);
                }

                layer.getLayer();
            });

        y += 20;
    }

    y += 25;

    // Add markerMulti default colour if not set.
    if (!layer.style.markerMulti) layer.style.markerMulti = {type: "target", style: [400, '#333']};

    // Add section for clusters and competitors title

    svg.append('circle')
        .attr('cx', 20)
        .attr('cy', y)
        .attr('r', 18)
        .attr('fill', layer.style.markerMulti.style[1]);


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
}

function clusterGraduated(layer) {

    let width = layer.drawer.clientWidth;

    let svg = d3
        .select(layer.legend)
        .append('svg')
        .attr('width', width),
        y = 10;

    layer.style.theme.cat.forEach(cat => {

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
            .attr('xlink:href', svg_symbols.create(cat.marker) || '');
        
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
}