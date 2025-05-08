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
@property {boolean} [params.dropdown_search] Specify wether a searchbox is supplied in a dropdown filter.
@property {boolean} [params.keepPlaceholder] set this flag to `true` in order to keep the original placeholder after an option is selected.
@property {boolean} [params.pills] Applies pills component to show selected values.Available for mutliple choice.
@property {Object} [params.entries] Array of option elements. Expected format: [{title: 'Title for Option 1', option: 'option1'}, ...]. Add property `selected: true` for entry selected by default. `title` will appear as the description, `option` is a value passed as selected.
@property {function} [params.headerOnClick] Callback to execute when a header is clicked. Overrides default function.
@property {Number} [params.maxHeight] Optional max height property on results unordered list <ul> in pixels. Defaults to 500px in dropdown stylesheet.

@returns {HTMLElement} HTML dropdown element
*/
export default function dropdown(params) {
  params.selectedTitles = new Set();
  params.selectedOptions = new Set();

  if (params.span) {
    params.placeholder = params.span;
  }

  params.pills &&= mapp.ui.elements.pills({
    addCallback: (val, pills) => {
      params.callback?.(null, [...pills]);
    },
    pills: [...params.selectedTitles],
    removeCallback: (val, pills) => {
      // Find li element matching the val.
      const li = Array.from(params.ul.children).find(
        (li) => li.getAttribute('data-value') === val.toString(),
      );

      li.classList.remove('selected');
      params.selectedTitles.delete(li.title);
      params.selectedOptions.delete(li.dataset.option);

      params.callback?.(null, [...pills]);
    },
  });

  params.ul = ulElement(params);

  params.headerOnClick ??= headerOnClick;

  const headerSpan = params.keepPlaceholder
    ? params.placeholder
    : // join selected titles if available.
      (params.selectedTitles.size > 0 &&
        Array.from(params.selectedTitles).join(', ')) ||
      params.placeholder;

  if (params.dropdown_search) {
    params.node = mapp.utils.html`
    ${params.pills?.container}
      <div class="dropdown" onclick=${(e) => params.headerOnClick(e)}>
        <input
          type="text"
          data-id=${params.data_id || 'dropdown'}
          class="head"
          onfocus=${(e) => {
            e.target.value = '';
            filterResults(e, params);
          }}
          oninput=${(e) => filterResults(e, params)}
          placeholder=${params.placeholder}>
        ${params.ul}
      </div>`;
  } else {
    params.node = mapp.utils.html`
    ${params.pills?.container}
    <button
      onblur=${(e) => {
        // hide results list when button out of focus
        e.target.classList.remove('active');
      }}
      data-id=${params.data_id || 'dropdown'}
      class="dropdown">
      <div class="head" onclick=${params.headerOnClick}>
        <span>${headerSpan}</span>
        <span class="material-symbols-outlined"></span>
      </div>
      ${params.ul}`;
  }

  return params.node;
}

/**
@function filterResults

@description
filters the options visible in a dropdown, by applying a regex match to the value.

@param {HTMLElement} e The input element.
@param {Object} params The config for the dropdown object.
@property {HTMLElement} params.ul The list of available options
*/
function filterResults(e, params) {
  //Get the lower case of the term
  const term = e.target ? e.target.value.toLowerCase() : e.value.toLowerCase();

  Array.from(params.ul.querySelectorAll('li')).forEach((li) => {
    const li_value = li.getAttribute('data-value').toString().toLowerCase();
    li.style.display = li_value.match(term) ? '' : 'none';
  });
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
  params.liOnClick ??= liOnClick;

  // Create array of li elements for ul;
  const li_elements = params.entries.map((entry) => {
    const li = mapp.utils.html.node`<li
      data-value=${entry.option}
      onclick=${(e) => params.liOnClick(e, entry)}>
      ${entry.title || entry.label || entry.field}`;

    // The entry is already selected during creation of dropdown.
    if (entry.selected) {
      li.classList.add('selected');
      params.selectedTitles.add(entry.title);
      params.selectedOptions.add(entry.option);

      // create pill
      params.pills?.add(entry.title);
    }

    return li;
  });

  const ul = mapp.utils.html.node`<ul>${li_elements}`;

  if (params.maxHeight) ul.style.maxHeight = `${params.maxHeight}px`;

  return ul;

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

    const dropdown = li.closest('.dropdown');

    const headerSpan = dropdown.querySelector('.head > span');

    const input = dropdown.querySelector('input');

    if (params.multi) {
      li.classList.toggle('selected');

      // Add or remove title and option value from sets.
      if (li.classList.contains('selected')) {
        params.selectedTitles.add(entry.title);
        params.selectedOptions.add(entry.option);

        params.pills?.add(entry.title);

        if (input) {
          input.value = '';
          filterResults(input, params);
        }
        //Set the value of the input box equal to the selected one
      } else {
        params.selectedTitles.delete(entry.title);
        params.selectedOptions.delete(entry.option);

        params.pills?.remove(entry.title);
      }

      if (!params.pills && !params.dropdown_search) {
        headerSpan.textContent =
          // join selected titles if available.
          (params.selectedTitles.size > 0 &&
            Array.from(params.selectedTitles).join(', ')) ||
          params.placeholder;
      }

      params.callback?.(e, [...params.selectedOptions]);

      // return if params.multi
      return;
    }

    if (!params.keepPlaceholder) {
      headerSpan.textContent = entry.title;
    }

    dropdown.classList.remove('active');

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

  const dropdown = e.target.closest('.dropdown');

  const active = dropdown.classList.toggle('active');

  if (active === false) return;

  // Only one dropdown should be active in the document.
  Array.from(document.querySelectorAll('.dropdown'))
    .filter((otherDropdown) => otherDropdown !== dropdown)
    .forEach((otherDropdown) => otherDropdown.classList.remove('active'));

  const ul = this.ul || dropdown.querySelector('ul');

  // Calculate the difference between the bottom of the dropdown and the viewport height.
  const viewDiff =
    document.body.getBoundingClientRect().height -
    header.getBoundingClientRect().bottom;

  // Set the width of the ul to the width of the button.
  ul.style.width = `${header.offsetWidth}px`;

  if (viewDiff < 150) {
    // If the difference is less than 150px, reverse the dropdown.
    dropdown.classList.add('dropdown-reverse');

    // If the difference is greater than 150px, check if the dropdown is reversed and remove the class.
  } else {
    dropdown.classList.remove('dropdown-reverse');
  }
}
