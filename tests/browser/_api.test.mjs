export async function apiTest() {
  await codi.describe(`API Tests`, async () => {
    await codi.describe(`Workspace / Roles API`, async () => {
      await codi.it(
        'Should return an array of roles as defined in the workspace',
        async () => {
          const response = await fetch('api/workspace/roles');
          const roles = await response.json();
          // Check the response is an array
          codi.assertTrue(Array.isArray(roles));

          // Check the response contains 'A', 'B', 'C'
          await codi.it('Roles should contain A', async () => {
            codi.assertTrue(roles.includes('A'));
          });

          await codi.it('Roles should contain B', async () => {
            codi.assertTrue(roles.includes('B'));
          });

          await codi.it('Roles should contain C', async () => {
            codi.assertTrue(roles.includes('C'));
          });

          // Check the response does not contain the reserved role '*'
          await codi.it('Roles should not contain *', async () => {
            codi.assertTrue(!roles.includes('*'));
          });
        },
      );

      await codi.it(
        'Should return an object of workspace roles with definitions',
        async () => {
          const response = await fetch('api/workspace/roles?detail=true');
          const roles = await response.json();
          // Check the response is an object
          codi.assertTrue(typeof roles === 'object');

          await codi.it(
            'Roles object should contain A with value = Text about A',
            async () => {
              // Check the object contains 'A' role with text' Text about A'
              codi.assertTrue(roles.A === 'Text about A');
            },
          );

          await codi.it(
            'Roles object should contain B with value = Text about A',
            async () => {
              // Check the object contains 'B' role with text' Text about B'
              codi.assertTrue(roles.B === 'Text about B');
            },
          );

          await codi.it(
            'Roles object should contain C with value = {}',
            async () => {
              // Check the object contains 'C' role as an object
              // this is as its not added to the roles object in the workspace
              // So it gets added as an object
              codi.assertTrue(typeof roles.C === 'object');
            },
          );

          await codi.it('Roles object should not contain *', async () => {
            // Check the reserved role '*' is not included in the object
            codi.assertTrue(!roles['*']);
          });
        },
      );
    });
  });
}
