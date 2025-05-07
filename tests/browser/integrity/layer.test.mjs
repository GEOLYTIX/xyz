export async function layerTest(mapview) {
  await codi.describe(
    { name: `${mapview.host} : Layer Test`, id: 'integration_layer' },
    async () => {
      for (const key of Object.getOwnPropertyNames(mapview.layers)) {
        await codi.it(
          { name: `Layer test : ${key}`, parentId: 'integration_layer' },
          async () => {
            const layer = mapview.layers[key];

            layer.show();

            setupMapView(mapview, layer);
            await testThemes(layer);

            //Location test
            if (layer.infoj) {
              const lastLocation = await mapp.utils.xhr(
                `${mapp.host}/api/query?${mapp.utils.paramString({
                  template: 'get_random_location',
                  locale: layer.mapview.locale.key,
                  layer: layer.key,
                  filter: layer.filter?.current,
                })}`,
              );

              if (lastLocation?.id) {
                layer.infoj = layer.infoj.map((entry) => {
                  if (entry.type === 'dataview') {
                    return { ...entry, display: true };
                  }
                  return entry;
                });

                const location = await mapp.location.get({
                  layer: layer,
                  id: lastLocation.id,
                });

                codi.assertTrue(
                  location !== undefined,
                  'The location is undefined',
                );

                // Create a new location
                const newLocation = {
                  layer,
                  table: layer.tableCurrent(),
                  new: true,
                };

                // Add a new location to the layer using the last location
                if (layer.draw) {
                  await codi.it(
                    {
                      name: 'Add a new location to the layer using the last location coordinates',
                      parentId: 'integration_layer',
                    },
                    async () => {
                      // Use the value of the infoj pin field to create a new location
                      const pin = location.infoj.find(
                        (entry) => entry.type === 'pin',
                      );

                      // If no pin, just use the center of the mapview as the location.
                      const center = mapview.Map.getView().getCenter();

                      const geometry = pin?.geometry || center;

                      //Creating the new point
                      //We need to pass a geometry for the new location query
                      newLocation.id = await mapp.utils.xhr({
                        method: 'POST',
                        url:
                          `${mapp.host}/api/query?` +
                          mapp.utils.paramString({
                            template: 'location_new',
                            locale: layer.mapview.locale.key,
                            layer: layer.key,
                            table: newLocation.table,
                          }),
                        body: JSON.stringify({
                          [layer.geom]: geometry,
                          // Spread in defaults.
                          ...layer.draw?.defaults,
                        }),
                      });

                      // Get the newly created location.
                      const newLoc = await mapp.location.get(newLocation);

                      // Remove the location
                      newLoc.remove();
                    },
                  );

                  await codi.it(
                    {
                      name: 'Delete the location',
                      parentId: 'integration_layer',
                    },
                    async () => {
                      // Test deleting a location
                      await mapp.utils.xhr(
                        `${mapp.host}/api/query?` +
                          mapp.utils.paramString({
                            template: 'location_delete',
                            locale: mapview.locale.key,
                            layer: newLocation.layer.key,
                            table: newLocation.table,
                            id: newLocation.id,
                          }),
                      );
                    },
                  );
                }

                location.remove();
              }
            }

            // Turn off the layer
            layer.hide();
          },
        );
      }
    },
  );
}

function setupMapView(mapview, layer) {
  if (layer.tables) {
    //This is to set the zoom level so that the correct zoom level is used for the layer.
    const layerZoom = parseInt(
      Object.entries(layer.tables).find(([key, value]) => value !== null)[0],
    );
    mapview.Map.getView().setZoom(layerZoom);
  }

  if (layer.dataviews) {
    for (const dataview in layer.dataview) {
      dataview.show();
    }
  }
}

async function testThemes(layer) {
  // Turn on every theme on the layer to test if they work
  if (layer.style?.themes) {
    for (const theme in layer.style.themes) {
      console.log(`Testing -- Layer: ${layer.key}: Theme: ${theme}`);
      layer.style.theme = layer.style.themes[theme];
      layer.reload();

      //This is to allow errors being logged into the console.
      //There is no test being asserted on.
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}
