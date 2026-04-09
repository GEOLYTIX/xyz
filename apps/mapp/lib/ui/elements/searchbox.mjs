/**
## /ui/elements/searchbox

Exports the searchbox(component) method as mapp.ui.elements.searchbox() to create a searchbox ui component.

@module /ui/elements/searchbox
*/

/**
@function searchbox

@description
Creates a searchbox input element which executes the provided searchFunction with the event argument on `input` and `focus` events.

@param {Object} component 
The component object to be decorated.
@param {Function} component.searchFunction 
The function to execute on input or focus events.
@param {HTMLElement} [component.target=<DIV>]
The target element to append to.

@returns {Object} 
The decorated component object.
*/

export default function searchbox(component = {}) {
  if (!(component.searchFunction instanceof Function)) {
    console.warn(
      `A searchFunction must be provided for the construction of a searchbox component.`,
    );
    return;
  }

  // Ensure the target is an HTMLElement before proceeding
  if (!(component.target instanceof HTMLElement)) {
    component.target = mapp.utils.html.node`<div>`;
  }

  component.name ??= 'searchbox-input';

  /**
  The search input element.
  @type {HTMLInputElement}
  */
  component.input = mapp.utils.html.node`
  <input
    name=${component.name}
    type="search"
    placeholder=${component.placeholder}
    aria-label=${component.placeholder}>`;

  /**
  The search results list element.
  @type {HTMLUListElement}
  */
  component.list = mapp.utils.html.node`<ul>`;

  /**
  The searchbox container element.
  @type {HTMLDivElement}
  */
  component.node = mapp.utils.html.node`
    <div class="searchbox">
      ${component.input}
      ${component.list}`;

  component.target.append(component.node);

  component.input.addEventListener('input', (e) => component.searchFunction(e));

  component.input.addEventListener('focus', (e) => component.searchFunction(e));

  return component;
}
