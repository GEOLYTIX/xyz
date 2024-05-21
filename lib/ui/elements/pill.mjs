/**
### mapp.ui.elements.pill()
Module that returns a pill UI element used in mapp.
@module /ui/elements/pill
*/

/**
Creates a searchbox component.
@function pill
@param {Object} component The config object argument.
@param {HTMLElement} pill.target The target element to append to.
@param {Object} pill.pills array of values to be initially selected
@param {Function} [pill.addCallback] function to execute once a pill has been added. Takes as arguments added value and array of selected values
@param {Function} [pill.removeCallback] function to execute once a pill has been removed. Takes as arguments removed value and array of selected values
@returns {Object} The decorated object argument.
*/

mapp.utils.merge(mapp.dictionaries, {
  en: {
    pill_component_remove: 'Remove'
  }
});

export default (component = {}) => {

  component.container = mapp.utils.html.node`<div class="pill-container">`

  // Create set from pills array.
  component.pills = Array.isArray(component.pills) ? new Set(component.pills) : new Set();

  component.add = val => {

    const pill = mapp.utils.html.node`<div
      class="pill"
      style=${component.css_pill}
      title="${val}">${val}`

    // Only append the remove button to pill if configured.
    if (component.removeCallback) pill.append(mapp.utils.html.node`<button
      data-value="${val}"
      title="${mapp.dictionary.pill_component_remove}"
      class="primary-background"
      onclick=${e => {
          
        // remove pill
        e.target.parentNode.remove();

        // remove pill from selection
        component.pills.delete(val);

        // execute removeCallback if defined
        if (typeof component.removeCallback === 'function') component.removeCallback(val, component.pills);            
      }}>&#10005;`)

    // add pill
    component.container.append(pill); 

    if (typeof component.addCallback === 'function') {

      // execute add callback if exists
      component.addCallback(val, component.pills);
    } 
  }

  // create pills for values passed initially
  component.pills.forEach(pill => component.add(pill));

  // Append container to component target if instanceof HTMLElement
  if (component.target instanceof HTMLElement) {
    component.target.append(component.container);
  };

  return component;
};
