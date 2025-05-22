/**
## /ui/elements/search

Returns an input element for searching.

Creates a datalist element which holds the entries, which provides the values to be searched.

The id of the datalist is assigned to the search elements list atrribute. 

@requires /ui/elements/pills

@module /ui/elements/search
*/

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
export default function search(params) {
  if (!params.search) return;

  const listId = `${params.field}-search-options`;

  const placeholder = params.placeholder || 'Enter search term...';
  const searchInput = mapp.utils.html.node`<input type="search" list=${listId} 
  onInput=${onInput} onfocus="this.placeholder=''" onblur=${(e) => (e.target.placeholder = placeholder)} placeholder=${placeholder}>`;

  const options = [];
  for (const entry of params.entries) {
    const option = mapp.utils.html
      .node`<option value=${entry.option} data-title=${entry.title}>${entry.title}</option>`;
    options.push(option);
  }
  const datalist = mapp.utils.html.node`<datalist id=${listId}>${options}
      </datalist>`;

  params.search = mapp.utils.html.node`${searchInput}${datalist}`;

  function onInput(e) {
    params.entries.forEach((entry) => {
      if (entry.title === e.target.value) {
        entry.selected = !entry.selected;

        const selectedOption = options.find(
          (option) => option.getAttribute('data-title') === e.target.value,
        );

        if (entry.selected) {
          params.selectedTitles.add(entry.title);
          params.selectedOptions.add(entry.option);
          params.pills?.add(entry.title);
          selectedOption.innerText = `${selectedOption.innerText} ✓`;
        } else {
          params.selectedTitles.delete(entry.title);
          params.selectedOptions.delete(entry.option);
          params.pills?.remove(entry.title);
          selectedOption.innerText = selectedOption.getAttribute('data-title');
        }

        e.target.value = '';
        e.target.dispatchEvent(new Event('blur'));

        params.callback?.(e, [...params.selectedOptions]);
      }
    });
  }

  return params.search;
}
