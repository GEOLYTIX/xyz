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

    searchbox.input.addEventListener('input', search)

    searchbox.input.addEventListener('focus', search)

    function search(e){
        if(searchbox.search && typeof searchbox.search === 'function') return searchbox.search(e);
        // default search function here? what should it do?
    }

    return searchbox;
}