export function datasets(term, gazetteer) {

    gazetteer.datasets.forEach(dataset => {

        let layer = gazetteer.mapview.layers[dataset.layer]

        // Abort current dataset query. Onload will not be called.
        dataset.xhr?.abort()

        dataset.xhr = new XMLHttpRequest()

        dataset.xhr.open('GET', gazetteer.mapview.host + '/api/query/gaz_query?' +
            mapp.utils.paramString({
                label: dataset.qterm,
                qterm: dataset.qterm,
                qID: layer.qID,
                locale: gazetteer.mapview.locale.key,
                layer: dataset.layer,
                table: dataset.table || layer.table,
                wildcard: '*',
                term: `${dataset.leading_wildcard ? '*' : ''}${term}*`,
                limit: dataset.limit || 10
            }))

        dataset.xhr.setRequestHeader('Content-Type', 'application/json')
        dataset.xhr.responseType = 'json'
        dataset.xhr.onload = e => {

            console.log(e.target.response)

            if (e.target.status !== 200) return;
            
            // No results
            if (e.target.response.length === 0) {

            return gazetteer.list.append(mapp.utils.html.node`
                <li>${mapp.dictionary.no_results}`)
            }

            e.target.response.forEach(row => {

                gazetteer.list.append(mapp.utils.html.node`
                    <li
                        onclick=${e => {

                            if (gazetteer.callback) return gazetteer.callback(row, gazetteer);

                            mapp.location.get({
                                layer: gazetteer.mapview.layers[dataset.layer],
                                table: layer.table,
                                id: row.id
                            }).then(loc => loc && loc.flyTo(dataset.maxZoom))

                        }}>
                        <span class="label">${layer.name}</span>
                        <span>${row.label}</span>`)
            })

        }

        dataset.xhr.send()

    })

}

export function getLocation(location, gazetteer) {

    if (typeof gazetteer.callback === 'function') {
        gazetteer.callback(location)
        return;
    }

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