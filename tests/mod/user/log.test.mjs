// Mock the acl module.
const aclFn = codi.mock.fn();

const mockednoacl = codi.mock.module('../../../mod/user/acl.js', {
  cache: false,
  defaultExport: aclFn,
  namedExports: {
    acl: null,
  },
});

await codi.describe(
  { name: 'log:', id: 'user_log', parentId: 'user' },
  async () => {
    codi.it(
      { name: 'Returns an error if no acl provided ', parentId: 'user_log' },
      async () => {
        const { default: accessLog } = await import('../../../mod/user/log.js');

        const { req, res } = codi.mockHttp.createMocks({
          params: {
            email: 'test@geolytix.co.uk',
          },
        });

        const result = await accessLog(req, res);

        codi.assertTrue(result.message == 'ACL unavailable.');
      },
    );
    codi.it(
      {
        name: 'Returns an error if no email parameter provided ',
        parentId: 'user_log',
      },
      async () => {
        //TODO: @simon-leech Please test me
        codi.assertTrue(false);
      },
    );
    codi.it(
      {
        name: 'Returns an error if email parameter provided but no user ',
        parentId: 'user_log',
      },
      async () => {
        //TODO: @simon-leech Please test me
        codi.assertTrue(false);
      },
    );
    codi.it(
      {
        name: 'Returns an error if email parameter not yourself, and user is not an admin ',
        parentId: 'user_log',
      },
      async () => {
        //TODO: @simon-leech Please test me
        codi.assertTrue(false);
      },
    );
    codi.it(
      {
        name: 'Returns logs if email parameter is yourself ',
        parentId: 'user_log',
      },
      async () => {
        //TODO: @simon-leech Please test me
        codi.assertTrue(false);
      },
    );
    codi.it(
      {
        name: 'Returns logs if email parameter is someone else, and user is an admin ',
        parentId: 'user_log',
      },
      async () => {
        //TODO: @simon-leech Please test me
        codi.assertTrue(false);
      },
    );
  },
);

mockedacl.restore();
