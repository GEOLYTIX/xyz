export async function locationCount(layer){

    const options = {layer: layer, queryparams: {}}
    options.viewport = layer.queryparams?.viewport
    
    const params = mapp.utils.queryParams(options)

    const paramString = mapp.utils.paramString({
        ...params,
        template: 'location_count',
        table: layer.tableCurrent(),
        filter: layer.filter?.current,
        layer: layer.key,
    })

    const feature_count = await mapp.utils.xhr(`${layer.mapview.host}/api/query?${paramString}`) 

    return feature_count
}