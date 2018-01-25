const d3 = require('d3');

module.exports = (function () {

    function createGridLegend(grid) {
        let
            yTrack = 0,
            width = grid.dom.pages_[1].clientWidth,
            padding = 40,
            _width = width - (2 * padding),
            n = grid.colorScale.length;

        let svg = d3
            .select('#grid_module .legend')
            .append('svg')
            .attr('width', width);

        let text = svg
            .append('text')
            .attr('x', 0)
            .attr('y', yTrack)
            .style('font-weight', 500)
            .style('font-size', 14)
            .style('font-family', 'sans-serif')
            .text('Tertiary education with a Bachelor degree or equivalent (IESCD 6)')
            .call(wrap, 290);

        let height = parseInt(text.node().getBoundingClientRect().height);

        yTrack += height + 40;

        for (let i = 0; i < n; i++) {

            let
                r = (i + 2) * 10 / n,
                x = padding + (i * _width / (n - 1));

            svg
                .append('circle')
                .attr('cx', x)
                .attr('cy', yTrack)
                .attr('r', r)
                .style('fill', 'grey');

            if (i === 0 || i === (n / 2 % 1 != 0 && Math.round(n / 2) - 1) || i === n - 1) {
                svg.append('text')
                    .attr('x', x)
                    .attr('y', yTrack - 20)
                    .style('font-size', 14)
                    .attr('text-anchor', 'middle')
                    .style('font-family', 'monospace')
                    .text(grid.arraySize[i].toLocaleString('en-GB', {
                        maximumFractionDigits: 0
                    }));
            }
        }

        yTrack += 15;

        for (let i = 0; i < n; i++) {

            let
                w = _width / (n - 1),
                x = padding + i * w;

            svg
                .append('rect')
                .attr('x', x - w / 2)
                .attr('y', yTrack)
                .attr('width', w)
                .attr('height', 20)
                .style('fill', grid.colorScale[i]);

            if (i === 0 || i === (n / 2 % 1 != 0 && Math.round(n / 2) - 1) || i === n - 1) svg
                .append('text')
                .attr('x', x)
                .attr('y', yTrack + 30)
                .attr('text-anchor', 'middle')
                .style('font-size', 14)
                .style('font-family', 'monospace')
                .attr('alignment-baseline', 'hanging')
                .text(grid.arrayColor[i].toLocaleString('en-GB', {
                    maximumFractionDigits: 0
                }));
        }

        yTrack += 50;

        text = svg
            .append('text')
            .attr('x', 0)
            .attr('y', yTrack)
            .style('font-weight', 500)
            .style('font-size', 14)
            .style('font-family', 'sans-serif')
            .text('AB Higher and intermediate managerial')
            .call(wrap, 290);

        height = parseInt(text.node().getBoundingClientRect().height);

        svg.attr('height', yTrack + height + 3);



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
        createGridLegend: createGridLegend
    };
})();