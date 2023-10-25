export default (params) => {

  params.selectedTitles = new Set()
  params.selectedOptions = new Set()

  // Create array of li elements for dropdown.
  const ul = params.entries.map((entry) => {

    // Create li element with click event.
    const li = mapp.utils.html.node`<li onclick=${(e) => {

      // Find the closest dropdown button.
      const btn = e.target.closest('button.dropdown')

      // Will collapse the dropdown if current state is 'active'.
      !params.multi && btn.classList.toggle('active')

      if (params.multi) {

        // Will show select background if add to classlist.
        e.target.classList.toggle('selected')

        // Add or remove title and option value from sets.
        if (e.target.classList.contains('selected')) {
          params.selectedTitles.add(entry.title)
          params.selectedOptions.add(entry.option)
        } else {
          params.selectedTitles.delete(entry.title)
          params.selectedOptions.delete(entry.option)
        }

        // Set btn text to reflect selection or show placeholder.
        btn.querySelector('[data-id=header-span]')
          .textContent = params.selectedTitles.size && Array.from(params.selectedTitles).map(v => decodeURIComponent(encodeURIComponent(v))).join(', ')
          || params.span || params.placeholder

        // Execute callback method and pass array of current selection.
        params.callback?.(e, Array.from(params.selectedOptions));

        return;
      }

      if (!params.keepPlaceholder) {

        // Dropdown is not multi
        btn.querySelector('[data-id=header-span]').textContent = entry.title;
      }

      params.callback?.(e, entry);

    }}>${entry.title}`

    // The entry is already selected during creation of dropdown.
    if (entry.selected) {
      li.classList.add('selected')
      params.selectedTitles.add(entry.title)
      params.selectedOptions.add(entry.option)
    }

    return li
  })

  return mapp.utils.html.node`
    <button 
      data-id=${params.data_id || 'dropdown'}
      class="dropdown">
      <div class="head" onclick=${(e) => {

        const bounds = e.target.getBoundingClientRect()

        const viewport = document.body.getBoundingClientRect()

        // Set the maxHeight of the ul based on the difference between the bottom and document.body height.
        e.target.nextElementSibling.style.maxHeight = `${viewport.height - bounds.bottom}px`

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
      <span data-id=header-span>${

        // join the selected titles if selectTitles set has a size.
        params.selectedTitles.size && Array.from(params.selectedTitles).join(', ')

        // header should be the span value.
        || params.span

        // use placeholder.
        || params.placeholder}
      </span>
      <div class="icon"></div>
      </div>
      <ul>${ul}`;
}