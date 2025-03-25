import mailer from '../../../mod/utils/mailer.js';

codi.describe({ name: 'Mailer Module', id: 'mailer_module' }, async () => {
  codi.describe(
    { name: 'mailer()', id: 'mailer_module_check', parentId: 'mailer_module' },
    () => {
      codi.it(
        {
          name: 'should return undefined on missing TRANSPORT_HOST',
          parentId: 'mailer_module_check',
        },
        async () => {
          const transport_host = xyzEnv.TRANSPORT_HOST;
          xyzEnv.TRANSPORT_HOST = null;

          codi.assertTrue((await mailer({})) === undefined);

          xyzEnv.TRANSPORT_HOST = transport_host;
        },
      );
      codi.it(
        {
          name: 'should return undefined on missing TRANSPORT_EMAIL',
          parentId: 'mailer_module_check',
        },
        async () => {
          const transport_email = xyzEnv.TRANSPORT_EMAIL;
          xyzEnv.TRANSPORT_EMAIL = null;

          codi.assertTrue((await mailer({})) === undefined);

          xyzEnv.TRANSPORT_EMAIL = transport_email;
        },
      );
      codi.it(
        {
          name: 'should return undefined on missing TRANSPORT_PASSWORD',
          parentId: 'mailer_module_check',
        },
        async () => {
          const transport_password = xyzEnv.TRANSPORT_PASSWORD;
          xyzEnv.TRANSPORT_PASSWORD = null;

          codi.assertTrue((await mailer({})) === undefined);

          xyzEnv.TRANSPORT_PASSWORD = transport_password;
        },
      );
    },
  );
});
