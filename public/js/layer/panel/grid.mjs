import _xyz from '../../_xyz.mjs';

import d3_selection from "d3-selection";

export default (layer, panel) => {

    let width = layer.drawer.clientWidth,
        legend = _xyz.utils.createElement({
            tag: 'div',
            options: {
                className: 'section report-block'
            },
            appendTo: panel
        });

    // Select dropdown for size.
    let selSize = _xyz.utils.createElement({
        tag: 'select',
        options: {
            className: 'selSize ctrl',
            name: 'selSize'
        }
    });

    setDropDown(selSize, 'grid_size');

    legend.appendChild(selSize);

    // Create a D3 svg for the legend and nest between size and color drop down.
    let svg = d3_selection.select(legend).append('svg').attr('width', width);

    // Select dropdown for color.
    let selColor = _xyz.utils.createElement({
        tag: 'select',
        options: {
            className: 'selColor ctrl',
            name: 'selColor'
        }
    });

    setDropDown(selColor, 'grid_color');

    legend.appendChild(selColor);

    // Grid ration checkbox element.
    let gridRatio = _xyz.utils.checkbox(function (e) {

        // Checkbox event to toggle grid_ratio.
        layer.chkGridRatio = e.target.checked;
        layer.grid_ratio = layer.chkGridRatio;

        if (layer.grid_ratio) {
            _xyz.utils.setHook('grid_ratio', true);

        } else {
            _xyz.utils.removeHook('grid_ratio');
        }

        layer.getLayer(layer);

    }, {
            label: 'Display colour values as a ratio to the size value.',
            id: 'chkGridRatio',
            className: 'ctrl',
            checked: layer.grid_ratio || _xyz.hooks.grid_ratio
        });

    // Set checked from either hook.grid_ratio or layer.grid_ratio.
    layer.chkGridRatio = layer.grid_ratio || _xyz.hooks.grid_ratio;
    layer.grid_ratio = layer.chkGridRatio;

    if (layer.chkGridRatio) _xyz.utils.setHook('grid_ratio', true);

    legend.appendChild(gridRatio);

    // Set dropdown values and events.
    function setDropDown(select, query) {

        // Populate select options
        layer.queryFields.map(function (queryField) {
            _xyz.utils.createElement({
                tag: 'option',
                options: {
                    value: queryField[0],
                    textContent: queryField[1]
                },
                appendTo: select
            });
        });

        // Set the select from either hook[query] or layer[query].
        select.selectedIndex = _xyz.hooks[query] || layer[query] ? _xyz.utils.getSelectOptionsIndex(select.options, _xyz.hooks[query] || layer[query]) : 0;
        layer[query] = select.value;
        _xyz.utils.setHook(query, select.value);

        // onchange event to set the hook and title.
        select.onchange = function () {
            _xyz.utils.setHook(query, event.target.value);
            layer[query] = event.target.value;
            layer.getLayer(layer);
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
    let yTrack = 35,
        padding = 0,
        _width = width - (2 * padding),
        n = layer.style.range.length;

    for (let i = 0; i < n; i++) {

        let r = (i + 2) * 10 / n,
            w = _width / n,
            x = padding + (i * w);

        svg.append('circle')
            .attr('cx', x + w / 2 + 1)
            .attr('cy', yTrack + 1)
            .attr('r', r)
            .style('fill', '#333');

        svg.append('circle')
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

        let w = _width / n,
            x = padding + i * w;

        svg.append('rect')
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
}