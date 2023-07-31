export default function (e, mapview) {

    // Remove popup from mapview.
    mapview.popup(null)

    const features = [];

    // Find locations at pixel.
    mapview.Map.forEachFeatureAtPixel(e.pixel,
        (F, L) => {

            const feature = {
                F, L,
                layer: mapview.layers[L.get('key')],
                id: F.get('id') || F.getId()
            }

            features.push(feature)
        },
        {
            layerFilter: mapview.interaction.layerFilter,
            hitTolerance: mapview.interaction.hitTolerance,
        })

    // No features at pixel.
    if (!features.length) return;

    const content = mapp.utils.html.node`
      <div style="max-width: 66vw; max-height: 300px; overflow-x: hidden;">
        <ul>
        ${features.map(feature => mapp.utils.html.node`
          <li onclick=${e => {
            mapview.interaction.getFeature(feature)
            mapview.popup(null)
        }}
        }}>${feature.L.get('key')} [${feature.id}]`)}`;

    mapview.popup({
        content,
        autoPan: true,
    });
}