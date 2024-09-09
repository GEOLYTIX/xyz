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
@property {boolean} [params.keepPlaceholder] set this flag to `true` in order to keep the original placeholder after an option is selected.
@property {boolean} [params.pills] Applies pills component to show selected values.Available for mutliple choice.
@property {Object} [params.entries] Array of option elements. Expected format: [{title: 'Title for Option 1', option: 'option1'}, ...]. Add property `selected: true` for entry selected by default. `title` will appear as the description, `option` is a value passed as selected.
@property {function} [params.liOnClick] Callback to execute when an element in the list is clicked. Overrrides default function.
@property {function} [params.headerOnClick] Callback to execute when a header is clicked. Overrides default function.

@returns {Object} HTML dropdown element
*/
export default (params) => {

  params.selectedTitles = new Set()
  params.selectedOptions = new Set()

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

  params.liOnClick ??= liOnClick

  function liOnClick(e, entry) {

    const li = e.target;
    const dropdown = li.closest('button.dropdown');

    // dropdown element will collapse without 'active' class.
    !params.multi && dropdown.classList.toggle('active')

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

        // Set btn text to reflect selection or show placeholder.
        dropdown.querySelector('[data-id=header-span]').textContent =
          params.selectedTitles.size
          && Array.from(params.selectedTitles).map(v => v).join(', ')
          || params.span || params.placeholder
      }

      params.callback?.(e, [...params.selectedOptions])

      return;
    }

    // Only applies for non multi select
    if (!params.keepPlaceholder) {

      // Dropdown is not multi
      btn.querySelector('[data-id=header-span]').textContent = entry.title;
    }

    params.callback?.(e, entry);
  }

  // Create array of li elements for dropdown.
  const li_elements = params.entries.map((entry) => {

    // Create li element with click event.
    const li = mapp.utils.html.node`<li
      data-value=${entry.option}
      onclick=${(e) => params.liOnClick(e, entry)}>
      ${entry.title}`

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

  params.ul = mapp.utils.html.node`
    <ul>${li_elements}`

  params.headerOnClick ??= headerOnClick

  function headerOnClick(e) {

    const header = e.target;

    const bounds = header.getBoundingClientRect()

    const viewport = document.body.getBoundingClientRect()

    // Calculate the difference between the bottom of the dropdown and the viewport height.
    const viewDiff = viewport.height - bounds.bottom;

    // Set the maxHeight of the ul to the difference.
    params.ul.style.maxHeight = `${viewDiff}px`

    // Set the width of the ul to the width of the button.
    params.ul.style.width = `${header.offsetWidth}px`

    // If the difference is less than 150px, reverse the dropdown.
    if (viewDiff < 150) {
      header.parentElement.classList.add('dropdown-reverse')

      // Set the maxHeight of the ul to 300 as it will be reversed so the bottom doesn't get cut off.
      params.ul.style.maxHeight = `150px`

      // If the difference is greater than 150px, check if the dropdown is reversed and remove the class.
    } else {

      // Set the maxHeight of the ul to the difference.
      params.ul.style.maxHeight = `${viewDiff}px`

      if (header.parentElement.classList.contains('dropdown-reverse')) {
        header.parentElement.classList.remove('dropdown-reverse');
      }
    }
    
    // Collapse dropdown element and short circuit.
    if (header.parentElement.classList.contains('active')) {
      header.parentElement.classList.remove('active');
      return;
    }

    // Collapse any expandxed dropdown elements in document.
    document.querySelectorAll('button.dropdown')
      .forEach((el) => el.classList.remove('active'));

    // Expand this dropdown element.
    header.parentElement.classList.add('active');
  }

  const headerSpan = params.keepPlaceholder
    ? params.placeholder
    : params.selectedTitles.size

      // join the selected titles if selectTitles set has a size.
      && Array.from(params.selectedTitles).join(', ') 
      // use span property as placeholder if not undefined.
      || params.span 
      // placeholder property is the fallback for the headerSpan.
      || params.placeholder 

  params.node = mapp.utils.html.node`
    ${params.pills?.container}
    <button
      data-id=${params.data_id || 'dropdown'}
      class="dropdown">
      <div class="head" onclick=${params.headerOnClick}>
        <span data-id=header-span>${headerSpan}</span>
        <div class="icon"></div>
      </div>
      ${params.ul}`;

  return params.node
}
