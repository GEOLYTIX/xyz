export async function mockLocation(mapview) {
  const locationLayer = mapview.layers['location_get_test'];
  return await mapp.location.get({
    layer: locationLayer,
    getTemplate: 'get_location_mock',
    id: 999,
  });
}
