import scriptElement from '../../../lib/utils/scriptElement.mjs';

export function scriptElementTest() {
  codi.describe(
    { name: 'scriptElement:', id: 'utils_scriptElement', parentId: 'utils' },
    () => {
      codi.it(
        {
          name: 'loads a script and resolves on load',
          parentId: 'utils_scriptElement',
        },
        async () => {
          // Setup: Remove any existing test script
          const testSrc =
            'https://cdn.jsdelivr.net/npm/ol-mapbox-style@13.0.1/dist/olms.js';

          let appended = false;
          const origAppend = document.head.append;
          document.head.append = function (el) {
            appended = true;
            origAppend.call(this, el);
          };

          await scriptElement(testSrc);

          codi.assertTrue(appended, 'Script element should be appended');

          document.head.append = origAppend;
        },
      );
    },
  );
}
