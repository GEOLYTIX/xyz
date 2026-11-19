import { afterEach, describe, expect, it, onTestFinished } from 'vitest';

const { resizeHandler } = mapp.ui.utils;

// The window of the test page is 1024 x 768.
const WIDTH = globalThis.innerWidth;
const HEIGHT = globalThis.innerHeight;

/**
@function handler

@description
Creates a resize target element in the document body and adds a resizeHandler to the target. The target is removed when the test finishes.

@param {Object} [params] The resizeHandler params.
@returns {Object} The resizeHandler params with the target.
*/
function handler(params = {}) {
  const target = document.createElement('div');

  document.body.append(target);

  onTestFinished(() => target.remove());

  params.target = target;

  resizeHandler(params);

  return params;
}

/**
@function olElement

@description
Adds the #OL map element of the default view, which is resized with the Y axis by the implicit OL global. The element is removed when the test finishes.

@returns {HTMLElement} The #OL element.
*/
function olElement() {
  const OL = document.createElement('div');

  OL.id = 'OL';

  document.body.append(OL);

  onTestFinished(() => OL.remove());

  return OL;
}

function mouse(type, init) {
  return new MouseEvent(type, { bubbles: true, cancelable: true, ...init });
}

/**
Returns a touch event with a touch at the page coordinates.
*/
function touch(type, target, pageX, pageY) {
  return new TouchEvent(type, {
    bubbles: true,
    cancelable: true,
    touches: [new Touch({ identifier: 1, target, pageX, pageY })],
  });
}

/**
Drags the target to the client coordinates and releases the mouse.
*/
function drag(target, clientX, clientY) {
  target.dispatchEvent(mouse('mousedown'));
  globalThis.dispatchEvent(mouse('mousemove', { clientX, clientY }));
  globalThis.dispatchEvent(mouse('mouseup'));
}

afterEach(() => {
  // Removes the window listeners of a resize which has not been stopped.
  globalThis.dispatchEvent(mouse('mouseup'));
  globalThis.dispatchEvent(new TouchEvent('touchend'));

  document.body.removeAttribute('style');
});

