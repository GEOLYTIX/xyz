export default (layer) => {

    return {
        vertex: { // drawn feature vertex
            pane: layer.pane[0],
            stroke: true,
            color: "darkgrey",
            fillColor: "steelblue",
            weight: 1,
            radius: 5
        },
        trail: { // trail left behind cursor
            pane: layer.pane[0],
            stroke: true,
            color: '#666',
            dashArray: "5 5",
            weight: 1
        },
        path: { // actual drawn feature
            pane: layer.pane[0],
            stroke: true,
            color: '#666',
            dashArray: "5 5",
            fill: true,
            fillColor: "#cf9",
            weight: 1
        }
    }
}