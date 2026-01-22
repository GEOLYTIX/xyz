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
      // Mocks
      mapp.utils.style = () => ({});
      mapp.ui.elements.chkbox = (params) => {
        const div = document.createElement('div');
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = params.checked;
        input.onchange = (e) => params.onchange(e.target.checked);
        div.appendChild(input);
        return div;
      };
      mapp.ui.elements.legendIcon = () => document.createElement('div');

      const entry = {
        mapview: mapview,
        key: 'geometry-test',
        value: {
          type: 'Point',
          coordinates: [0, 0],
        },
        srid: 3857,
        display: true,
        location: {
          layer: {
            mapview: {
              geometry: () => ({
                getSource: () => ({
                  getExtent: () => [0, 0, 10, 10],
                }),
              }),
            },
            zIndex: 1,
            srid: 3857,
          },
          Layers: [],
          Extents: {},
          style: {},
          removeLayer: () => {},
          update: (callback) => callback(),
          renderLocationView: () => {},
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
          const geometryElement = mapp.ui.locations.entries.geometry(entry);
          codi.assertTrue(!!geometryElement, 'An element needs to be returned');
          codi.assertTrue(
            !!entry.chkbox,
            'A checkbox needs to be assigned to the entry',
          );
        },
      );

      /**
       * @description Should return undefined if no entry value is provided
       * @function it
       */
      codi.it(
        {
          name: 'Should return undefined if no entry value is provided',
          parentId: 'ui_locations_entries_geometry',
        },
        async () => {
          // Create a fresh entry for this test to avoid side effects
          const noValueEntry = { ...entry, value: null };

          const geometryElement =
            mapp.ui.locations.entries.geometry(noValueEntry);

          codi.assertTrue(
            typeof geometryElement === 'undefined',
            'We need to get no geometry element returned',
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
          // Ensure display is true and show() has been called to create the layer
          entry.display = true;
          await entry.show();

          const extent = entry.getExtent();
          codi.assertTrue(!!extent, 'An extent needs to be returned');
          codi.assertTrue(
            Array.isArray(extent) && extent.length === 4,
            'Extent should be an array of 4 numbers',
          );
        },
      );

      /**
       * @description Should attach methods to the entry
       * @function it
       */
      codi.it(
        {
          name: 'Should attach methods to the entry',
          parentId: 'ui_locations_entries_geometry',
        },
        async () => {
          // These are attached inside the geometry function
          codi.assertTrue(
            typeof entry.show === 'function',
            'show method attached',
          );
          codi.assertTrue(
            typeof entry.hide === 'function',
            'hide method attached',
          );
          codi.assertTrue(
            typeof entry.modify === 'function',
            'modify method attached',
          );
        },
      );
    },
  );
}
