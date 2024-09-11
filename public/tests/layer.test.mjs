export async function layerTest(mapview) {

    function delayFunction(delay) {
        return new Promise(resolve => {
            setTimeout(resolve, delay);
        });
    }

    const default_zoom = mapview.view?.z || 0;

    await codi.describe(`${mapview.host} : Template Paths Test`, async () => {

        await codi.it('All the templates are valid', async () => {
            // Call the /test workspace method - which should return an empty array if all templates are valid.
            const test = await mapp.utils.xhr(`${mapp.host}/api/workspace/test`);

               // If the test fails, print out the invalid templates.
               if (test.length > 0) {
                test.forEach(template => {
                    console.error('INVALID PATH:', template);
                });
            }

            codi.assertTrue(test.length === 0, `There are ${test.length} invalid paths for templates`);

        });
    });

    await codi.describe(`${mapview.host} : Layer Test`, async () => {

        for (const key in mapview.layers) {
            if (mapview.layers.hasOwnProperty(key)) {
                await codi.it(`Layer test : ${key}`, async () => {
                    const layer = mapview.layers[key];

                    if (layer.tables) {
                        const layerZoom = parseInt(Object.entries(layer.tables).find(([key, value]) => value !== null)[0]);
                        mapview.Map.getView().setZoom(layerZoom);
                    }
                    else {
                        if (default_zoom !== 0) {
                            mapview.Map.getView().setZoom(default_zoom);
                        }
                    }

                    if (layer.dataviews) {
                        for (let dataview in layer.dataview) {
                            dataview = { ...dataview, display: true }
                        }
                    }

                    layer.show();

                    // Turn on every theme on the layer to test if they work
                    if (layer.style?.themes) {
                        for (const theme in layer.style.themes) {
                            console.log(`Testing theme ${theme}`);
                            layer.style.theme = layer.style.themes[theme];
                            layer.reload();
                            await delayFunction(1000);
                        }
                    }

                    if (!['maplibre', 'tiles'].includes(layer.format) && layer.infoj) {

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
                            if (layer?.draw) {
                                await codi.it('Add a new location to the layer using the last location coordinates', async () => {
                                    // Use the value of the infoj pin field to create a new location
                                    const pin = location.infoj.find(entry => entry.type === 'pin');

                                    // Get the geometry of the last location (for polygon layers)
                                    const polygon = location.infoj.find(entry => entry.type === 'geometry' && entry.field === layer.geomCurrent());

                                    // Set the pin or polygon based on the draw object
                                    let geometry;

                                    if (layer?.draw?.point) {
                                        geometry = pin.geometry;
                                    } else if (layer?.draw?.polygon || layer?.draw?.line || layer?.draw?.rectangle || layer?.draw?.circle) {
                                        geometry = polygon.geometry;
                                    } else {
                                        // We don't want to test this layer as it doesn't have a core draw object method
                                        // If may have plugin draw methods but we can't test those
                                        return;
                                    }

                                    newLocation.id = await mapp.utils.xhr({
                                        method: 'POST',
                                        url: `${mapp.host}/api/query?` +
                                            mapp.utils.paramString({
                                                template: 'location_new',
                                                locale: layer.mapview.locale.key,
                                                layer: layer.key,
                                                table: newLocation.table
                                            }),
                                        body: JSON.stringify({
                                            [layer.geom]: geometry,

                                            // Spread in defaults.
                                            ...layer.draw?.defaults
                                        })
                                    });

                                    // Layer must be reloaded to reflect geometry changes.
                                    layer.reload();

                                    // Get the newly created location.
                                    const newLoc = await mapp.location.get(newLocation);

                                    // Remove the location
                                    newLoc.remove();
                                });

                                // If layer.deleteLocation is defined, delete the location
                                if (layer.deleteLocation === true) {

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
                            }

                            location.remove();

                            if (!['maplibre', 'tiles'].includes(layer.format)) {
                                layer.hide();
                            }
                        }
                    }
                });
            }
        }
    });
}
