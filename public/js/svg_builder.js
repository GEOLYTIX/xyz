module.exports = function SVG_builder(dots) {

    let svg = '%3Csvg%20width%3D%221000%22%20height%3D%221000%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%0A%3Ccircle%20fill%3D%22rgba%280%2C%200%2C%200%2C%200.1%29%22%20cx%3D%22550%22%20cy%3D%22550%22%20r%3D%22'
        + dots[0][1] + '%22/%3E';
    for (let i = 0; i < dots.length; i++) {
        svg += '%3Ccircle%20fill%3D%22'
            + dots[i][1]
            + '%22%20cx%3D%22500%22%20cy%3D%22500%22%20r%3D%22'
            + dots[i][0]
            + '%22/%3E'
    }
    svg += '%3C/svg%3E';

    return ("data:image/svg+xml," + svg).replace(/#/g,"%23");

};