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
@property {Array} params.entries Array of entry objects. Expected format: [{title: 'Title for Option 1', option: 'option1'}, ...]. `title` is displayed (falls back to `label` or `field`), `option` is the value passed as selected. Add property `selected: true` for an entry selected by default. Entries with an empty string option are removed.
@property {function} [params.callback] Called on selection. Multi select: callback(e, [...selectedOptions], entry). Single select: callback(e, entry). With pills or search the callback is called with the array of selected options.
@property {string} [params.placeholder=''] The placeholder for the list of options.
@property {string} [params.span] Fallback for the placeholder if not provided.
@property {boolean} [params.multi] Allow multiple choice if true.
@property {boolean} [params.multiple] Allow multiple choice if true using classic select with native multiple flag. This changes dropdown select into a scrollable list.
@property {boolean} [params.search] Replace the select with a search input and datalist of the entries.
@property {boolean} [params.pills] Add selected entries as pills to a pills element above the dropdown.
@property {string} [params.field] The field used to create a unique datalist id for the search input.
@property {boolean} [params.keepPlaceholder] set this flag to `true` in order to keep the original placeholder after an option is selected.
@property {string} [params.data_id='dropdown'] The data-id attribute for the select element.

@returns {HTMLElement} The dropdown node with the pills container [optional] and either the search input or select element.
*/
export default function dropdown(params) {
  params.selectedTitles = new Set();
  params.selectedOptions = new Set();

  params.placeholder ??= params.span || '';

  params.entries = params.entries?.filter?.((entry) => entry.option !== '');

  pillsElement(params);

  //Assign the search element if specified
  searchInput(params);

  params.options = optionElements(params);

  // Create a string of title in set.
  const selectedTitles = params.selectedTitles.size
    ? Array.from(params.selectedTitles).join(', ')
    : params.placeholder;

  const placeholderText = params.keepPlaceholder
    ? params.placeholder
    : selectedTitles;

  params.placeHolderOption = mapp.utils.html.node`
    <option style="display: none;" value="" disabled selected>${placeholderText}`;

  params.options.unshift(params.placeHolderOption);

  params.data_id ??= 'dropdown';

  params.select = mapp.utils.html.node`<select
    class="select-dropdown"
    data-id=${params.data_id}
    onfocus=${selectReset}
    onblur=${selectReset}
    onchange=${(e) => selectOnChange(e, params)}>
    ${params.options}`;

  if (params.multiple) params.select.multiple = true;

  params.node = mapp.utils.html.node`
    ${params.pills?.container}
    ${params.search || params.select}`;

  return params.node;
}

/**
@function selectReset

@description
Resets the selectedIndex of the select element to the placeholder option on focus and blur.

@param {Event} e The focus or blur event from the select element.
*/
function selectReset(e) {
  e.target.selectedIndex = 0;
}

/**
@function selectOnChange

@description
The change event handler for the select element.

The selectedIndex is reset to the placeholder option. Entries in a multi select dropdown are toggled, added to or removed from the selected sets and pills, and the callback is called with the array of selected options and the entry. The placeholder text is updated with the selected titles unless pills or keepPlaceholder are set.

Single select entries can not be unselected. The callback is called with the selected entry.

@param {Event} e The change event from the select element.
@param {Object} params The dropdown element object.
@property {Array} params.entries The entries available to the dropdown.
@property {Array} params.options The option elements including the placeholder option at index 0.
@property {boolean} [params.multi] Allow multiple choice if true.
@property {Object} [params.pills] The pills element.
@property {boolean} [params.keepPlaceholder] Keep the original placeholder after an option is selected.
@property {HTMLElement} params.placeHolderOption The placeholder option element.
@property {function} [params.callback] The callback method for the selection.
*/
function selectOnChange(e, params) {
  const selectedIndex = e.target.selectedIndex;

  // reset selectedIndex on target to the placeholder option.
  e.target.selectedIndex = 0;

  const entry = params.entries[selectedIndex - 1];

  entry.selected = !entry.selected;

  if (params.multi) {
    const toggle = params.options[selectedIndex].classList.toggle('selected');

    if (toggle) {
      params.selectedTitles.add(entry.title);
      params.selectedOptions.add(entry.option);
      params.pills?.add(entry.title);
    } else {
      params.selectedTitles.delete(entry.title);
      params.selectedOptions.delete(entry.option);
      params.pills?.remove(entry.title);
    }

    if (!params.pills && !params.keepPlaceholder) {
      // join selectedTitles set
      const placeholderTitles =
        params.selectedTitles?.size &&
        Array.from(params.selectedTitles).join(', ');

      params.placeHolderOption.textContent =
        placeholderTitles || params.placeholder;
    }

    params.callback?.(e, [...params.selectedOptions], entry);

    // return if params.multi
    return;
  }

  // Single select options can not be unselected.
  params.options.forEach((option) => {
    option.classList.remove('selected');
    option.style.backgroundColor = 'var(--color-base-secondary)';
  });

  params.options[selectedIndex].classList.add('selected');
  params.options[selectedIndex].style.removeProperty('background-color');

  if (!params.keepPlaceholder) {
    params.placeHolderOption.textContent = entry.title;
  }

  params.callback?.(e, entry);
}

