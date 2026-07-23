import { MockAgent, setGlobalDispatcher } from 'undici';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

const { default: getSrc } = await import('../../../mod/provider/getSrc.js');

beforeEach(async () => {
  await getSrc({ clear: true });
  mockFileFn.mockReset();
  mockCloudFrontFn.mockReset();
});

describe('getSrc: providers', () => {
  it('https', async () => {
    const resBody = JSON.stringify(
      '{ "templates": {}, "locale": { "layers": {}, }, }',
    );

    const mockPool = mockAgent.get(new RegExp('https://geolytix.com/*'));

    mockPool.intercept({ path: '/config/workspace.json' }).reply(200, resBody);

    const url = 'https://geolytix.com/config/workspace.json';

    const results = await getSrc(url);

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

    const results = await getSrc(filePath);

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

    mockCloudFrontFn.mockImplementationOnce(() => {
      return JSON.parse(fileBody);
    });

    const results = await getSrc(cloudFrontURL);

    expect(results).toEqual(
      '{ "templates": {}, "locale": { "layers": {}, }, }',
    );
  });

  it('returns an error for an unknown provider', async () => {
    const response = await getSrc('foo:bar.json');

    expect(response).toBeInstanceOf(Error);
    expect(response.message).toBe('Unknown getSrc provider: foo:bar.json');
  });

  it('returns an error without a src string', async () => {
    const response = await getSrc({});

    expect(response).toBeInstanceOf(Error);
  });

  it('tests whether a provider exists for a src', async () => {
    expect(await getSrc({ src: 'file:./workspace.json', test: true })).toBe(
      true,
    );
    expect(await getSrc({ src: 'foo:bar.json', test: true })).toBe(false);
    expect(await getSrc({ src: 'plain text value', test: true })).toBe(false);
  });
});

describe('getSrc: source map', () => {
  it('shares one promise between concurrent source requests', async () => {
    const src = 'file:./shared.json';

    mockFileFn.mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5));
      return { nested: { value: true } };
    });

    const [first, second] = await Promise.all([getSrc(src), getSrc(src)]);

    first.nested.value = false;

    expect(second).toEqual({ nested: { value: true } });
    expect(mockFileFn).toHaveBeenCalledTimes(1);
  });

  it('resolves environment variables once and aliases the unresolved src', async () => {
    const originalSrcDir = xyzEnv.SRC_DIR;

    xyzEnv.SRC_DIR = './resolved';
    mockFileFn.mockImplementation(async () => 'source');

    try {
      const first = await getSrc('file:${DIR}/shared.json');
      const second = await getSrc('file:./resolved/shared.json');
      const third = await getSrc('file:${DIR}/shared.json');

      expect(first).toBe('source');
      expect(second).toBe('source');
      expect(third).toBe('source');
      expect(mockFileFn).toHaveBeenCalledTimes(1);
      expect(mockFileFn).toHaveBeenCalledWith('./resolved/shared.json');
    } finally {
      xyzEnv.SRC_DIR = originalSrcDir;
    }
  });

  it('returns the provider error response', async () => {
    mockFileFn.mockImplementation(async () => {
      throw new Error('provider failed');
    });

    const response = await getSrc('file:./failing.json');

    expect(response).toBeInstanceOf(Error);
    expect(response.message).toBe('provider failed');
  });

  it('returns an error for an undefined source response', async () => {
    mockFileFn.mockImplementation(async () => undefined);

    const response = await getSrc('file:./undefined.json');

    expect(response).toBeInstanceOf(Error);
    expect(response.message).toBe('Unable to load src: file:./undefined.json');
  });

  it('bypasses the source map with cache being false', async () => {
    mockFileFn.mockImplementation(async () => 'fresh');

    await getSrc({ src: 'file:./fresh.json', cache: false });
    await getSrc({ src: 'file:./fresh.json', cache: false });

    expect(mockFileFn).toHaveBeenCalledTimes(2);
  });

  it('flushes the source map with the clear param', async () => {
    mockFileFn.mockImplementation(async () => 'source');

    await getSrc('file:./flushed.json');
    await getSrc({ clear: true });
    await getSrc('file:./flushed.json');

    expect(mockFileFn).toHaveBeenCalledTimes(2);
  });
});

describe('getSrc: cache workspace sources', () => {
  it('discovers nested and duplicate sources', async () => {
    const workspace = {
      templates: {
        first: { src: 'file:./first.json' },
        duplicate: { src: 'file:./first.json' },
      },
    };

    mockFileFn.mockImplementation(async (ref) => {
      if (ref === './first.json') {
        return { nested: { src: 'file:./second.json' } };
      }

      return { loaded: true };
    });

    const result = await getSrc({ workspace });

    expect(result).toBe(workspace);
    expect(mockFileFn).toHaveBeenCalledTimes(2);

    // The workspace src references are not rewritten without a directory param.
    expect(workspace.templates.first.src).toBe('file:./first.json');
  });

  it('does not read the source of srcLoaded objects', async () => {
    const workspace = {
      templates: {
        loaded: {
          src: 'file:./loaded.json',
          srcLoaded: true,
          template: 'assembled content',
        },
        pending: { src: 'file:./pending.json' },
      },
    };

    mockFileFn.mockImplementation(async () => ({ loaded: true }));

    const result = await getSrc({ workspace });

    expect(result).toBe(workspace);
    expect(mockFileFn).toHaveBeenCalledTimes(1);
    expect(mockFileFn).toHaveBeenCalledWith('./pending.json');
  });

  it('resolves circular source references without fetching twice', async () => {
    const workspace = { template: { src: 'file:./circular-first.json' } };

    mockFileFn.mockImplementation(async (ref) => {
      if (ref === './circular-first.json') {
        return { nested: { src: 'file:./circular-second.json' } };
      }

      return { nested: { src: 'file:./circular-first.json' } };
    });

    const result = await getSrc({ workspace });

    expect(result).toBe(workspace);
    expect(mockFileFn).toHaveBeenCalledTimes(2);
  });

  it('returns an error joining failed sources', async () => {
    const workspace = {
      templates: {
        failing: { src: 'file:./failing.json' },
      },
    };

    mockFileFn.mockImplementation(async () => {
      throw new Error('provider failed');
    });

    const result = await getSrc({ workspace });

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('file:./failing.json: provider failed');
  });
});
