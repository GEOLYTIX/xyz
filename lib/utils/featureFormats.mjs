function initializeFieldStats(layer) {
    if (layer.style?.theme?.field_stats) {
        layer.style.theme.updated = true;
        layer.style.theme.field_stats[layer.style.theme.field] = {
            values: []
        };
    }
}

export function geojson(layer, features) {

    const formatGeojson = new ol.format.GeoJSON

    initializeFieldStats(layer);

    return features.map((feature) => {

        const properties = feature.properties

        if (layer.style?.theme?.field_stats) {

            layer.style.theme.field_stats[layer.style.theme.field].values.push(parseFloat(properties[layer.style.theme.field]));
        }

        return new ol.Feature({
            id: feature.id,
            geometry: formatGeojson.readGeometry(feature.geometry, {
                dataProjection: 'EPSG:' + layer.srid,
                featureProjection: 'EPSG:' + layer.mapview.srid,
            }),
            properties
        })

    })
}

export function wkt(layer, features) {

    const formatWKT = new ol.format.WKT

    initializeFieldStats(layer);

    return features.map((feature) => {

        const properties = {}

        // Assign field key and value to properties object
        layer.params.fields?.forEach((field, i) => {

            if (layer.style?.theme?.field_stats?.[field]) {

                layer.style?.theme?.field_stats?.[field].values.push(parseFloat(feature[i + 2]));
            }

            properties[field] = feature[i + 2]
        })

        // Return feature from geometry with properties.
        return new ol.Feature({
            id: feature.shift(),
            geometry: formatWKT.readGeometry(feature.shift(), {
                dataProjection: 'EPSG:' + layer.srid,
                featureProjection: 'EPSG:' + layer.mapview.srid,
            }),
            properties
        })

    })

}

export function cluster(layer, features) {

    //initializeFieldStats(layer);

    layer.max_size = 1

    return features.map((vals, i) => {

        const geometry = new ol.geom.Point(vals.shift())

        const count = vals.shift()

        layer.max_size = layer.max_size > count ? layer.max_size: count;

        const id = vals.shift()

        const properties = {count}
        
        layer.params.fields.forEach((field, i) => {
            properties[field] = vals[i]
        })

        return new ol.Feature({
            id,
            geometry,
            ...properties
        })

    })

}
