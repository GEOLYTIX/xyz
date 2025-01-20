export function dataview(mapview) {
  codi.describe(
    {
      name: 'Dataview test',
      id: 'ui_locations_entries_dataview',
      parentId: 'ui_locations_entries',
    },
    () => {
      codi.it(
        {
          name: 'basic',
          id: 'ui_locations_entries_dataview_basic',
          parentId: 'ui_locations_entries_dataview',
        },
        () => {
          const expected = '<div class="location test-dataview"></div>';
          const entry = {
            key: 'test-dataview',
            dataview: 'Json',
            layer: {
              mapview: mapview,
            },
            data: { test: true },
            location: {
              layer: {},
            },
          };

          const result = ui.locations.entries.dataview(entry);

          codi.assertEqual(
            result[3],
            expected,
            'We expect to get a basic dataview div returned',
          );
        },
      );
    },
  );
}
