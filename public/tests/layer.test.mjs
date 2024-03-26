import { describe, it, assertEqual, assertNotEqual, assertTrue, assertFalse, assertThrows } from 'https://esm.sh/codi-test-framework@0.0.12';

export async function layerTest(mapview) {

     describe(`${mapview.host} : Layer Test`, () => {
        for (const key in mapview.layers) {
            if (mapview.layers.hasOwnProperty(key)) {
                it(`Layer test : ${key}`, async () => {
                    const layer = mapview.layers[key];

                    layer.show();

                    if (!['maplibre', 'tiles'].includes(layer.format) && layer.infoj) {

                        const lastLocation = await mapp.utils.xhr(`${mapp.host}/api/query?template=get_last_location&locale=${encodeURIComponent(mapview.locale.key)}&layer=${key}`);

                        assertTrue(lastLocation.id !== undefined, 'Last Location is undefined');

                        if (lastLocation.id) {
                            const location = await mapp.location.get({
                                layer: layer,
                                id: lastLocation.id,
                            });

                            location.remove();
                        }
                    }

                    layer.hide();
                });
            }
        }
    });
}