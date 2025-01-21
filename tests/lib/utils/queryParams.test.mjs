/**
 * @module utils/queryParams
 */

import geoJsonLayer from '../../assets/layers/geojson/layer.json';
import basicInfoj from '../../assets/infoj/basic.json';
import ukFeatures from '../../assets/data/uk.json';
import { setView } from '../../utils/view.js';

/**
 * This function is used as an entry point for the queryParams Test
 * @function queryParamsTest
 */
export async function queryParams(mapview) {
  await codi.describe(
    { name: 'queryParams Test:', id: 'utils_queryparams', parentId: 'utils' },
    async () => {
      const layerParams = {
        ...geoJsonLayer,
        featureLocation: true,
        key: 'query_params_test',
      };

      layerParams.infoj = [...layerParams.infoj, ...basicInfoj.infoj];

      layerParams.features = ukFeatures.features;

      const [location_layer] = await mapview.addLayer(layerParams);

      //Get the location
      const location = await mapp.location.get({
        layer: location_layer,
        id: 6,
      });

      const params = {
        layer: location_layer,
        queryparams: {
          layer: location_layer,
          table: 'fake_table',
        },
      };

      await setView(mapview, 2, 'default');

      /**
       * ### Should Return undefined
       * This test is used to check that queryParams returns undefined if queryparams is null/undefined
       * @function it
       */
      await codi.it(
        {
          name: 'Should return undefined with null queryparams',
          parentId: 'utils_queryparams',
        },
        async () => {
          const null_params = {};
          const formattedValue = mapp.utils.queryParams(null_params);
          codi.assertEqual(
            formattedValue,
            undefined,
            `We expect the value to equal undefined, we received ${formattedValue}`,
          );
        },
      );

      /**
       * ### Should Return qID and id
       * This test is used to check that queryParams returns the correct field values for id and qID when supplied.
       * @function it
       */
      await codi.it(
        { name: 'Should return id, qID', parentId: 'utils_queryparams' },
        async () => {
          params.queryparams.id = true;
          params.queryparams.qID = true;
          params.location = location;

          const queryParams = mapp.utils.queryParams(params);
          codi.assertEqual(
            queryParams.id,
            6,
            `We expect the value to equal 6, we received ${queryParams.id}`,
          );
          codi.assertEqual(
            queryParams.qID,
            'id',
            `We expect the value to equal id, we received ${queryParams.qID}`,
          );
        },
      );

      /**
       * ### Should Return lat, lng and z parameters in the response
       * This test is used to check that queryParams returns latitude, longitude and zoom level when requested.
       * @function it
       */
      await codi.it(
        { name: 'Should return lat, lng, z', parentId: 'utils_queryparams' },
        async () => {
          params.queryparams.center = true;
          params.queryparams.z = true;

          const queryParams = mapp.utils.queryParams(params);
          codi.assertEqual(
            queryParams.lng,
            0,
            `We expect the value to equal 0, we received ${queryParams.lng}`,
          );
          codi.assertEqual(
            queryParams.lat,
            0,
            `We expect the value to equal 0, we received ${queryParams.lat}`,
          );
          codi.assertTrue(
            !!queryParams.z,
            `We expect the zoom level to be returned from the method`,
          );
        },
      );

      /**
       * ### Should Return locale, template and layer parameters in the response
       * This test is used to check that queryParams returns locale, template and layer when requested.
       * @function it
       */
      await codi.it(
        {
          name: 'Should return locale, template, layer',
          parentId: 'utils_queryparams',
        },
        async () => {
          params.query = 'not_real';

          const queryParams = mapp.utils.queryParams(params);
          codi.assertEqual(
            queryParams.template,
            params.query,
            `We expect the value to equal ${params.query}, we received ${queryParams.template}`,
          );
          codi.assertEqual(
            queryParams.locale,
            'locale',
            `We expect the value to equal 0, we received ${queryParams.locale}`,
          );
          codi.assertEqual(
            queryParams.layer,
            location_layer.key,
            `We expect the value to equal ${location_layer.key}, we received ${queryParams.layer}`,
          );
        },
      );

      /**
       * ### Should Return viewport and filter
       * This test is used to check that queryParams returns viewport and filter when requested
       * @function it
       */
      await codi.it(
        {
          name: 'Should return viewport, filter',
          parentId: 'utils_queryparams',
        },
        async () => {
          params.viewport = true;
          params.queryparams.filter = true;

          const queryParams = mapp.utils.queryParams(params);
          codi.assertEqual(
            queryParams.viewport.length,
            5,
            `We expect the value to have 5 params, we received ${queryParams.viewport.length}`,
          );
          codi.assertEqual(
            queryParams.filter,
            {},
            `We expect the value to equal {'id':{}}, we received ${JSON.stringify(queryParams.filter)}`,
          );
        },
      );

      // Push removeCallback method to remove callback methods.
      location.removeCallbacks.push((_this) => delete _this.removeCallbacks);

      location.remove();
    },
  );
}
