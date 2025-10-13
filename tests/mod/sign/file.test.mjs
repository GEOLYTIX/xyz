import crypto from 'node:crypto';
import { readFileSync } from 'fs';

const fsMockFn = codi.mock.fn(readFileSync);
const fsMock = codi.mock.module('fs', {
  namedExports: {
    readFileSync: fsMockFn,
  },
});

await codi.describe(
  {
    name: 'file:',
    id: 'sign_file',
    parentId: 'sign',
  },
  async () => {
    codi.it({ name: 'valid file sign', parentId: 'sign_file' }, async () => {
      const privateKey = 'PRIVATEKEY';

      globalThis.xyzEnv = {
        FILE_RESOURCES: 'public',
        DIR: 'latest',
        KEY_FILE: 'KEY_TEST',
      };

      const date = new Date(Date.now());

      date.setDate(date.getDate() + 1);

      const signature = crypto
        .createHmac('sha256', privateKey)
        .update('./public/views/_login.html')
        .digest('hex');

      const { req, res } = codi.mockHttp.createMocks({
        host: 'localhost/',
        params: {
          url: './public/views/_login.html',
        },
      });

      const params = {
        expires: Date.parse(date),
        key_id: xyzEnv.KEY_FILE,
        signature: signature,
        url: req.params.url,
      };

      let paramString = '';
      for (const key of Object.keys(params)) {
        let urlParam = `${key}=${encodeURIComponent(params[key])}`;
        if (key !== Object.keys(params).at(-1)) urlParam = `${urlParam}&`;

        paramString += urlParam;
      }

      fsMockFn.mock.mockImplementationOnce(function readFileSync() {
        return 'PRIVATEKEY';
      });

      const { file_signer } = await import('../../../mod/sign/file.js');

      const result = await file_signer(req);

      const signedURL = `https://${req.host}${xyzEnv.DIR}/api/provider/file?${paramString}`;

      codi.assertEqual(result, signedURL);
    });
  },
);

fsMock.restore();
