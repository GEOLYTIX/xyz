import { createMocks } from 'node-mocks-http';
import { afterEach, describe, expect, it, vi } from 'vitest';

const signerMock = vi.fn();
const loggerMock = vi.fn();

async function importCloudfront({ signerExport } = {}) {
  vi.resetModules();

  vi.doMock('../../../mod/sign/cloudfront.js', () => ({
    default:
      signerExport === undefined
        ? (...args) => signerMock(...args)
        : signerExport,
  }));

  vi.doMock('../../../mod/utils/logger.js', () => ({
    default: (...args) => loggerMock(...args),
  }));

  return (await import('../../../mod/provider/cloudfront.js')).default;
}

describe('cloudfront:', () => {
  afterEach(() => {
    signerMock.mockReset();
    loggerMock.mockReset();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('exports null when the signer export is falsy', async () => {
    // Arrange
    const cloudfront = await importCloudfront({ signerExport: null });

    // Act
    const result = cloudfront;

    // Assert
    expect(result).toBeNull();
  });

  it('reads the URL from req.params.url and returns JSON for .json URLs', async () => {
    // Arrange
    const cloudfront = await importCloudfront();
    const payload = { ok: true };
    const response = {
      status: 200,
      json: vi.fn().mockResolvedValue(payload),
      text: vi.fn(),
    };

    signerMock.mockResolvedValue('https://signed.example/data.json?sig=1');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
    vi.spyOn(Date, 'now').mockReturnValueOnce(100).mockReturnValueOnce(145);

    const { req } = createMocks({
      params: { url: 'https://origin.example/data.JSON' },
    });

    // Act
    const result = await cloudfront(req);

    // Assert
    expect(result).toEqual(payload);
    expect(signerMock).toHaveBeenCalledWith('https://origin.example/data.JSON');
    expect(fetch).toHaveBeenCalledWith(
      'https://signed.example/data.json?sig=1',
    );
    expect(response.json).toHaveBeenCalledTimes(1);
    expect(response.text).not.toHaveBeenCalled();
    expect(loggerMock).toHaveBeenCalledWith(
      '45: 200 - https://origin.example/data.JSON',
      'cloudfront',
    );
  });

  it('reads the URL from a raw string and returns text for non-json URLs', async () => {
    // Arrange
    const cloudfront = await importCloudfront();
    const response = {
      status: 200,
      json: vi.fn(),
      text: vi.fn().mockResolvedValue('plain text body'),
    };
    const url = 'https://origin.example/file.txt';

    signerMock.mockResolvedValue('https://signed.example/file.txt?sig=1');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
    vi.spyOn(Date, 'now').mockReturnValueOnce(200).mockReturnValueOnce(260);

    // Act
    const result = await cloudfront(url);

    // Assert
    expect(result).toEqual('plain text body');
    expect(signerMock).toHaveBeenCalledWith(url);
    expect(fetch).toHaveBeenCalledWith('https://signed.example/file.txt?sig=1');
    expect(response.text).toHaveBeenCalledTimes(1);
    expect(response.json).not.toHaveBeenCalled();
    expect(loggerMock).toHaveBeenCalledWith(
      '60: 200 - https://origin.example/file.txt',
      'cloudfront',
    );
  });

  it('returns a signer Error without fetching', async () => {
    // Arrange
    const cloudfront = await importCloudfront();
    const expected = new Error('Cloudfront signer error');

    signerMock.mockResolvedValue(expected);
    vi.stubGlobal('fetch', vi.fn());

    const { req } = createMocks({
      params: { url: 'https://origin.example/error.json' },
    });

    // Act
    const result = await cloudfront(req);

    // Assert
    expect(result).toBe(expected);
    expect(fetch).not.toHaveBeenCalled();
    expect(loggerMock).not.toHaveBeenCalled();
  });

  it('returns an Error for responses with status >= 300 and still logs the request', async () => {
    // Arrange
    const cloudfront = await importCloudfront();
    const response = {
      status: 404,
      json: vi.fn(),
      text: vi.fn(),
    };

    signerMock.mockResolvedValue('https://signed.example/missing.json?sig=1');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
    vi.spyOn(Date, 'now').mockReturnValueOnce(300).mockReturnValueOnce(309);

    const { req } = createMocks({
      params: { url: 'https://origin.example/missing.json' },
    });

    // Act
    const result = await cloudfront(req);

    // Assert
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('CloudFront request failed with status 404.');
    expect(response.json).not.toHaveBeenCalled();
    expect(response.text).not.toHaveBeenCalled();
    expect(loggerMock).toHaveBeenCalledWith(
      '9: 404 - https://origin.example/missing.json',
      'cloudfront',
    );
  });

  it('catches signer failures, logs to console.error, and returns the error', async () => {
    // Arrange
    const cloudfront = await importCloudfront();
    const expected = new Error('signer threw');
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    signerMock.mockRejectedValue(expected);
    vi.stubGlobal('fetch', vi.fn());

    // Act
    const result = await cloudfront('https://origin.example/rejected.txt');

    // Assert
    expect(result).toBe(expected);
    expect(consoleError).toHaveBeenCalledWith(expected);
    expect(fetch).not.toHaveBeenCalled();
    expect(loggerMock).not.toHaveBeenCalled();
  });

  it('catches fetch failures, logs to console.error, and returns the error', async () => {
    // Arrange
    const cloudfront = await importCloudfront();
    const expected = new Error('fetch failed');
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    signerMock.mockResolvedValue('https://signed.example/broken.txt?sig=1');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(expected));

    // Act
    const result = await cloudfront('https://origin.example/broken.txt');

    // Assert
    expect(result).toBe(expected);
    expect(consoleError).toHaveBeenCalledWith(expected);
    expect(loggerMock).not.toHaveBeenCalled();
  });
});
