/**
 * ## user.updateTest()
 * @module user/update
 */

/**
 * This function is used as an entry point for the changeEndTest
 * @function updateTest
 */
export async function updateTest() {
  if (mapp.user) {
    await codi.describe('User: update', async () => {
      /**
       * ### update endpoint should be able to process a body
       * The user update endpoint should be able to take a body as the request.
       * @function it
       */
      await codi.it(
        'update endpoint should be able to process a body',
        async () => {
          let params = {
            url: '/test/api/user/update',
            body: JSON.stringify({
              email: 'test@geolytix.co.uk',
              admin: false,
              approved: false,
              verified: false,
            }),
          };

          await mapp.utils.xhr(params);

          params = {
            url: '/test/api/user/update',
            body: JSON.stringify({
              email: 'test@geolytix.co.uk',
              admin: true,
              approved: true,
              verified: false,
            }),
          };

          await mapp.utils.xhr(params);

          const acl = await mapp.utils.xhr('/test/api/user/list');
          const test_user = acl.filter(
            (user) => user.email === 'test@geolytix.co.uk',
          )[0];

          await codi.assertEqual(
            test_user.email,
            'test@geolytix.co.uk',
            'The users email address should be test@geolytix.co.uk',
          );
          await codi.assertFalse(
            test_user.verified,
            'The user should be not verified',
          );
          await codi.assertTrue(test_user.admin, 'The user should an admin');
          await codi.assertTrue(
            test_user.approved,
            'The user should be approved',
          );
        },
      );

      /**
             ### update endpoint should be able to be just params
             * The user update endpoint should be able to take a body as the request.
             * @function it
             */
      await codi.it(
        'update endpoint should be able to be just params',
        async () => {
          const url = `/test/api/user/update?email=test@geolytix.co.uk&field=admin&value=false`;
          await mapp.utils.xhr(url);

          const acl = await mapp.utils.xhr('/test/api/user/list');
          const test_user = acl.filter(
            (user) => user.email === 'test@geolytix.co.uk',
          )[0];

          await codi.assertEqual(
            test_user.email,
            'test@geolytix.co.uk',
            'The users email address should be test@geolytix.co.uk',
          );
          await codi.assertFalse(
            test_user.verified,
            'The user should be not verified',
          );
          await codi.assertFalse(test_user.admin, 'The user should an admin');
          await codi.assertTrue(
            test_user.approved,
            'The user should be approved',
          );
        },
      );
    });
  }
}
