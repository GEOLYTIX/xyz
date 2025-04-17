//Assigning mapp.utils.xhr to a property to restore original function with.
const originalXHR = mapp.utils.xhr;

export async function ping() {
  await codi.describe(
    {
      name: 'ping Test:',
      id: 'utils_ping',
      parentId: 'utils',
    },
    async () => {
      await codi.it(
        {
          name: 'Should reject Promise if field,table or id not provided and default query used',
          parentId: 'utils_ping',
        },
        async () => {
          const params = {
            queryparams: {
              field: 'model_status',
            },
          };

          // Mock Success
          mapp.utils.xhr = () => {
            return {
              model_status: 'Complete',
            };
          };

          try {
            // This is expected to reject
            await mapp.utils.ping(params);
          } catch (err) {
            // Assert that it rejected with the correct error
            codi.assertEqual(
              err.message,
              'Ping failed: Missing field, table or id in queryparams object for location_field_value query',
            );
          }
        },
      );
      await codi.it(
        {
          name: 'Should resolve Promise if Success stage is hit',
          parentId: 'utils_ping',
        },
        async () => {
          const params = {
            queryparams: {
              field: 'model_status',
              table: 'schema.table',
              id: true,
            },
          };

          // Mock Success
          mapp.utils.xhr = () => {
            return {
              model_status: 'Complete',
            };
          };

          // Call the ping utility
          const promiseOutput = await mapp.utils.ping(params);
          // We expect the promise to resolve with the ping stage value
          codi.assertEqual(promiseOutput, 'Complete');
        },
      );
      await codi.it(
        {
          name: 'Should resolve Promise if Success stage is hit - custom success stage',
          parentId: 'utils_ping',
        },
        async () => {
          const params = {
            queryparams: {
              field: 'model_status',
              table: 'schema.table',
              id: true,
            },
            stages: {
              success: 'FINISHED',
              error: 'ERROR',
            },
          };

          // Mock Success
          mapp.utils.xhr = () => {
            return {
              model_status: 'FINISHED',
            };
          };

          // Call the ping utility
          const promiseOutput = await mapp.utils.ping(params);
          // We expect the promise to resolve with the ping stage value
          codi.assertEqual(promiseOutput, 'FINISHED');
        },
      );
      await codi.it(
        {
          name: 'Should reject Promise if Error stage is hit',
          parentId: 'utils_ping',
        },
        async () => {
          const params = {
            queryparams: {
              field: 'model_status',
              table: 'schema.table',
              id: true,
            },
          };

          // Mock Success
          mapp.utils.xhr = () => {
            return {
              model_status: 'Error',
            };
          };

          try {
            // This is expected to reject
            await mapp.utils.ping(params);
          } catch (err) {
            // Assert that it rejected with the correct error
            codi.assertEqual(err.message, 'Ping failed');
          }
        },
      );
      await codi.it(
        {
          name: 'Should reject Promise if Error stage is hit - custom error stage',
          parentId: 'utils_ping',
        },
        async () => {
          const params = {
            queryparams: {
              field: 'model_status',
              table: 'schema.table',
              id: true,
            },
            stages: {
              success: 'Complete',
              error: 'ERRORING OUT',
            },
          };

          // Mock Success
          mapp.utils.xhr = () => {
            return {
              model_status: 'ERRORING OUT',
            };
          };

          try {
            // This is expected to reject
            await mapp.utils.ping(params);
          } catch (err) {
            // Assert that it rejected with the correct error
            codi.assertEqual(err.message, 'Ping failed');
          }
        },
      );
      await codi.it(
        {
          name: 'Should reject Promise if query returns an error',
          parentId: 'utils_ping',
        },
        async () => {
          const params = {
            queryparams: {
              field: 'model_status',
              table: 'schema.table',
              id: true,
            },
            stages: {
              success: 'Complete',
              error: 'ERRORING OUT',
            },
          };

          mapp.utils.xhr = () => {
            return new Error('500 Internal Server Error');
          };

          try {
            // This is expected to reject
            await mapp.utils.ping(params);
          } catch (err) {
            // Assert that it rejected with the correct error
            codi.assertEqual(err.message, 'Ping failed');
          }
        },
      );
      await codi.it(
        {
          name: 'Callback function should be called with the ping stage',
          parentId: 'utils_ping',
        },
        async () => {
          const params = {
            queryparams: {
              field: 'model_status',
              table: 'schema.table',
              id: true,
            },
            stages: {
              success: 'CALLBACK',
              error: 'ERRORING OUT',
            },
            returnStatus: true,
            callback: (pingStage) => {
              // Assert that the callback was called with the correct ping stage
              codi.assertEqual(pingStage, 'CALLBACK');
            },
          };

          // Mock Success
          mapp.utils.xhr = () => {
            return {
              model_status: 'CALLBACK',
            };
          };

          await mapp.utils.ping(params);
        },
      );
      await codi.it(
        {
          name: 'Should retry ping after interval and resolve on success',
          parentId: 'utils_ping',
        },
        async () => {
          // Set up a counter
          let callCount = 0;

          // Provide the params for the ping function
          const params = {
            interval: 1000,
            queryparams: {
              field: 'model_status',
              table: 'schema.table',
              id: true,
            },
          };

          // Mock .xhr to return different responses on each call
          mapp.utils.xhr = () => {
            callCount++;
            if (callCount === 1) {
              return { model_status: 'Initialising' };
            } else {
              return { model_status: 'Complete' };
            }
          };

          const start = Date.now();
          const pingOutput = await mapp.utils.ping(params);
          const elapsed = Date.now() - start;

          // Assertions
          codi.assertEqual(callCount, 2);
          codi.assertTrue(elapsed >= 1000);
          codi.assertEqual(pingOutput, 'Complete');
        },
      );
    },
  );

  // Restore the original mapp.utils.xhr function
  mapp.utils.xhr = originalXHR;
}
