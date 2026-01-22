/**
 * @module utils/gazetteer
 */

/**
 * This function is used as an entry point for the gazetteer Test
 * @function gazetteer
 */
export function gazetteer() {
  codi.describe(
    { name: 'Utils: gazetteer Test', id: 'utils_gazetteer', parentId: 'utils' },
    () => {
      // Mock XMLHttpRequest if not present
      const originalXMLHttpRequest = globalThis.XMLHttpRequest;

      globalThis.XMLHttpRequest = class {
        constructor() {
          this.abort = () => this;
          this.send = () => this;
          this.open = () => this;
          this.setRequestHeader = () => this;
        }
      };

      codi.it(
        {
          name: 'XHR should be assigned to datasets',
          parentId: 'utils_gazetteer',
        },
        () => {
          const term = 'test';

          const gazetteer = {
            leading_wildcard: true,
            limit: 5,
            datasets: [
              {
                mapview: {
                  host: 'localhost:3000',
                  locale: { key: 'test' },
                  layers: {
                    layer_3: { key: 'layer_3', qID: 'id' },
                  },
                },
                layer: 'layer_3',
                label: 'Store Name',
                qterm: 'store',
                table: 'fake_table',
                no_result: null,
              },
              {
                mapview: {
                  host: 'localhost:3000',
                  locale: { key: 'test' },
                  layers: {
                    layer_2: { key: 'layer_2', qID: 'id' },
                  },
                },
                layer: 'layer_2',
                label: 'Store Name Also',
                qterm: 'store',
                table: 'fake_table',
                no_result: null,
              },
            ],
          };

          mapp.utils.gazetteer.datasets(term, gazetteer);

          // Check first dataset
          const ds1 = gazetteer.datasets[0];
          codi.assertTrue(
            ds1.url.includes('localhost:3000/api/query?'),
            'first dataset url set',
          );
          codi.assertTrue(
            ds1.url.includes('qterm=store'),
            'first dataset qterm param set',
          );
          codi.assertTrue(
            typeof ds1.onLoad === 'function',
            'first dataset onLoad set',
          );

          // Check second dataset
          const ds2 = gazetteer.datasets[1];
          codi.assertTrue(
            ds2.url.includes('localhost:3000/api/query?'),
            'second dataset url set',
          );
          codi.assertTrue(
            ds2.url.includes('qterm=store'),
            'second dataset qterm param set',
          );
          codi.assertTrue(
            typeof ds2.onLoad === 'function',
            'second dataset onLoad set',
          );
        },
      );

      // Restore original XMLHttpRequest
      if (originalXMLHttpRequest) {
        globalThis.XMLHttpRequest = originalXMLHttpRequest;
      } else {
        delete globalThis.XMLHttpRequest;
      }
    },
  );
}
