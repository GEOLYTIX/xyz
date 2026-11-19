import { describe, expect, it } from 'vitest';

const { imagePreview } = mapp.ui.utils;

// A 1x1 transparent gif.
const SRC =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

describe('ui/utils/imagePreview', () => {
  it('adds a preview of the image to the body and removes it on close', () => {
    imagePreview({ target: { src: SRC } });

    const mask = document.body.querySelector(':scope > .interface-mask');

    expect(mask).not.toBeNull();

    const image = mask.querySelector('.bg-image');

    expect(image.style.backgroundImage).toBe(`url("${SRC}")`);

    mask.querySelector('.btn-close').click();

    expect(mask.isConnected).toBe(false);
    expect(document.querySelector('.interface-mask')).toBeNull();
  });
});
