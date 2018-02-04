const utils = require('./utils');
const d3 = require('d3');

module.exports = (function () {

    function createGridLegend(grid, dom) {

        dom.legend.innerHTML = null;

        let
            yTrack = 0,
            width = dom.pages[1].clientWidth,
            padding = 40,
            _width = width - (2 * padding),
            n = grid.colorScale.length,
            
            svg = d3
            .select(dom.legend)
            .append('svg')
            .attr('width', width),
            
            text = svg
            .append('text')
            .attr('x', 0)
            .attr('y', yTrack)
            .style('font-weight', 600)
            .style('font-size', 15)
            .style('font-family', 'ffmark, sans-serif')
            .text(dom.selSize.selectedOptions[0].innerText)
            .call(wrap, 290);

        yTrack += parseInt(text.node().getBoundingClientRect().height) + 45;

        for (let i = 0; i < n; i++) {

            let
                r = (i + 2) * 10 / n,
                x = padding + (i * _width / (n - 1));

            svg
                .append('circle')
                .attr('cx', x + 1)
                .attr('cy', yTrack + 1)
                .attr('r', r)
                .style('fill', '#333');

            svg
                .append('circle')
                .attr('cx', x)
                .attr('cy', yTrack)
                .attr('r', r)
                .style('fill', '#999');

            if (i === 0 || i === (n / 2 % 1 != 0 && Math.round(n / 2) - 1) || i === n - 1) {
                svg.append('text')
                    .attr('x', x)
                    .attr('y', yTrack - 20)
                    .style('font-size', 13)
                    .attr('text-anchor', 'middle')
                    .style('font-family', '"PT Mono", monospace')
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
                .style('font-size', 13)
                .style('font-family', '"PT Mono", monospace')
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
            .style('font-weight', 600)
            .style('font-size', 15)
            .style('font-family', 'ffmark, sans-serif')
            .text(dom.selColor.selectedOptions[0].innerText)
            .call(wrap, 290);

        svg.attr('height', yTrack + parseInt(text.node().getBoundingClientRect().height) + 3);

        dom.legend.style.opacity = 1;
    }

    function createClusterLegend(layer) {

        layer.legend = utils.createElement('div', {
            className: 'legend'
        });
        layer.drawer.appendChild(layer.legend);

        let keys = Object.keys(layer.markerStyle),
            x,
            y = -10,
            svg = d3.select(layer.legend)
                .append('svg')
                .attr('width', 290);

        // legend content
        for (let i = 0; i < keys.length; i++) {

            y = i % 2 ? y : y += 25;
            x = i % 2 ? 155 : 15;

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

        addLegendToDrawer(layer);

    }

    function addLegendToDrawer(layer){
        let i = utils.createElement('i', {
            textContent: 'expand_less',
            className: 'material-icons cursor noselect btn',
            title: 'Expand table'
        });
        i.addEventListener('click', function () {
            let container = this.parentNode.parentNode;
            let header = this.parentNode;
            if (container.style.maxHeight != '30px') {
                container.style.maxHeight = '30px';
                header.style.boxShadow = '0 3px 3px -3px black';
                this.textContent = 'expand_more';
                i.title = "Hide layer info";
            } else {
                container.style.maxHeight = (header.nextSibling.clientHeight + this.clientHeight + 5) + 'px';
                header.style.boxShadow = '';
                this.textContent = 'expand_less';
                i.title = "Show layer info";
            }
        });
        layer.drawer.firstChild.appendChild(i);
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
        createGridLegend: createGridLegend,
        createClusterLegend: createClusterLegend
    };
})();