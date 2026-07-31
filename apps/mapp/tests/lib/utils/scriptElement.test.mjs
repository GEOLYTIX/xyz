/**
## /tests/lib/utils/scriptElement

The module is imported directly rather than through `mapp.utils.scriptElement`,
which the harness replaces with a throwing stub to keep tests off the network.

No script is ever inserted into the document. `document.head.append` is
intercepted so the element is captured instead of mounted, and the load and
error events are dispatched by hand. That keeps the test deterministic and stops
happy-dom attempting to resolve the src.

@module /tests/lib/utils/scriptElement
*/

import { describe, expect, it, vi } from 'vitest';
import scriptElement from '../../../lib/utils/scriptElement.mjs';
import { mockConsole } from '../../scaffold.mjs';

// scriptElement logs on every successful load.
mockConsole('log');

/**
@function interceptAppend

@description
Replaces `document.head.append` with a spy that captures elements without
mounting them.

@returns {Array} Elements passed to append while the spy is in place.
*/
function interceptAppend() {
  const appended = [];

  vi.spyOn(document.head, 'append').mockImplementation((element) => {
    appended.push(element);
  });

  return appended;
}

describe('utils/scriptElement', () => {
  it('appends a script element and resolves on load', async () => {
    const appended = interceptAppend();

    const promise = scriptElement('https://cdn.example/resolves.js');

    expect(appended).toHaveLength(1);

    const [script] = appended;

    expect(script.tagName).toEqual('SCRIPT');
    expect(script.src).toEqual('https://cdn.example/resolves.js');

    // Defaults to a module script.
    expect(script.type).toEqual('module');

    script.dispatchEvent(new Event('load'));

    await expect(promise).resolves.toBeUndefined();
  });

  it('applies the type argument', async () => {
    const appended = interceptAppend();

    const promise = scriptElement(
      'https://cdn.example/classic.js',
      'application/javascript',
    );

    expect(appended[0].type).toEqual('application/javascript');

    appended[0].dispatchEvent(new Event('load'));

    await promise;
  });

  it('appends a src only once and reuses the promise', async () => {
    const appended = interceptAppend();

    const first = scriptElement('https://cdn.example/cached.js');

    appended[0].dispatchEvent(new Event('load'));
    await first;

    const second = scriptElement('https://cdn.example/cached.js');

    // No second element: the cached promise is returned instead.
    expect(appended).toHaveLength(1);

    await expect(second).resolves.toBeUndefined();
  });

  it('rejects on an error event', async () => {
    const appended = interceptAppend();

    const promise = scriptElement('https://cdn.example/rejects.js');

    appended[0].dispatchEvent(new Event('error'));

    await expect(promise).rejects.toBeInstanceOf(Event);
  });
});
