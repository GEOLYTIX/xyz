export default (params) => {

  params.selectedTitles = new Set()
  params.selectedOptions = new Set()

  params.pills &&= mapp.ui.elements.pills({
    pills: [...params.selectedTitles],
    addCallback: (val, _pills) => {
      params.callback?.(null, [..._pills]);
    },
    removeCallback: (val, _pills) => {

      // deselect value in the list
      const item = ul.find(li => li.getAttribute('data-value') === val.toString());
      item.classList.remove('selected');
      params.selectedTitles.delete(item.title);
      params.selectedOptions.delete(item.dataset.option);

      // Remove pill element
      //params.pills.remove(val);

      params.callback?.(null, [..._pills]);
    }
  });

  params.liOnClick ??= liOnClick

  function liOnClick(e, entry) {

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

        params.pills?.add(entry.title)

      } else {
        params.selectedTitles.delete(entry.title)
        params.selectedOptions.delete(entry.option)

        params.pills?.remove(entry.title);
      }

      if (!params.pills) {

        // Set btn text to reflect selection or show placeholder.
        btn.querySelector('[data-id=header-span]').textContent =
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
  const ul = params.entries.map((entry) => {

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
      params.pills && pills.add(entry.title)
    }

    return li
  })

  params.headerOnClick ??= headerOnClick

  function headerOnClick(e) {

    const bounds = e.target.getBoundingClientRect()

    const viewport = document.body.getBoundingClientRect()

    // Set the maxHeight of the ul based on the difference between the bottom and document.body height.
    e.target.nextElementSibling.style.maxHeight = `${params.maxHeight || (viewport.height - bounds.bottom)}px`

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
  }

  const headerSpan = params.selectedTitles.size
    && Array.from(params.selectedTitles).join(', ') // join the selected titles if selectTitles set has a size.
    || params.span // header should be the span value.
    || params.placeholder // use placeholder.
  
  params.node = mapp.utils.html.node`
    ${params.pills?.container}
    <button
      data-id=${params.data_id || 'dropdown'}
      class="dropdown">
        <div class="head" onclick=${params.headerOnClick}>
          <span data-id=header-span>${headerSpan}</span>
          <div class="icon"></div>
        </div>
        <ul>${ul}`;

  return params.node
}