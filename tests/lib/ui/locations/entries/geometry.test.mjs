/**
 * @module lib/ui/locations/entries/geometries
 */

/**
 * Entry point for the geometry test module
 * @function geometryTest
 * @param {object} mapview
 */
export function geometry(mapview) {
  codi.describe(
    {
      name: 'Geometry Test:',
      id: 'ui_locations_entries_geometry',
      parentId: 'ui_locations_entries',
    },
    () => {
      const entry = {
        mapview: mapview,
        key: 'geometry-test',
        value: {
          type: 'Point',
          coordinates: '0101000020110F000065D98262C7490CC10DF78253F7B75D41',
        },
        srid: 3856,
        display: true,
        location: {
          layer: {
            mapview: mapview,
          },
          Layers: [],
          Extents: {},
        },
      };

      /**
       * @description Should return geometry checkbox
       * @function it
       */
      codi.it(
        {
          name: 'Should return geometry checkbox',
          parentId: 'ui_locations_entries_geometry',
        },
        async () => {
          const geometryCheckBox = mapp.ui.locations.entries.geometry(entry);
          codi.assertTrue(
            !!geometryCheckBox,
            'A checkbox needs to be returned',
          );
        },
      );

      /**
       * @description Should return 0 if no entry value is provided
       * @function it
       */
      codi.it(
        {
          name: 'Should return 0 if no entry value is provided',
          parentId: 'ui_locations_entries_geometry',
        },
        async () => {
          entry.value = null;
          const geometryCheckBox =
            await mapp.ui.locations.entries.geometry(entry);
          codi.assertTrue(
            typeof geometryCheckBox === 'undefined',
            'We need to get no geometry checkbox returned',
          );
        },
      );

      /**
       * @description Should return an extent for the geometry
       * @function it
       */
      codi.it(
        {
          name: 'Should return an extent for the geometry',
          parentId: 'ui_locations_entries_geometry',
        },
        async () => {
          const extent = await entry.getExtent();
          codi.assertTrue(!!extent, 'An extent needs to be returned');
        },
      );
    },
  );
}
