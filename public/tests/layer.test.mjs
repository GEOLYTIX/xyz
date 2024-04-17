import { describe, it, assertEqual, assertNotEqual, assertTrue, assertFalse, assertThrows } from 'https://esm.sh/codi-test-framework@0.0.26';

export async function layerTest(mapview) {

    function delayFunction(delay) {
        return new Promise(resolve => {
          setTimeout(resolve, delay);
        });
      }

    const default_zoom = mapview.view.z;

    await describe(`${mapview.host} : Layer Test`, async () => {
        for (const key in mapview.layers) {
            if (mapview.layers.hasOwnProperty(key)) {
                await it(`Layer test : ${key}`, async () => {
                    const layer = mapview.layers[key];

                    if (layer.tables) {
                        const layerZoom = parseInt(Object.entries(layer.tables).find(([key, value]) => value !== null)[0]);
                        mapview.Map.getView().setZoom(layerZoom);
                        //console.log(mapview.Map.getView().getZoom());
                    }
                    else {
                        mapview.Map.getView().setZoom(default_zoom);
                        //console.log(mapview.Map.getView().getZoom());
                    }

                    if(layer.dataviews){
                        for(const dataview in layer.dataview){
                            dataview = { ...dataview, display: true}
                        }
                    }

                    layer.show();

                    if (!['maplibre', 'tiles'].includes(layer.format) && layer.infoj) {

                        const lastLocation = await mapp.utils.xhr(`${mapp.host}/api/query?template=get_last_location&locale=${encodeURIComponent(mapview.locale.key)}&layer=${key}`);

                        if (lastLocation?.id) {

                            layer.infoj = layer.infoj.map(entry => {
                                if(entry.type === 'dataview'){
                                    return { ...entry, display: true}
                                }
                                return entry;
                            });

                            const location = await mapp.location.get({
                                layer: layer,
                                id: lastLocation.id,
                            });

                            assertTrue(location !== undefined, 'The location is undefined');
                            //await delayFunction(3000);
                            location.remove();
                        }
                    }

                    if (!['maplibre', 'tiles'].includes(layer.format)) {
                        layer.hide();
                    }
                });
            }
        }
    });
}