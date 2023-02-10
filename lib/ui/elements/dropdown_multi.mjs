export default (params) => {

  const selectedTitles = new Set()
  const selectedOptions = new Set()

  // Create array of li elements for dropdown.
  const ul = params.entries.map((entry) => {
    
    // Create li element with click event.
    const li = mapp.utils.html.node`<li onclick=${(e) => {

      // Find the closest dropdown button.
      const btn = e.target.closest('button.dropdown')

      // Will collapse the dropdown if current state is 'active'.
      btn.classList.toggle('active')   

      // Will show select background if add to classlist.
      e.target.classList.toggle('selected')

      // Add or remove title and option value from sets.
      if (e.target.classList.contains('selected')) {
        selectedTitles.add(entry.title)
        selectedOptions.add(entry.option)
      } else {
        selectedTitles.delete(entry.title)
        selectedOptions.delete(entry.option)
      }
           
      // Set btn text to reflect selection or show placeholder.
      btn.querySelector('[data-id=header-span]')
        .textContent = selectedTitles.size && Array.from(selectedTitles).map(v => decodeURIComponent(v)).join(', ')
        || params.span || params.placeholder

      // Execute callback method and pass array of current selection.
      params.callback && params.callback(e, Array.from(selectedOptions));
    }}>${decodeURIComponent(entry.title)}`

    // The entry is already selected during creation of dropdown.
    if (entry.selected) {
      li.classList.add('selected')
      selectedTitles.add(entry.title)
      selectedOptions.add(entry.option)
    }

    return li})

  return mapp.utils.html.node`
    <button 
      data-id=${params.data_id || 'dropdown'}
      class="dropdown">
      <div class="head"
        onclick=${(e) => {

          e.target.nextElementSibling.style.width = `${e.target.offsetWidth}px`

          // Collapse dropdown element and short circuit.
          if (e.target.parentElement.classList.contains('active')) {
            e.target.parentElement.classList.remove('active');
            return;
          }

          // Collapse any expandxed dropdown elements in document.
          document.querySelectorAll('button.dropdown')
            .forEach((el) => el.classList.remove('active'));
            
          // Expand this dropdown element.
          e.target.parentElement.classList.add('active');

        }}>
        <span data-id=header-span>${selectedTitles.size && Array.from(selectedTitles).join(', ')|| params.span || params.placeholder}</span>
        <div class="icon"></div>
      </div>
      <ul>${ul}`;
}