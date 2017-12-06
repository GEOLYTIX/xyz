module.exports = function SVG_marker(colours) {
    let svg = '%3Csvg%20width%3D%27866%27%20height%3D%271000%27%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%3E%3Ccircle%20fill%3D%27'
        + colours[0] + '%27%20cx%3D%27466%27%20cy%3D%27532%27%20r%3D%27395%27/%3E%3Ccircle%20fill%3D%27'
        + colours[1] + '%27%20cx%3D%27400%27%20cy%3D%27468%27%20r%3D%27395%27/%3E%3C/svg%3E';

    return ("data:image/svg+xml," + svg).replace(/#/g,"%23");
};