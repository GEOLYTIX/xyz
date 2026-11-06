import { describe, expect, it } from 'vitest';
import { dataURLtoBlob } from '../../lib/utils/dataURLtoBlob.mjs';

describe('utils/dataURLtoBlob', () => {
  it('is assigned to mapp.utils', () => {
    expect(mapp.utils.dataURLtoBlob).toBe(dataURLtoBlob);
  });

  it('decodes a base64 data URL', async () => {
    const blob = dataURLtoBlob(`data:text/plain;base64,${btoa('hello')}`);

    expect(blob.type).toBe('text/plain');
    expect(await blob.text()).toBe('hello');
  });

  it('decodes binary base64 data', async () => {
    const bytes = [0, 127, 128, 255];

    const blob = dataURLtoBlob(
      `data:application/octet-stream;base64,${btoa(String.fromCharCode(...bytes))}`,
    );

    expect([...new Uint8Array(await blob.arrayBuffer())]).toEqual(bytes);
  });

  it('keeps the raw data of a data URL without base64 encoding', async () => {
    const blob = dataURLtoBlob('data:image/svg+xml,<svg></svg>');

    expect(blob.type).toBe('image/svg+xml');
    expect(await blob.text()).toBe('<svg></svg>');
  });
});
