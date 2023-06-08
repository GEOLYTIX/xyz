export function glx(record) {

    gazetteer.getLocation({
        layer: gazetteer.mapview.layers[record.layer],
        table: record.table,
        id: record.id
    }, loc => mapp.location.get(loc).then(loc => loc && loc.flyTo()))
}

export function getLocation(location, gazetteer) {

    // if (typeof callback === 'function') {
    //     callback(location)
    //     return;
    // }

    Object.assign(location, {
        layer: {
            mapview: gazetteer.mapview
        },
        Layers: [],
        hook: location.label
    })

    const infoj = [
        {
            title: location.label,
            value: location.source,
            inline: true
        },
        {
            type: 'pin',
            value: [location.lng, location.lat],
            srid: '4326',
            class: 'display-none',
            location
        }
    ]

    gazetteer.streetview && infoj.push({
        type: 'streetview',
        location
    })

    mapp.location.decorate(Object.assign(location, { infoj }))

    gazetteer.mapview.locations[location.hook] = location

    if (gazetteer.zoom) {
        let view = gazetteer.mapview.Map.getView()
        view.setZoom(gazetteer.zoom)
        view.setCenter(ol.proj.fromLonLat([location.lng, location.lat]))

    } else {
        location.flyTo()
    }

}