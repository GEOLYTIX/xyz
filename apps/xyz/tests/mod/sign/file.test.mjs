import { createHmac } from 'node:crypto';
import { createMocks } from 'node-mocks-http';
import { describe, expect, it, vi } from 'vitest';

globalThis.xyzEnv = {
  FILE_RESOURCES: 'public',
  DIR: 'latest',
  KEY_TEST: 'KEY_TEST',
  SIGN_TEST: 'localhost:3000/latest',
  WALLET: { LOCAL_FILE: 'PRIVATEKEY' },
  SIGN_LOCAL_FILE: 'localhost/latest',
};

const fsMockFn = vi.fn();

vi.mock('fs', () => ({
  readFileSync: (...args) => fsMockFn(...args),
}));

describe('file:', () => {
  it('valid file sign', async () => {
    const privateKey = 'PRIVATEKEY';

    const date = new Date(Date.now());

    date.setDate(date.getDate() + 1);

    const signature = createHmac('sha256', privateKey)
      .update('./public/views/_login.html')
      .update('LOCAL_FILE')
      .update(String(Date.parse(date)))
      .digest('hex');

    const { req } = createMocks({
      host: 'localhost/',
      params: {
        url: './public/views/_login.html',
        signing_key: 'LOCAL_FILE',
      },
    });

    const params = {
      expires: Date.parse(date),
      key_id: 'LOCAL_FILE',
      signature: signature,
      url: req.params.url,
    };

    fsMockFn.mockImplementation(() => {
      return 'PRIVATEKEY';
    });

    const { default: file_signer } = await import(
      '@geolytix/xyz-app/mod/sign/file.js'
    );

    const result = file_signer(req);

    let paramString = '';
    for (const key of Object.keys(params)) {
      let urlParam = `${key}=${encodeURIComponent(params[key])}`;
      if (key !== Object.keys(params).at(-1)) urlParam = `${urlParam}&`;

      paramString += urlParam;
    }

    const signedURL = `https://${req.host}${xyzEnv.DIR}/api/provider/file?${paramString}`;

    expect(result).toEqual(signedURL);
  });
});
