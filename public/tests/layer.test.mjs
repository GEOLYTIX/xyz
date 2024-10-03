export async function layerTest(mapview) {

    function delayFunction(delay) {
        return new Promise(resolve => {
            setTimeout(resolve, delay);
        });
    }

    await codi.describe(`${mapview.host} : Layer Test`, async () => {

        for (const key of Object.getOwnPropertyNames(mapview.layers)) {

            await codi.it(`Layer test : ${key}`, async () => {

                const layer = mapview.layers[key];

                layer.show();

                if (layer.tables) {
                    //This is to set the zoom level so that the correct zoom level is used for the layer.
                    const layerZoom = parseInt(Object.entries(layer.tables).find(([key, value]) => value !== null)[0]);
                    mapview.Map.getView().setZoom(layerZoom);
                }

                if (layer.dataviews) {

                    for (let dataview in layer.dataview) {
                        dataview.show();
                    }
                }

                // Turn on every theme on the layer to test if they work
                if (layer.style?.themes) {

                    for (const theme in layer.style.themes) {
                        console.log(`Testing theme ${theme}`);
                        layer.style.theme = layer.style.themes[theme];
                        layer.reload();
                        //This is to allow errors being logged into the console.
                        //There is no test being asserted on.
                        await delayFunction(1000);
                    }
                }

                //Location test
                if (layer.infoj) {

                    const lastLocation = await mapp.utils.xhr(`${mapp.host}/api/query?template=get_last_location&locale=${encodeURIComponent(mapview.locale.key)}&layer=${key}`);

                    if (lastLocation?.id) {

                        layer.infoj = layer.infoj.map(entry => {
                            if (entry.type === 'dataview') {
                                return { ...entry, display: true };
                            }
                            return entry;
                        });

                        const location = await mapp.location.get({
                            layer: layer,
                            id: lastLocation.id,
                        });

                        codi.assertTrue(location !== undefined, 'The location is undefined');

                        // Create a new location
                        const newLocation = {
                            layer,
                            table: layer.tableCurrent(),
                            new: true
                        };

                        // Add a new location to the layer using the last location
                        if (Object.keys(layer.draw).length > 0) {

                            await codi.it('Add a new location to the layer using the last location coordinates', async () => {

                                //Creating the new point
                                //We don't need a geometry for this. We just need a returned ID.
                                newLocation.id = await mapp.utils.xhr({
                                    method: 'POST',
                                    url: `${mapp.host}/api/query?` +
                                        mapp.utils.paramString({
                                            template: 'location_new',
                                            locale: layer.mapview.locale.key,
                                            layer: layer.key,
                                            table: newLocation.table
                                        })
                                });

                                // Get the newly created location.
                                const newLoc = await mapp.location.get(newLocation);

                                // Remove the location
                                newLoc.remove();
                            });

                            await codi.it('Delete the location', async () => {

                                // Test deleting a location
                                await mapp.utils.xhr(`${mapp.host}/api/query?` +
                                    mapp.utils.paramString({
                                        template: 'location_delete',
                                        locale: mapview.locale.key,
                                        layer: newLocation.layer.key,
                                        table: newLocation.table,
                                        id: newLocation.id
                                    }));
                            });
                        }

                        location.remove();

                        layer.hide();
                    }
                }
            });
        }
    });
}