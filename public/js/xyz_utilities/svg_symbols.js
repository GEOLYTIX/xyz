const d3 = require('d3');
const xmlSerializer = new XMLSerializer();

module.exports = (function () {

    function dot(color) {
        let svg = d3
            .select(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))
            .attr('width', 866)
            .attr('height', 1000)
            .attr('viewBox', '0 0 866 1000')
            .attr('xmlns', 'http://www.w3.org/2000/svg');

        svg
            .append('circle')
            .attr('cx', 466)
            .attr('cy', 532)
            .attr('r', 395)
            .style('fill', d3.rgb(color).darker(0.5));

        svg
            .append('circle')
            .attr('cx', 400)
            .attr('cy', 468)
            .attr('r', 395)
            .style('fill', d3.rgb(color));

        return ('data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg.node())));
    }

    function circle(color) {
        let svg = d3
            .select(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))
            .attr('width', 1000)
            .attr('height', 1000)
            .attr('viewBox', '0 0 1000 1000')
            .attr('xmlns', 'http://www.w3.org/2000/svg');

        svg
            .append('circle')
            .attr('cx', 500)
            .attr('cy', 500)
            .attr('r', 350)
            .style('stroke', color)
            .style('stroke-width', 250)
            .style('opacity', 0.5)
            .style('fill', 'none');

        return ('data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg.node())));
    }

    function target(style) {

        let svg = d3
            .select(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))
            .attr('width', 1000)
            .attr('height', 1000)
            .attr('viewBox', '0 0 1000 1000')
            .attr('xmlns', 'http://www.w3.org/2000/svg');

        svg
            .append('circle')
            .attr('cx', 540)
            .attr('cy', 540)
            .attr('r', style[0])
            .style('fill', '#333')
            .style('opacity', 0.4);

        for (let i = 0; i < style.length - 1; i+=2) {
            svg
                .append('circle')
                .attr('cx', 500)
                .attr('cy', 500)
                .attr('r', style[i])
                .style('fill', style[i + 1]);
        }

        return ('data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg.node())));
    }

    function markerLetter(colorMarker, letter) {
        let svg = d3
            .select(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))
            .attr('width', 1000)
            .attr('height', 1000)
            .attr('viewBox', '0 0 1000 1000')
            .attr('xmlns', 'http://www.w3.org/2000/svg');

        let p = d3.path();
        p.moveTo(570, 20);
        p.bezierCurveTo(370, 20, 210, 180, 210, 380);
        p.bezierCurveTo(210, 460, 230, 520, 280, 610);
        p.bezierCurveTo(380, 780, 570, 1000, 570, 1000);
        p.bezierCurveTo(570, 1000, 760, 780, 860, 610);
        p.bezierCurveTo(910, 520, 930, 460, 930, 380);
        p.bezierCurveTo(930, 180, 770, 20, 570, 20);
        p.closePath();

        svg
            .append('path')
            .style('fill', colorMarker)
            .style('opacity', 0.5)
            .attr('d', p.toString());

        p = d3.path();
        p.moveTo(500, 20);
        p.bezierCurveTo(300, 20, 140, 180, 140, 380);
        p.bezierCurveTo(140, 440, 160, 520, 210, 610);
        p.bezierCurveTo(310, 780, 500, 1000, 500, 1000);
        p.bezierCurveTo(500, 1000, 690, 780, 790, 610);
        p.bezierCurveTo(840, 520, 860, 460, 860, 380);
        p.bezierCurveTo(860, 180, 700, 20, 500, 20);
        p.closePath();

        svg
            .append('path')
            .style('fill', colorMarker)
            .attr('d', p.toString());

        svg
            .append('circle')
            .style('fill', '#fff')
            .style('opacity', 0.8)
            .attr('cx', 500)
            .attr('cy', 360)
            .attr('r', 250);

        let text = svg
            .append('text')
            .attr('x', 500)
            .attr('y', 360)
            .style('text-anchor', 'middle')
            .style('alignment-baseline', 'central')
            .style('font-weight', 600)
            .style('font-size', '470px')
            .style('font-family', 'sans-serif')
            .style('fill', '#555')
            .text(letter);

        return ('data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg.node())));
    }

    function markerColor(colorMarker, colorDot) {
        let svg = d3
            .select(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))
            .attr('width', 1000)
            .attr('height', 1000)
            .attr('viewBox', '0 0 1000 1000')
            .attr('xmlns', 'http://www.w3.org/2000/svg');

        let p = d3.path();
        p.moveTo(570, 20);
        p.bezierCurveTo(370, 20, 210, 180, 210, 380);
        p.bezierCurveTo(210, 460, 230, 520, 280, 610);
        p.bezierCurveTo(380, 780, 570, 1000, 570, 1000);
        p.bezierCurveTo(570, 1000, 760, 780, 860, 610);
        p.bezierCurveTo(910, 520, 930, 460, 930, 380);
        p.bezierCurveTo(930, 180, 770, 20, 570, 20);
        p.closePath();

        svg
            .append('path')
            .style('fill', colorMarker)
            .style('opacity', 0.5)
            .attr('d', p.toString());

        p = d3.path();
        p.moveTo(500, 20);
        p.bezierCurveTo(300, 20, 140, 180, 140, 380);
        p.bezierCurveTo(140, 440, 160, 520, 210, 610);
        p.bezierCurveTo(310, 780, 500, 1000, 500, 1000);
        p.bezierCurveTo(500, 1000, 690, 780, 790, 610);
        p.bezierCurveTo(840, 520, 860, 460, 860, 380);
        p.bezierCurveTo(860, 180, 700, 20, 500, 20);
        p.closePath();

        svg
            .append('path')
            .style('fill', colorMarker)
            .attr('d', p.toString());

        svg
            .append('circle')
            .style('fill', '#fff')
            .style('opacity', 0.8)
            .attr('cx', 500)
            .attr('cy', 360)
            .attr('r', 250);

        svg
            .append('circle')
            .style('fill', colorDot)
            .attr('cx', 500)
            .attr('cy', 360)
            .attr('r', 180);

        return ('data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg.node())));
    }
    
    function markerGeolocation(){
        let svg = d3
            .select(document.createElementNS('http://www.w3.org/2000/svg', 'svg'))
            .attr('width', 1000)
            .attr('height', 1000)
            .attr('viewBox', '0 0 1000 1000')
            .attr('xmlns', 'http://www.w3.org/2000/svg');
        
        svg
            .append('circle')
            .attr('cx', 500)
            .attr('cy', 500)
            .attr('r', 350)
            .style('stroke', '#090')
            .style('opacity', 0.8)
            .style('stroke-width', 75)
            .style('fill', 'none');
        
        svg
            .append('circle')
            .attr('cx', 500)
            .attr('cy', 500)
            .attr('r', 200)
            .style('fill', '#090')
            .style('opacity', 0.8);
        
        let p = d3.path();
        
        p.moveTo(500,150);
        p.lineTo(500,0);
        
        p.moveTo(500,850);
        p.lineTo(500,1000);
        
        p.moveTo(0,500);
        p.lineTo(150,500);
        
        p.moveTo(850,500);
        p.lineTo(1000,500);
        
        svg
            .append('path')
            .style('stroke', '#090')
            .style('opacity', 0.8)
            .style('stroke-width', 75)
            .attr('d', p.toString());
        
        return ('data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg.node())));
    }

    return {
        dot: dot,
        target: target,
        circle: circle,
        markerLetter: markerLetter,
        markerColor: markerColor,
        markerGeolocation: markerGeolocation
    };
})();