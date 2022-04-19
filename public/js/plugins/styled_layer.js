export default (function(){

  mapp.ui.locations.entries.styledLayer = entry => {

    styledLayer(entry)
  }

  async function styledLayer(entry) {

    const mapview = entry.location.layer.mapview

    // Get pin geometry for query.
    const pin = entry.location.infoj.find(e=>e.type === 'pin' && e)

    // Send query to get id and distance of nearest 10 locations.
    const response = await mapp.utils.xhr(`${mapview.host}/api/query/${entry.query}?lon=${pin.value[0]}&lat=${pin.value[1]}`)
    //"template": "select id, st_distance(st_pointonsurface(geom_4326), st_setsrid(st_point(%{lon},%{lat}), 4326)) distance from geodata.uk_glx_geodata_seamless_shopper_town order by st_distance(st_pointonsurface(geom_4326), st_setsrid(st_point(%{lon},%{lat}), 4326)) limit 10;"
    
    if (!entry.location.remove) return;

    const ZoomGeom = mapview.layers.ZoomGeom

    const layer = {
      style: Object.assign({}, ZoomGeom.style),
      featureLookup: response
    }

    layer.style.theme = {
      type: "graduated",
      field: "distance",
      cat_arr: [
        {
          value: "0",
          fillColor: "#15773f",
        },
        {
          value: "0.1",
          fillColor: "#66bd63",
        },
        {
          value: "0.2",
          fillColor: "#a6d96a",
        },
        {
          value: "0.3",
          fillColor: "#d9ef8b",
        },
        {
          value: "0.4",
          fillColor: "#fdae61",
        },
        {
          value: "0.5",
          fillColor: "#f46d43",
        },
      ],
    };
    
    const L = new ol.layer.VectorTile({
      source: ZoomGeom.L.getSource(),
      renderBuffer: 200,
      style: mapp.layer.style(layer)
    });

    entry.location.Layers.push(L)

    mapview.Map.addLayer(L)

  }
  
})()