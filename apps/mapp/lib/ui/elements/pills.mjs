/**
## /ui/elements/pills

Exports the pills(component) method as mapp.ui.elements.pills() to create a pills ui component.

Dictionary entries:
- pill_component_remove

@requires /dictionary 

@module /ui/elements/pills
*/

/**
@function pills

@description
Decorates the component object with add() and remove() methods before returning the component.

@param {Object} component 
The component object to be decorated.

@property {HTMLElement} component.target 
The target element to append to.
@property {Object} [component.pills]
array of values to be initially selected
@property {Function} [component.addCallback] 
Function to execute once a pill has been added. Takes as arguments added value and array of selected values.
@property {Function} [component.removeCallback] 
Function to execute once a pill has been removed. Takes as arguments removed value and array of selected values.

@returns {Object} 
The decorated component object.
*/
export default function pills(component = {}) {
  component.container = mapp.utils.html.node`<div class="pill-container">`;

  // Create set from pills array.
  component.pills = Array.isArray(component.pills)
    ? new Set(component.pills)
    : new Set();

  component.add = add;

  component.remove = remove;

  // create pills for values passed initially
  component.pills.forEach((pill) => component.add(pill));

  // Append container to component target if instanceof HTMLElement
  if (component.target instanceof HTMLElement) {
    component.target.append(component.container);
  }

  return component;
}

/**
@function add

@description
Adds a pill with the provided value to the pill component (this) and executes the component.addCallback() method if declared.

@param {string} val The pill value.
*/
function add(val) {
  const component = this;

  const pill = mapp.utils.html.node`<div
    class="pill"
    style=${component.css_pill}
    data-value=${val}
    title="${val}">${val}`;

  // Only append the remove button to pill if configured.
  if (component.removeCallback) {
    pill.append(mapp.utils.html
      .node`<button class="notranslate material-symbols-outlined close"
      data-value=${val}
      title=${mapp.dictionary.pill_component_remove}
      onclick=${(e) => {
        e.stopPropagation();
        component.remove(val);
      }}>`);
  }

  if (!component.pills.has(val)) {
    component.pills.add(val);
  }

  // add pill
  component.container.append(pill);

  if (typeof component.addCallback === 'function') {
    // execute add callback if exists
    component.addCallback(val, component.pills);
  }
}

/**
@function remove

@description
Removes a pill with the provided value to the pill component (this) and executes the component.removeCallback() method if declared.

@param {string} val The pill value.
*/
function remove(val) {
  const component = this;

  const pillElement = Array.from(component.container.children).find(
    (child) => child.getAttribute('data-value') === val.toString(),
  );

  pillElement?.remove();

  // remove pill from selection
  component.pills.delete(val);

  // execute removeCallback if defined
  if (typeof component.removeCallback === 'function') {
    component.removeCallback(val, component.pills);
  }
}
