import { MockAgent, setGlobalDispatcher } from 'undici';
import { describe, expect, it, vi } from 'vitest';

const mockAgent = new MockAgent();
setGlobalDispatcher(mockAgent);

const mockFileFn = vi.fn();
const mockCloudFrontFn = vi.fn();

vi.mock('@geolytix/xyz-app/mod/sign/file.js', () => ({
  default: vi.fn(),
  file_signer: vi.fn(),
}));

vi.mock('@geolytix/xyz-app/mod/provider/file.js', () => ({
  default: (...args) => mockFileFn(...args),
}));

vi.mock('@geolytix/xyz-app/mod/provider/cloudfront.js', () => ({
  default: (...args) => mockCloudFrontFn(...args),
}));

const { default: getFrom } = await import('@geolytix/xyz-app/mod/provider/getFrom.js');

describe('getFrom:', () => {
  it('https', async () => {
    const resBody = JSON.stringify(
      '{ "templates": {}, "locale": { "layers": {}, }, }',
    );

    const mockPool = mockAgent.get(new RegExp('https://geolytix.com/*'));

    mockPool.intercept({ path: '/config/workspace.json' }).reply(200, resBody);

    const url = 'https://geolytix.com/config/workspace.json';

    const results = await getFrom['https'](url);

    expect(results).toEqual(
      '{ "templates": {}, "locale": { "layers": {}, }, }',
    );
  });

  it('file', async () => {
    const filePath = 'file:../../workspaces/workspace.json';

    const fileBody = JSON.stringify(
      '{ "templates": {}, "locale": { "layers": {}, }, }',
    );

    mockFileFn.mockImplementationOnce(() => {
      return JSON.parse(fileBody);
    });

    const results = await getFrom['file'](filePath);

    expect(results).toEqual(
      '{ "templates": {}, "locale": { "layers": {}, }, }',
    );
  });

  it('cloudfront', async () => {
    globalThis.xyzEnv = {
      KEY_CLOUDFRONT: 'CLOUDFRONTKEY',
    };

    const cloudFrontURL =
      'cloudfront:aws.cloudfront.example/workspaces/workspace.json';

    const fileBody = JSON.stringify(
      '{ "templates": {}, "locale": { "layers": {}, }, }',
    );

    mockCloudFrontFn.mockImplementationOnce((ref) => {
      return JSON.parse(fileBody);
    });

    const results = await getFrom['cloudfront'](cloudFrontURL);

    expect(results).toEqual(
      '{ "templates": {}, "locale": { "layers": {}, }, }',
    );
  });
});
