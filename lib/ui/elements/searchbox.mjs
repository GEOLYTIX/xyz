export default (searchbox) => {

    // Ensure the target is an HTMLElement before proceeding
    if (!(searchbox.target instanceof HTMLElement)) return;
    
    searchbox.input = mapp.utils.html.node`<input
    name="${searchbox.name || 'searchbox-input'}" 
    type="search" 
    placeholder=${searchbox.placeholder}>`
    
    searchbox.list = mapp.utils.html.node`<ul>`

    searchbox.node = mapp.utils.html.node`<div class="searchbox">
    ${searchbox.input}
    ${searchbox.list}`

    searchbox.target.append(searchbox.node)

    searchbox.input.addEventListener('input', searchFunction);

    searchbox.input.addEventListener('focus', searchFunction);

    function searchFunction(e){
        if(!searchbox.searchFunction || typeof searchbox.searchFunction !== 'function') console.warn(`ui.element.searchbox ${searchbox.name || ``} - no searchFunction defined`);
        if(searchbox.searchFunction && typeof searchbox.searchFunction === 'function') return searchbox.searchFunction(e);
        defaultSearch(e);
    }

    function defaultSearch(e) {
        // clear any previous result
        searchbox.list.innerHTML = ''
        // Only search if value has length.
        if (!e.target.value.length) return;
        // return no result default message
        searchbox.list.append(mapp.utils.html.node`<li><span>${mapp.dictionary.no_results}`)
    }

    return searchbox;
}