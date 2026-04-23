import { describe, expect, it, vi } from 'vitest';

const fsMockFn = vi.fn();
const mockPathJoinFn = vi.fn();

vi.mock('fs', () => ({
  readFileSync: (...args) => fsMockFn(...args),
}));

vi.mock('path', () => ({
  join: (...args) => mockPathJoinFn(...args),
}));

vi.mock('@geolytix/xyz-app/mod/sign/file.js', () => ({
  default: vi.fn(),
  file_signer: vi.fn(),
}));

const { default: file } = await import(
  '@geolytix/xyz-app/mod/provider/file.js'
);

describe('file:', () => {
  it('Get File test', async () => {
    const fileContent = { text: 'I am a file' };
    fsMockFn.mockImplementationOnce(() => {
      return JSON.stringify(fileContent);
    });

    mockPathJoinFn.mockImplementationOnce(() => {
      return './tests/thing.json';
    });

    const results = await file('./tests/thing.json');

    expect(results).toEqual(fileContent);
  });
});
