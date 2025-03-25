/**
 * This is a function called in the test environment that is used to give a
 * mock location for testing in different scenarios.
 * @function mockLocation
 * @param {Object} mapview
 */
export async function mockLocation(mapview) {
  const locationLayer = mapview.layers['location_get_test'];
  return await mapp.location.get({
    layer: locationLayer,
    getTemplate: 'get_location_mock',
    id: 999,
  });
}
