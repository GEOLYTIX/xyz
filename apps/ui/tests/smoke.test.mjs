import { describe, expect, it } from 'vitest';

describe('Smoke', () => {
  it('loads the MAPP and MAPP.UI libraries', () => {
    expect(ol.util.VERSION).toBeTruthy();
    expect(mapp.version).toBeTruthy();
    expect(mapp.ui).toBe(globalThis.ui);
    expect(mapp.host).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/);
  });

  it('replaces the mapp alert, confirm and drawLegend methods', () => {
    expect(mapp.utils.alert).toBe(mapp.ui.elements.alert);
    expect(mapp.utils.confirm).toBe(mapp.ui.elements.confirm);
    expect(mapp.layer.drawLegend).toBe(mapp.ui.layers.drawLegend);
  });

  it('assigns the ui plugins to mapp.plugins', () => {
    expect(mapp.plugins.zoomBtn).toBe(mapp.ui.plugins.zoomBtn);
  });
});
