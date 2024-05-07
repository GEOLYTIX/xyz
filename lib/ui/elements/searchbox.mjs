/**
 * ### mapp.ui.elements.searchbox()
 * Module that returns a searchbox UI element used in mapp.
 * @module /ui/elements/searchbox
 */

/**
 * Creates a searchbox component.
 * @function searchbox
 * @param {Object} searchbox - The searchbox configuration object.
 * @param {HTMLElement} searchbox.target - The target element to append the searchbox to.
 * @param {string} [searchbox.name='searchbox-input'] - The name attribute for the search input.
 * @param {string} searchbox.placeholder - The placeholder text for the search input.
 * @param {Function} [searchbox.searchFunction] - The custom search function to be executed on input.
 * @returns {Object} The searchbox object.
 */
export default (searchbox) => {
    // Ensure the target is an HTMLElement before proceeding
    if (!(searchbox.target instanceof HTMLElement)) return;
  
    /**
     * The search input element.
     * @type {HTMLInputElement}
     */
    searchbox.input = mapp.utils.html.node`<input name="${searchbox.name || 'searchbox-input'}" type="search" placeholder=${searchbox.placeholder}>`
  
    /**
     * The search results list element.
     * @type {HTMLUListElement}
     */
    searchbox.list = mapp.utils.html.node`<ul>`
  
    /**
     * The searchbox container element.
     * @type {HTMLDivElement}
     */
    searchbox.node = mapp.utils.html.node`<div class="searchbox">
      ${searchbox.input}
      ${searchbox.list}
    `
  
    searchbox.target.append(searchbox.node)
  
    searchbox.input.addEventListener('input', searchFunction);
    searchbox.input.addEventListener('focus', searchFunction);
  
    /**
     * The search function triggered on input events.
     * @param {Event} e - The input event object.
     */
    function searchFunction(e) {
      if (!searchbox.searchFunction || typeof searchbox.searchFunction !== 'function') {
        console.warn(`ui.element.searchbox ${searchbox.name || ''} - no searchFunction defined`);
      }
      if (searchbox.searchFunction && typeof searchbox.searchFunction === 'function') {
        return searchbox.searchFunction(e);
      }
      searchbox.defaultSearch(e);
    }
  
    /**
     * The default search function.
     * @param {Event} e - The input event object.
     */
    searchbox.defaultSearch = (e) => {
      // Clear any previous results
      searchbox.list.innerHTML = '';
  
      // Only search if value has length
      if (!e.target.value.length) return;
  
      // Return no result default message
      searchbox.list.append(mapp.utils.html.node`<li><span>${mapp.dictionary.no_results}`);
    };
  
    return searchbox;
  };