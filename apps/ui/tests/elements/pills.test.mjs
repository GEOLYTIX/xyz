import { describe, expect, it, vi } from 'vitest';

const { pills, searchbox } = mapp.ui.elements;

function values(component) {
  return [...component.container.querySelectorAll('.pill')].map(
    (pill) => pill.dataset.value,
  );
}

describe('ui/elements/pills', () => {
  it('creates a pill for each value', () => {
    const component = pills({ pills: ['a', 'b'] });

    expect(component.container.classList).toContain('pill-container');
    expect(values(component)).toEqual(['a', 'b']);
    expect([...component.pills]).toEqual(['a', 'b']);
  });

  it('creates a container without pills', () => {
    const component = pills();

    expect(values(component)).toEqual([]);
    expect(component.pills.size).toBe(0);
  });

  it('appends the container to the target', () => {
    const target = document.createElement('div');

    const component = pills({ target });

    expect(component.container.parentElement).toBe(target);
  });

  it('adds a pill and calls the addCallback', () => {
    const addCallback = vi.fn();

    const component = pills({ addCallback });

    component.add('c');

    expect(values(component)).toEqual(['c']);
    expect(addCallback).toHaveBeenCalledWith('c', component.pills);
  });

  it('doesn’t add a remove button without removeCallback', () => {
    const component = pills({ pills: ['a'] });

    expect(component.container.querySelector('button')).toBeNull();
  });

  it('removes a pill with its remove button', () => {
    const removeCallback = vi.fn();

    const component = pills({ pills: ['a', 'b'], removeCallback });

    component.container.querySelector('[data-value=a] button').click();

    expect(values(component)).toEqual(['b']);
    expect([...component.pills]).toEqual(['b']);
    expect(removeCallback).toHaveBeenCalledWith('a', component.pills);
  });

  it('removes a numeric pill by its string value', () => {
    const component = pills({ pills: [1, 2] });

    component.remove(1);

    expect(values(component)).toEqual(['2']);
    expect([...component.pills]).toEqual([2]);
  });
});

describe('ui/elements/searchbox', () => {
  it('creates a search input and a results list in the target', () => {
    const target = document.createElement('div');

    const component = searchbox({
      target,
      placeholder: 'Search',
      searchFunction: () => {},
    });

    expect(component.node.parentElement).toBe(target);
    expect(component.node.classList).toContain('searchbox');
    expect(component.input.type).toBe('search');
    expect(component.input.name).toBe('searchbox-input');
    expect(component.input.placeholder).toBe('Search');
    expect(component.input.getAttribute('aria-label')).toBe('Search');
    expect(component.list.tagName).toBe('UL');
  });

  it('creates a target without an HTMLElement target', () => {
    const component = searchbox({ searchFunction: () => {} });

    expect(component.target).toBeInstanceOf(HTMLDivElement);
    expect(component.target.contains(component.node)).toBe(true);
  });

  it('calls the searchFunction on input and focus', () => {
    const searchFunction = vi.fn();

    const component = searchbox({ searchFunction });

    component.input.value = 'lon';
    component.input.dispatchEvent(new Event('input'));
    component.input.dispatchEvent(new Event('focus'));

    expect(searchFunction).toHaveBeenCalledTimes(2);
    expect(searchFunction.mock.calls[0][0].target.value).toBe('lon');
  });

  it('warns and returns undefined without a searchFunction', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(searchbox({})).toBeUndefined();
    expect(warn).toHaveBeenCalledWith(
      'A searchFunction must be provided for the construction of a searchbox component.',
    );

    warn.mockRestore();
  });
});
