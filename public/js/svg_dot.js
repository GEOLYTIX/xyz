const d3 = require('d3');

module.exports = (function () {

    function svg_dot(hex) {
        let color = d3.rgb(hex), darker = color.darker(0.5),
            svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
            dot = document.createElement("circle"), shade = document.createElement("circle");

        svg.setAttribute("width", 866);
        svg.setAttribute("height", 1000);
        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

        shade.setAttribute("cx", 466);
        shade.setAttribute("cy", 532);
        shade.setAttribute("r", 395);
        shade.style.fill = darker;

        dot.setAttribute("cx", 400);
        dot.setAttribute("cy", 468);
        dot.setAttribute("r", 395);
        dot.style.fill = color;

        svg.appendChild(shade)
        svg.appendChild(dot);

        return ("data:image/svg+xml," + encodeURIComponent(svg.outerHTML));       
    }

    return {
        svg_dot: svg_dot
    };
})();