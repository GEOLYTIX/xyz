import { describe, expect, it } from 'vitest';
import utils from '../../lib/utils/_utils.mjs';

describe('ui/utils', () => {
  it('is assigned to mapp.ui.utils', () => {
    expect(mapp.ui.utils).toBe(utils);

    expect(Object.keys(mapp.ui.utils).sort()).toEqual([
      'Json',
      'cssColour',
      'dataview',
      'dataviewDialog',
      'histogram',
      'idleLogout',
      'imagePreview',
      'layerJSE',
      'locationCount',
      'resizeHandler',
    ]);
  });
});
