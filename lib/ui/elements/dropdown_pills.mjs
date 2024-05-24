export default (params) => {

  params.selectedTitles = new Set()
  params.selectedOptions = new Set()

  // Create array of li elements for dropdown.
  const ul = params.entries.map((entry) => {

    // Create li element with click event.
    const li = mapp.utils.html.node`<li 
    data-option=${entry.option}
    title=${entry.title}
    onclick=${(e) => {

        // Will show select background if add to classlist.
        e.target.classList.toggle('selected')

        // Add or remove title and option value from sets.
        if (e.target.classList.contains('selected')) {
          params.selectedTitles.add(entry.title)
          params.selectedOptions.add(entry.option)
          
          pills.add(entry.title)

        } else {
          params.selectedTitles.delete(entry.title)
          params.selectedOptions.delete(entry.option)

          pills.remove(entry.title);

        }

        params.callback?.([...params.selectedOptions]);

    }}>${entry.title}`

    // The entry is already selected during creation of dropdown.
    if (entry.selected) {
      li.classList.add('selected')
      params.selectedTitles.add(entry.title)
      params.selectedOptions.add(entry.option)
      // create pill
      pills.add(entry.title)
    }

    return li
  })

  const dropdown = mapp.utils.html.node`
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
      <span data-id=header-span>${params.placeholder}
      </span>
      <div class="icon"></div>
      </div>
      <ul>${ul}`;

  const pills = mapp.ui.elements.pills({
    pills: [...params.selectedTitles],
    addCallback: (vall, _pills) => {
      params.callback?.([..._pills]);
    },
    removeCallback: (val, _pills) => {
      // deselect value in the list
      let item = ul.find(li => li.title === val);
      item.classList.remove('selected');
      params.selectedTitles.delete(item.title);
      params.selectedOptions.delete(item.dataset.option);
      
      params.callback?.([..._pills]);
    }
  });

  return mapp.utils.html.node`${pills.container}${dropdown}`
}