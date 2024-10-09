/**
## /ui/elements/dropdown

The dropdown elements module exports the dropdown method to create a dropdown element group from a params argument.

@requires /ui/elements/pills

@module /ui/elements/dropdown
*/

/**
@function dropdown

@description
The dropdown method returns a dropdown element created from the params argument.

@param {Object} params Parameter for the creation of the dropdown element.
@property {string} [params.placeholder=''] The placeholder for the list of options.
@property {string} [params.span] Alternative property for the placeholder.
@property {boolean} [params.multi] Allow multiple choice if true.
@property {boolean} [params.keepPlaceholder] set this flag to `true` in order to keep the original placeholder after an option is selected.
@property {boolean} [params.pills] Applies pills component to show selected values.Available for mutliple choice.
@property {Object} [params.entries] Array of option elements. Expected format: [{title: 'Title for Option 1', option: 'option1'}, ...]. Add property `selected: true` for entry selected by default. `title` will appear as the description, `option` is a value passed as selected.
@property {function} [params.headerOnClick] Callback to execute when a header is clicked. Overrides default function.

@returns {HTMLElement} HTML dropdown element
*/
export default (params) => {

  params.selectedTitles = new Set()
  params.selectedOptions = new Set()

  if (params.span) {

    params.placeholder = params.span
  }

  params.pills &&= mapp.ui.elements.pills({
    pills: [...params.selectedTitles],
    addCallback: (val, pills) => {
      params.callback?.(null, [...pills]);
    },
    removeCallback: (val, pills) => {

      // Find li element matching the val.
      const li = Array.from(params.ul.children)
        .find(li => li.getAttribute('data-value') === val.toString());

      li.classList.remove('selected');
      params.selectedTitles.delete(li.title);
      params.selectedOptions.delete(li.dataset.option);

      params.callback?.(null, [...pills]);
    }
  });

  params.ul = ulElement(params)

  params.headerOnClick ??= headerOnClick

  const headerSpan = params.keepPlaceholder
    ? params.placeholder

    // join selected titles if available.
    : params.selectedTitles.size > 0
    && Array.from(params.selectedTitles).join(', ')
    || params.placeholder

  params.node = mapp.utils.html.node`
    ${params.pills?.container}
    <button
      data-id=${params.data_id || 'dropdown'}
      class="dropdown">
      <div class="head" onclick=${params.headerOnClick}>
        <span>${headerSpan}</span>
        <div class="icon"></div>
      </div>
      ${params.ul}`;

  return params.node
}

/**
@function ulElement

@description
Create a <ul> element with nested <li> elements for a dropdown.

@param {Object} params Parameter for the creation of the dropdown element.
@property {function} [params.liOnClick] Callback to execute when an element in the list is clicked. Overrrides default function.

@returns {HTMLElement} <ul> element for dropdown.
*/
function ulElement(params) {

  params.liOnClick ??= liOnClick

  // Create array of li elements for ul;
  const li_elements = params.entries.map((entry) => {

    const li = mapp.utils.html.node`<li
      data-value=${entry.option}
      onclick=${(e) => params.liOnClick(e, entry)}>
      ${entry.title || entry.label || entry.field}`

    // The entry is already selected during creation of dropdown.
    if (entry.selected) {
      li.classList.add('selected')
      params.selectedTitles.add(entry.title)
      params.selectedOptions.add(entry.option)

      // create pill
      params.pills?.add(entry.title)
    }

    return li
  })

  return mapp.utils.html.node`<ul>${li_elements}`

  /**
  @function liOnClick

  @description
  The default on click event methods for li elements in a dropdown list.

  @param {event} e Click event.
  @param {Object} entry Object associated with li element.
  @property {HTMLElement} e.target The li element.
  @property {string} [entry.title = entry.option] Text shown in li element.
  @property {string} entry.option Value associated with li element.
  */
  function liOnClick(e, entry) {

    const li = e.target;

    const dropdown = li.closest('button.dropdown');

    const headerSpan = dropdown.querySelector('.head > span')

    if (params.multi) {

      li.classList.toggle('selected')

      // Add or remove title and option value from sets.
      if (li.classList.contains('selected')) {
        params.selectedTitles.add(entry.title)
        params.selectedOptions.add(entry.option)

        params.pills?.add(entry.title)

      } else {
        params.selectedTitles.delete(entry.title)
        params.selectedOptions.delete(entry.option)

        params.pills?.remove(entry.title);
      }

      if (!params.pills) {

        headerSpan.textContent =
          // join selected titles if available.
          params.selectedTitles.size > 0
          && Array.from(params.selectedTitles).join(', ')
          || params.placeholder
      }

      params.callback?.(e, [...params.selectedOptions])

      // return if params.multi
      return;
    }

    if (!params.keepPlaceholder) {

      headerSpan.textContent = entry.title;
    }

    dropdown.classList.remove('active')

    params.callback?.(e, entry);
  }
}

/**
@function headerOnClick

@description
The headerOnClick method handles the click event for the dropdown header.

The active class will be toggled on the dropdown element.

The active class of all other dropdown in the document will be removed if event target is toggled to active.

The size and position of the dropdown and it's ul child element will be determined from the document body viewport as well the dropdown elements.

@param {Event} e Click event
*/
function headerOnClick(e) {

  const header = e.target;

  const dropdown = e.target.closest('button.dropdown')

  const active = dropdown.classList.toggle('active');

  if (active === false) return;

  // Only one dropdown should be active in the document.
  Array.from(document.querySelectorAll('button.dropdown'))
    .filter(otherDropdown => otherDropdown !== dropdown)
    .forEach(otherDropdown => otherDropdown.classList.remove('active'));

  const ul = dropdown.querySelector('ul')

  // Calculate the difference between the bottom of the dropdown and the viewport height.
  const viewDiff = document.body.getBoundingClientRect().height - header.getBoundingClientRect().bottom;

  // Set the maxHeight of the ul to the difference.
  ul.style.maxHeight = `${viewDiff}px`

  // Set the width of the ul to the width of the button.
  ul.style.width = `${header.offsetWidth}px`

  if (viewDiff < 150) {

    // If the difference is less than 150px, reverse the dropdown.
    dropdown.classList.add('dropdown-reverse')

    ul.style.maxHeight = `150px`

    // If the difference is greater than 150px, check if the dropdown is reversed and remove the class.
  } else {

    // Set the maxHeight of the ul to the difference.
    ul.style.maxHeight = `${viewDiff}px`

    dropdown.classList.remove('dropdown-reverse');
  }
}
