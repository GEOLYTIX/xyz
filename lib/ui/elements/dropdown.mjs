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
@property {boolean} [params.multi] Allow multiple choice if true.
@property {boolean} [params.multple] Allow multiple choice if true using classic select with native multiple flag. This changes dropdown select into a scrollable list.
@property {boolean} [params.dropdown_search] Specify wether a searchbox is supplied in a dropdown filter.
@property {boolean} [params.keepPlaceholder] set this flag to `true` in order to keep the original placeholder after an option is selected.
@property {Object} [params.entries] Array of option elements. Expected format: [{title: 'Title for Option 1', option: 'option1'}, ...]. Add property `selected: true` for entry selected by default. `title` will appear as the description, `option` is a value passed as selected.
@property {function} [params.headerOnClick] Callback to execute when a header is clicked. Overrides default function.
@property {Number} [params.maxHeight] Optional max height property on results unordered list <ul> in pixels. Defaults to 500px in dropdown stylesheet.

@returns {HTMLElement} HTML dropdown element
*/
export default function dropdown(params) {
  params.selectedTitles = new Set();
  params.selectedOptions = new Set();

  params.placeholder ??= params.span || '';

  params.entries = params.entries?.filter?.((entry) => entry.option !== '');

  pillsElement(params);

  //Assign the search element if specified
  searchInput(params);

  params.onChange ??= selectOnChange;

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

function selectReset(e) {
  e.target.selectedIndex = 0;
}

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

  if (!params.keepPlaceholder) {
    params.placeHolderOption.textContent = entry.title;
  }

  params.callback?.(e, entry);
}

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
Assign the params.pills property to the be a pills element.

@param {Object} params The dropdown element object.
@property {boolean} [params.pills] The pills element will be assigned to the flag property.
@property {set} params.selectedTitles A set of titles from currently selected dropdown items.
@property {set} params.selectedOptions A set of options from currently selected dropdown items.
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
@function search

@description
Assign the params.search property to the be a search element.

@param {Object} params The dropdown element object.
@property {set} params.selectedTitles A set of titles from currently selected dropdown items.
@property {set} params.selectedOptions A set of options from currently selected dropdown items.
@property {Array} params.entries The options avialble to the dropdown.
@property {String} params.placeholder THe options avialble to the dropdown.
@property {boolean} [params.search] The search element will be assigned to the flag property.
@property {boolean} [params.pills] Pill element for adding the options to when selected.

@returns {HTMElement} The search element and its datalist.
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

function onSearchInput(e, params) {
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

      params.callback?.(e, [...params.selectedOptions]);
    }
  });
}
