/**
## /tests/lib/ui/elements/pills

@module /tests/lib/ui/elements/pills
*/

import { beforeEach, describe, expect, it } from 'vitest';

describe('ui/elements/pills', () => {
  let pills;

  beforeEach(() => {
    pills = mapp.ui.elements.pills();
  });

  it('builds a component with add, remove and a pills set', () => {
    expect(typeof pills.add).toEqual('function');
    expect(typeof pills.remove).toEqual('function');
    expect(pills.pills).toBeInstanceOf(Set);
  });

  it('adds a pill', () => {
    pills.add('pill');

    expect(pills.pills.size).toEqual(1);
    expect(pills.pills.has('pill')).toBe(true);
  });

  it('removes a pill', () => {
    pills.add('pill');
    pills.remove('pill');

    expect(pills.pills.size).toEqual(0);
  });

  it('holds each value once', () => {
    pills.add('pill');
    pills.add('pill');

    expect(pills.pills.size).toEqual(1);
  });

  it('calls back on add and on remove', () => {
    const added = [];
    const removed = [];

    const component = mapp.ui.elements.pills({
      addCallback: (value) => added.push(value),
      removeCallback: (value) => removed.push(value),
    });

    component.add('pill');
    component.remove('pill');

    expect(added).toEqual(['pill']);
    expect(removed).toEqual(['pill']);
  });

  it('renders a pill element per value in the container', () => {
    const component = mapp.ui.elements.pills();

    component.add('pill');

    expect(component.container.querySelectorAll('div.pill')).toHaveLength(1);

    component.remove('pill');

    expect(component.container.querySelectorAll('div.pill')).toHaveLength(0);
  });
});
