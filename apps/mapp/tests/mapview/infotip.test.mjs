import { describe, expect, it, vi } from 'vitest';
import { createMapview, getLocale } from '../helpers.mjs';

/**
Creates a mapview with a pointer position. The position is assigned on pointermove in the mapview.Map.
*/
async function mapview(locale) {
  locale ??= await getLocale('smoke');

  const view = await createMapview(locale, { lat: 51.5, lng: -0.1, z: 10 });

  view.position = view.Map.getView().getCenter();
  view.pointerLocation = { x: 400, y: 300 };

  return view;
}

function infotipNode(view) {
  return view.Map.getTargetElement().querySelector('.infotip');
}

describe('mapview infotip', () => {
  it('renders string content above the pointer location', async () => {
    const view = await mapview();

    view.infotip('Lidl Walworth Road');

    const node = infotipNode(view);

    expect(node.textContent).toBe('Lidl Walworth Road');
    expect(node.style.opacity).toBe('1');
    expect(node.style.left).toBe(`${400 - node.offsetWidth / 2}px`);
    expect(node.style.top).toBe(`${300 - node.offsetHeight - 15}px`);
  });

  it('follows the pointer location on pointermove', async () => {
    const view = await mapview();

    view.infotip('tip');

    // The mapview pointermove listener assigns the position and pointerLocation.
    view.Map.dispatchEvent({
      type: 'pointermove',
      coordinate: [0, 0],
      originalEvent: { clientX: 100, clientY: 200 },
    });

    expect(view.position).toEqual([0, 0]);
    expect(view.pointerLocation).toEqual({ x: 100, y: 200 });

    const node = infotipNode(view);

    expect(node.style.left).toBe(`${100 - node.offsetWidth / 2}px`);
  });

  it('renders an element as content', async () => {
    const view = await mapview();

    const content = mapp.utils.html.node`<div class="custom-tip">custom`;

    view.infotip(content);

    expect(content.parentElement).toBe(view.Map.getTargetElement());
  });

  it('replaces the current infotip', async () => {
    const view = await mapview();

    view.infotip('first');
    view.infotip('second');

    const nodes = view.Map.getTargetElement().querySelectorAll('.infotip');

    expect([...nodes].map((node) => node.textContent)).toEqual(['second']);
  });

  it('removes the infotip with null content', async () => {
    const view = await mapview();

    view.infotip('tip');
    view.infotip(null);

    expect(infotipNode(view)).toBeNull();
  });

  it('removes the infotip on mouseout of the map target', async () => {
    const view = await mapview();

    view.infotip('tip');

    view.Map.getTargetElement().dispatchEvent(new MouseEvent('mouseout'));

    expect(infotipNode(view)).toBeNull();
    expect(view.position).toBeNull();
  });

  it('does not render without a pointer position', async () => {
    const view = await mapview();

    view.position = null;

    view.infotip('tip');

    expect(infotipNode(view)).toBeNull();
  });

  it('warns and does not render object content', async () => {
    const view = await mapview();

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    view.infotip({ name: 'object' });

    expect(warn).toHaveBeenCalledWith(
      'Content type object cannot be rendered in infotip: {"name":"object"}',
    );
    expect(infotipNode(view)).toBeNull();

    warn.mockRestore();
  });

  it('warns about potential XSS with the locale xss_check', async () => {
    const locale = await getLocale('smoke');

    const view = await mapview({ ...locale, xss_check: true });

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    view.infotip('alert(1)');

    expect(warn).toHaveBeenCalledWith(
      'Potential XSS detected in infotip content alert(1)',
    );

    // The content is rendered after the warning.
    expect(infotipNode(view).textContent).toBe('alert(1)');

    warn.mockRestore();
  });
});
