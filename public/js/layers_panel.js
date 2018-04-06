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

    if (layer.format === 'mvt' && layer.style && layer.style.categorized) panel.appendChild(mvtCategorized(layer));

    if (layer.format === 'cluster' && layer.style && layer.style.categorized) panel.appendChild(clusterCategorized(layer));

    if (layer.format === 'grid') panel.appendChild(gridControl(layer));

    return panel;
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
            .style('font-size', '12px')
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
        y = 10;

    // Create a legend title from the categorized.label property.
    if (layer.style.categorized.label) {
        svg.append('text')
            .attr('x', 0)
            .attr('y', y)
            .style('font-weight', 600)
            .style('font-size', '12px')
            .text(layer.style.categorized.label || 'Legend');
        y += 10;
    }

    layer.style.categorized.filter = [];
    layer.style.categorized.filterOther = false;

    Object.keys(layer.style.categorized.cat).map((item) => {

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
            .attr('xlink:href', layer.style.categorized.cat[item].marker);

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
                    layer.style.categorized.filter.splice(layer.style.categorized.filter.indexOf(item),1);
                } else {
                    this.style.opacity = 0.5;
                    layer.style.categorized.filter.push(item);
                }

                layer.getLayer();
            });

        y += 20;
    });

    // Attach box for other/default categories.
    if (layer.style.categorized.other) {
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
                    layer.style.categorized.filterOther = false;
                } else {
                    this.style.opacity = 0.5;
                    layer.style.categorized.filterOther = true;
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

    if (layer.style.categorized.competitors) {
        for (let i = 0; i < layer.style.categorized.competitors.length; i++) {
            svg.append('circle')
                .attr('cx', 20)
                .attr('cy', y)
                .attr('r', 20 - (i + 1) * 20 / (layer.style.categorized.competitors.length + 1))
                .style('fill', layer.style.categorized.competitors[i][1]);
        }

        // list competitors
        y += 15;
        for (let i = 0; i < layer.style.categorized.competitors.length; i++) {

            y += 20;

            svg.append('circle')
                .attr('cx', 20)
                .attr('cy', y)
                .attr('r', 8)
                .style('fill', layer.style.categorized.competitors[i][1]);

            svg.append('text')
                .attr('x', 45)
                .attr('y', y)
                .attr('alignment-baseline', 'central')
                .style('font-size', '12px')
                .text(layer.style.categorized.competitors[i][2]);
        }
    } else { y += 15 };
        
    // Set height of the svg element.
    svg.attr('height', y += 10);

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