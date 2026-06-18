import { MockAgent, setGlobalDispatcher } from 'undici';
import { describe, expect, it, vi } from 'vitest';

const mockAgent = new MockAgent();
setGlobalDispatcher(mockAgent);

const mockFileFn = vi.fn();
const mockCloudFrontFn = vi.fn();

vi.mock('../../../mod/sign/file.js', () => ({
  default: vi.fn(),
  file_signer: vi.fn(),
}));

vi.mock('../../../mod/provider/file.js', () => ({
  default: (...args) => mockFileFn(...args),
}));

vi.mock('../../../mod/provider/cloudfront.js', () => ({
  default: (...args) => mockCloudFrontFn(...args),
}));

const { default: getFrom } = await import('../../../mod/provider/getFrom.js');

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

  it('http accepts loopback urls', async () => {
    const resBody = JSON.stringify(
      '{ "templates": {}, "locale": { "layers": {}, }, }',
    );

    const mockPool = mockAgent.get('http://localhost:3000');

    mockPool.intercept({ path: '/config/workspace.json' }).reply(200, resBody);

    const url = 'http://localhost:3000/config/workspace.json';

    const results = await getFrom['http'](url);

    expect(results).toEqual(
      '{ "templates": {}, "locale": { "layers": {}, }, }',
    );
  });

  it('https rejects unsafe urls', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    try {
      for (const url of [
        'http://geolytix.com/config/workspace.json',
        'file:///etc/passwd',
        'not-a-url',
      ]) {
        const results = await getFrom['https'](url);

        expect(results).toBeInstanceOf(Error);
      }
    } finally {
      consoleError.mockRestore();
    }
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