/**
@function optionElements

@description
Creates an option element for each entry and assigns the element as entry.li property. Entries flagged as selected get the selected class and are added to the selected sets and pills.

@param {Object} params The dropdown element object.
@property {Array} params.entries The entries available to the dropdown.
@property {Set} params.selectedTitles A set of titles from currently selected dropdown items.
@property {Set} params.selectedOptions A set of options from currently selected dropdown items.
@property {Object} [params.pills] The pills element.

@returns {Array<HTMLElement>} Array of option elements.
*/
function optionElements(params) {
  const options = params.entries.map((entry) => {
    entry.li = mapp.utils.html.node`<option
        value=${entry.option}>
        ${entry.title || entry.label || entry.field}`;

    // The entry is already selected during creation of dropdown.
    if (entry.selected) {
      entry.li.classList.add('selected');
      params.selectedTitles.add(entry.title);
      params.selectedOptions.add(entry.option);

      // create pill
      params.pills?.add(entry.title);
    }

    return entry.li;
  });

  return options;
}

/**
@function pillsElement

@description
Assign a pills element to the params.pills property. Removing a pill unselects the matching entry and option element.

@param {Object} params The dropdown element object.
@property {boolean} [params.pills] The pills element will be assigned to the flag property.
@property {Array} params.entries The entries available to the dropdown.
@property {Array} params.options The option elements including the placeholder option at index 0.
@property {Set} params.selectedTitles A set of titles from currently selected dropdown items.
@property {Set} params.selectedOptions A set of options from currently selected dropdown items.
@property {function} [params.callback] Called with the array of pills when a pill is added or removed.
*/
function pillsElement(params) {
  if (!params.pills) return;

  params.pills = mapp.ui.elements.pills({
    addCallback: (val, pills) => {
      params.callback?.(null, [...pills]);
    },
    pills: [...params.selectedTitles],
    removeCallback: (val, pills) => {
      const entry = params.entries.findIndex((entry) => entry.option === val);

      // Add one to the index to account for the placeholder option.
      const index =
        params.entries.findIndex((entry) => entry.option === val) + 1;

      // Remove the selected class from the option element and entry
      params.entries.find((entry) => entry.option === val).selected = false;
      params.options[index].classList.remove('selected');

      params.selectedTitles.delete(entry.title);
      params.selectedOptions.delete(entry.option);

      params.callback?.(null, [...pills]);
    },
  });
}

/**
@function searchInput

@description
Assign a search input with a datalist of the entries to the params.search property.

@param {Object} params The dropdown element object.
@property {boolean} [params.search] The search element will be assigned to the flag property.
@property {Array} params.entries The entries available to the dropdown.
@property {string} [params.field] The field used to create a unique datalist id.
@property {string} [params.placeholder='Enter search term...'] The placeholder for the search input.

@returns {HTMLElement} The search input and its datalist. Undefined if params.search is falsy.
*/
function searchInput(params) {
  if (!params.search) return;

  const listId = `${params.field}-search-options`;

  const placeholder = params.placeholder || 'Enter search term...';

  const searchInput = mapp.utils.html.node`<input
    placeholder=${placeholder}
    type="search" list=${listId}
    onInput=${(e) => onSearchInput(e, params)}
    onfocus="this.placeholder=''"
    onblur=${(e) => (e.target.placeholder = placeholder)}>`;

  params.searchOptions = [];
  for (const entry of params.entries) {
    const option = mapp.utils.html.node`
      <option value=${entry.option} data-title=${entry.title}>${entry.title}`;
    params.searchOptions.push(option);
  }
  const datalist = mapp.utils.html
    .node`<datalist id=${listId}>${params.searchOptions}`;

  params.search = mapp.utils.html.node`${searchInput}${datalist}`;

  return params.search;
}

/**
@function onSearchInput

@description
The input event handler for the search input element.

Typed keystrokes are ignored to prevent an exact match being selected while typing, e.g. selecting `1` before `10` can be entered. Only the selection of a datalist option [inputType undefined or 'insertReplacementText'] is processed.

The entry with a title matching the input value is toggled, added to or removed from the selected sets and pills. The input value is cleared. The callback is called with the array of selected options if no pills element is assigned; otherwise the pills element calls the callback.

@param {Event} e The input event from the search element.
@param {Object} params The dropdown element object.
@property {Array} params.entries The entries available to the dropdown.
@property {Set} params.selectedTitles A set of titles from currently selected dropdown items.
@property {Set} params.selectedOptions A set of options from currently selected dropdown items.
@property {Object} [params.pills] The pills element.
@property {function} [params.callback] The callback method for the selection.
*/
function onSearchInput(e, params) {
  if (e.inputType && e.inputType !== 'insertReplacementText') {
    return;
  }

  params.entries.forEach((entry) => {
    if (entry.title === e.target.value) {
      entry.selected = !entry.selected;

      if (entry.selected) {
        params.selectedTitles.add(entry.title);
        params.selectedOptions.add(entry.option);
        params.pills?.add(entry.title);
      } else {
        params.selectedTitles.delete(entry.title);
        params.selectedOptions.delete(entry.option);
        params.pills?.remove(entry.title);
      }

      e.target.value = '';
      e.target.dispatchEvent(new Event('blur'));

      // The pills method will fire a callback method for the option.
      if (!params.pills) {
        params.callback?.(e, [...params.selectedOptions]);
      }
    }
  });
}
