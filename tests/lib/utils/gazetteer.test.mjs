/**
 * @module utils/gazetteer
 */
const originalXMLHttpRequest = XMLHttpRequest;

/**
 * This function is used as an entry point for the gazetteer Test
 * @function gazetteer
 */
export function gazetteer() {
  codi.describe(
    { name: 'Utils: gazetteer Test', id: 'utils_gazetteer', parentId: 'utils' },
    () => {
      const expectedXhrKeys = [
        'abort',
        'send',
        'open',
        'setRequestHeader',
        'responseType',
        'onload',
        'onerror',
      ];

      globalThis.XMLHttpRequest = class {
        constructor() {
          this.abort = () => {
            return this;
          };
          this.send = () => {
            return this;
          };
          this.open = () => {
            return this;
          };
          this.setRequestHeader = () => {
            return this;
          };
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

          const firstDatasetKeys = Object.keys(
            gazetteer.datasets[0].xhr,
          ).filter((key) => expectedXhrKeys.includes(key));

          const secondDatasetKeys = Object.keys(
            gazetteer.datasets[1].xhr,
          ).filter((key) => expectedXhrKeys.includes(key));

          codi.assertTrue(
            expectedXhrKeys.length === firstDatasetKeys.length,
            'first dataset should get an xhr object',
          );
          codi.assertTrue(
            expectedXhrKeys.length === secondDatasetKeys.length,
            'second dataset should get an xhr object',
          );
        },
      );

      globalThis.XMLHttpRequest = originalXMLHttpRequest;
    },
  );
}
