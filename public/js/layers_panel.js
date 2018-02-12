const utils = require('./utils');
const d3 = require('d3');

module.exports = (function () {

    function grid(layer) {

        // Select dropdown for size.
        let selSize = utils.createElement('select', {
            className: 'selSize',
            name: 'selSize'
        });
        setDropDown(selSize, 'grid_size');
        layer.panel.appendChild(selSize);

        // Legend element.
        layer.legend = utils.createElement('div', {
            className: 'legend'
        });
        layer.panel.appendChild(layer.legend);

        // Select dropdown for color.
        let selColor = utils.createElement('select', {
            className: 'selColor',
            name: 'selColor'
        });
        setDropDown(selColor, 'grid_color');
        layer.panel.appendChild(selColor);

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
            if (layer.grid_ratio){
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
        layer.panel.appendChild(checkbox);

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
            select.selectedIndex = _xyz.hooks[query] || layer[query]? utils.getSelectOptionsIndex(select.options, _xyz.hooks[query] || layer[query]) : 0;
            layer[query] = select.value;
            _xyz.setHook(query, select.value);

            // onchange event to set the hook and title.
            select.onchange = function () {
                _xyz.setHook(query, event.target.value);
                layer[query] = event.target.value;
                layer.getLayer();
            };
        }

        // Create SVG grid legend
        let
            yTrack = 30,
            width = layer.panel.clientWidth,
            padding = 0,
            _width = width - (2 * padding),
            n = layer.styleRange.length,
            svg = d3
                .select(layer.legend)
                .append('svg')
                .attr('width', width);

        for (let i = 0; i < n; i++) {

            let
                r = (i + 2) * 10 / n,
                w = _width / n,
                x = padding + (i * w);

            svg
                .append('circle')
                .attr('cx', x + w/2 + 1)
                .attr('cy', yTrack + 1)
                .attr('r', r)
                .style('fill', '#333');

            svg
                .append('circle')
                .attr('cx', x + w/2)
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
                .style('fill', layer.styleRange[i]);

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

        yTrack += 50;

        svg.attr('height', yTrack);

    }

    function cluster(layer) {

        layer.legend = utils.createElement('div', {
            className: 'legend'
        });
        layer.panel.appendChild(layer.legend);

        let keys = Object.keys(layer.markerStyle),
            x,
            y = -10,
            w = layer.panel.clientWidth,
            svg = d3.select(layer.legend)
                .append('svg')
                .attr('width', 290);

        // legend content
        for (let i = 0; i < keys.length; i++) {

            y = i % 2 ? y : y += 25;
            x = i % 2 ? w/2 + 15 : 15;

            let target = layer.markerStyle[keys[i]].style;

            for (let ii = 0; ii < target.length; ii++) {
                svg.append('circle')
                    .attr('cx', x)
                    .attr('cy', y)
                    .attr('r', target[ii][0] * 10 / 400)
                    .style('fill', target[ii][1]);
            }

            svg.append('text')
                .attr('x', x + 15)
                .attr('y', y + 1)
                .attr('alignment-baseline', 'middle')
                .style('font-size', '12px')
                .text(layer.markerStyle[keys[i]].label);
        }

        y += 50;

        // Add section for clusters and competitors title
        for (let i = 0; i < layer.competitors.length; i++) {
            svg.append('circle')
                .attr('cx', 25)
                .attr('cy', y)
                .attr('r', 20 - 6 * i)
                .style('fill', layer.arrayCompColours[i]);
        }
        svg.append('text')
            .attr('x', 50)
            .attr('y', y)
            .attr('text-anchor', 'start')
            .attr('alignment-baseline', 'middle')
            .style('font-size', '14px')
            .style('font-weight', '800')
            .text('Multiple locations');

        y += 10;

        // list competitors
        for (let i = 0; i < layer.competitors.length; i++) {

            y += 25;

            let key = layer.competitors[i];

            svg.append('circle')
                .attr('cx', 35)
                .attr('cy', y)
                .attr('r', 7)
                .style('fill', layer.arrayCompColours[i]);

            svg.append('text')
                .attr('x', 50)
                .attr('y', y + 1)
                .attr('alignment-baseline', 'middle')
                .style('font-size', '12px')
                .text(layer.markerStyle[key].label);
        }

        svg.attr('height', y += 15);
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

    return {
        grid: grid,
        cluster: cluster
    };
})();