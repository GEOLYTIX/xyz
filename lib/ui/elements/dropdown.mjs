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
          .textContent = params.selectedTitles.size && Array.from(params.selectedTitles).map(v => v).join(', ')
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

      // Calculate the difference between the bottom of the dropdown and the viewport height.
      const viewDiff = viewport.height - bounds.bottom;

      // Set the maxHeight of the ul to the difference.
      e.target.nextElementSibling.style.maxHeight = `${viewDiff}px`

      // Set the width of the ul to the width of the button.
      e.target.nextElementSibling.style.width = `${e.target.offsetWidth}px`

      // If the difference is less than 150px, reverse the dropdown.
      if (viewDiff < 150) {
        e.target.parentElement.classList.add('dropdown-reverse')

        // Set the maxHeight of the ul to 300 as it will be reversed so the bottom doesn't get cut off.
        e.target.nextElementSibling.style.maxHeight = `150px`

        // If the difference is greater than 150px, check if the dropdown is reversed and remove the class.
      } else {

        // Set the maxHeight of the ul to the difference.
        e.target.nextElementSibling.style.maxHeight = `${viewDiff}px`

        if (e.target.parentElement.classList.contains('dropdown-reverse')) {
          e.target.parentElement.classList.remove('dropdown-reverse');
        }
      }

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