describe('ui/utils/resizeHandler', () => {
  it('sets the grabbing cursor on mousedown and restores the cursor on mouseup', () => {
    const { target } = handler();

    target.dispatchEvent(mouse('mousedown'));

    expect(document.body.style.cursor).toBe('grabbing');

    globalThis.dispatchEvent(mouse('mouseup'));

    expect(document.body.style.cursor).toBe('auto');
  });

  it('prevents the default of the mousedown event', () => {
    const { target } = handler();

    const event = mouse('mousedown');

    target.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it('resizes the grid columns on the X axis', () => {
    const { target } = handler();

    target.dispatchEvent(mouse('mousedown'));

    globalThis.dispatchEvent(mouse('mousemove', { clientX: 300 }));

    expect(document.body.style.gridTemplateColumns).toBe('300px 10px auto');

    globalThis.dispatchEvent(mouse('mousemove', { clientX: 400 }));

    expect(document.body.style.gridTemplateColumns).toBe('400px 10px auto');
  });

  it('does not resize after mouseup', () => {
    const { target } = handler();

    drag(target, 300);

    globalThis.dispatchEvent(mouse('mousemove', { clientX: 400 }));

    expect(document.body.style.gridTemplateColumns).toBe('300px 10px auto');
  });

  it('snaps the X axis to half the window width', () => {
    const { target } = handler();

    drag(target, WIDTH - 100);

    expect(document.body.style.gridTemplateColumns).toBe(
      `${WIDTH / 2}px 10px auto`,
    );
  });

  it('does not resize the X axis below the lock size', () => {
    const { target } = handler();

    drag(target, 300);

    // The X lock size is 200.
    drag(target, 150);

    expect(document.body.style.gridTemplateColumns).toBe('300px 10px auto');
  });

  it('collapses the X axis below the min size', () => {
    const { target } = handler();

    // The X min size is 75.
    drag(target, 50);

    expect(document.body.style.gridTemplateColumns).toBe('0px 10px auto');

    // The collapsed X template is reset by the next resize above the lock size.
    drag(target, 300);

    expect(document.body.style.gridTemplateColumns).toBe('300px 10px auto');
  });

  it('resizes the grid rows and the #OL margin on the Y axis', () => {
    const OL = olElement();

    const { target } = handler({ axis: 'Y' });

    drag(target, 0, 468);

    expect(document.body.style.gridTemplateRows).toBe(
      `auto 10px ${HEIGHT - 468}px`,
    );

    expect(OL.style.marginTop).toBe(`-${(HEIGHT - 468) / 2}px`);

    // The Y lock size is 50.
    drag(target, 0, HEIGHT - 20);

    expect(document.body.style.gridTemplateRows).toBe(
      `auto 10px ${HEIGHT - 468}px`,
    );
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3109: the Y axis resize sets the margin of the #OL element through the implicit OL global of the element id. The resizeEvent throws a ReferenceError in a view without an #OL element.
  it.fails('resizes the Y axis without an #OL element', () => {
    const params = handler({ axis: 'Y' });

    params.resizeEvent(mouse('mousemove', { clientY: 468 }));

    expect(document.body.style.gridTemplateRows).toBe(
      `auto 10px ${HEIGHT - 468}px`,
    );
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3109: the comment says "Keep the height within 10 of the window height", but a height within 10 of the window height is set to the window height. The rows with the 10px resize bar are higher than the window.
  it.fails('keeps the Y axis height within 10 of the window height', () => {
    olElement();

    const { target } = handler({ axis: 'Y' });

    drag(target, 0, 5);

    expect(document.body.style.gridTemplateRows).toBe(
      `auto 10px ${HEIGHT - 10}px`,
    );
  });

  it('resizes with a touchmove after touchstart', () => {
    const { target } = handler();

    target.dispatchEvent(touch('touchstart', target, 300, 0));

    globalThis.dispatchEvent(touch('touchmove', target, 350, 0));

    expect(document.body.style.gridTemplateColumns).toBe('350px 10px auto');

    globalThis.dispatchEvent(new TouchEvent('touchend'));

    globalThis.dispatchEvent(touch('touchmove', target, 400, 0));

    expect(document.body.style.gridTemplateColumns).toBe('350px 10px auto');
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3109: the touchstart listener calls preventDefault, but is added as passive. The browser ignores preventDefault in a passive listener and logs a warning.
  it.fails('prevents the default of the touchstart event', () => {
    const { target } = handler();

    const event = touch('touchstart', target, 300, 0);

    target.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3109: the touch position is `e.touches?.[0]?.pageX || e.pageX`. A touch at pageX 0 falls back to the undefined pageX of the touch event, and the X size is undefined instead of 0. The grid template is set to the invalid 'undefinedpx 10px auto', which is ignored. The Y size of a touch at pageY 0 is NaN.
  it.fails('collapses the X axis for a touch at pageX 0', () => {
    const { target } = handler();

    target.dispatchEvent(touch('touchstart', target, 300, 0));

    globalThis.dispatchEvent(touch('touchmove', target, 0, 0));

    expect(document.body.style.gridTemplateColumns).toBe('0px 10px auto');
  });

  it('collapses the X axis on dblclick and restores the default grid', () => {
    document.body.style.display = 'grid';
    document.body.style.gridTemplateColumns = '333px 10px auto';

    const defaultGrid = getComputedStyle(document.body).gridTemplateColumns;

    const { target } = handler({ doubleClickClose: true });

    target.dispatchEvent(mouse('dblclick', { clientX: 333 }));

    expect(document.body.style.gridTemplateColumns).toBe('0px 10px auto');

    // The X size of the collapsed panel is below the min size.
    target.dispatchEvent(mouse('dblclick', { clientX: 5 }));

    expect(document.body.style.gridTemplateColumns).toBe(defaultGrid);
  });

  it('does not collapse on dblclick without doubleClickClose', () => {
    const { target } = handler();

    target.dispatchEvent(mouse('dblclick', { clientX: 300 }));

    expect(document.body.style.gridTemplateColumns).toBe('');
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3109: the Y min size is 0. The Y size of a dblclick in the window is never below 0, and a collapsed Y panel is collapsed again instead of restored.
  it.fails('restores a collapsed Y axis on dblclick', () => {
    document.body.style.display = 'grid';
    document.body.style.gridTemplateRows = 'auto 10px 300px';

    const { target } = handler({ axis: 'Y', doubleClickClose: true });

    target.dispatchEvent(mouse('dblclick', { clientY: HEIGHT - 300 }));

    expect(document.body.style.gridTemplateRows).toBe('auto 10px 0px');

    // The resize bar of the collapsed panel is at the bottom of the window.
    target.dispatchEvent(mouse('dblclick', { clientY: HEIGHT - 5 }));

    expect(document.body.style.gridTemplateRows).not.toBe('auto 10px 0px');
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3109: the default grids are stored in a module variable, which is overwritten by every resizeHandler call. A dblclick restores the grid at the time of the latest resizeHandler call, not the grid at the time the handler was added.
  it.fails('restores the default grid of the handler', () => {
    document.body.style.display = 'grid';
    document.body.style.gridTemplateColumns = '333px 10px auto';

    const defaultGrid = getComputedStyle(document.body).gridTemplateColumns;

    const { target } = handler({ doubleClickClose: true });

    // Another handler is added after the X axis was resized.
    document.body.style.gridTemplateColumns = '250px 10px auto';

    handler({ axis: 'Y' });

    target.dispatchEvent(mouse('dblclick', { clientX: 250 }));
    target.dispatchEvent(mouse('dblclick', { clientX: 5 }));

    expect(document.body.style.gridTemplateColumns).toBe(defaultGrid);
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3109: the resizeEvent returns without a reset of the module grid template after an axis is collapsed below the min size. The '0px' template of the collapsed X axis is used for the first row of the next Y resize, which collapses the map.
  it.fails(
    'does not collapse the map row after the X axis was collapsed',
    () => {
      olElement();

      const x = handler();
      const y = handler({ axis: 'Y' });

      drag(x.target, 50);

      expect(document.body.style.gridTemplateColumns).toBe('0px 10px auto');

      drag(y.target, 0, 468);

      expect(document.body.style.gridTemplateRows).toBe(
        `auto 10px ${HEIGHT - 468}px`,
      );
    },
  );
});
