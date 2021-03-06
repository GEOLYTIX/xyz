export default _xyz => entry => {

  // An entry which depend on another entry field will not be displayed if that field value is falsy.
  if (entry.dependents && entry.dependents.some(
      dependant => entry.location.infoj.some(
        _entry => (!_entry.value && _entry.field === dependant)
      ))) delete entry.display

  // Assign entry.layer object.
  entry.layer = (typeof entry.layer === 'object' && entry.layer) ||
    (typeof entry.layer === 'string' && _xyz.layers.list[entry.layer]) ||
    entry.location.layer


  // Dataview will be added to the location view.
  if (entry.target === 'location'

    // The entry dataview already exists and contains the location class.
    || entry.dataview && entry.dataview.classList.contains('location')) {

    if (entry.dataview) {
      entry.update()
      return entry.dataview
    }

    entry.target = _xyz.utils.html.node `
      <div
        class="${`location ${entry.class}`}"
        style="${`${entry.style || ''}`}">`

    _xyz.dataviews.create(entry)

    // Return the dataview target to be added to the location view.
    return entry.dataview
  }


  // Dataview will added assigned to a target by id.
  if (typeof entry.target === 'string' && document.getElementById(entry.target)) {

    entry.target = document.getElementById(entry.target)

    _xyz.dataviews.create(entry)

    return
  }


  // Dataview will be added to tabview
  if (_xyz.tabview.node) {

    entry.tab_style = `border-bottom: 2px solid ${entry.location.style.strokeColor}`
    
    _xyz.tabview.add(entry)

    // Only create dataviews which don't yet exist
    _xyz.dataviews.create(entry)

    entry.display && entry.show()

    // Return the checkbox to be added to the location view.
    return _xyz.utils.html.node `
      <label
        class="${`input-checkbox mobile-disabled ${entry.class}`}">
        <input
          type="checkbox"
          .checked=${!!entry.display}
          onchange=${e => {

            entry.display = e.target.checked
            entry.display ?
              entry.show() :
              entry.remove()

          }}></input>
        <div></div>
        <span>${entry.title || 'Dataview'}`

  }

}