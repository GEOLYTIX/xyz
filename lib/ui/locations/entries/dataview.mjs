export default entry => {

  entry.layer = entry.location.layer
  entry.host = entry.host || entry.location.layer.mapview.host

  // An entry which depend on another entry field will not be displayed if that field value is falsy.
  if (entry.dependents && entry.dependents.some(
      dependant => entry.location.infoj.some(
        _entry => (!_entry.value && _entry.field === dependant)
      ))) delete entry.display;


  // Dataview will be added to the location view.
  let target

  // Dataview will added assigned to a target by id.
  if (typeof entry.target === 'string' && document.getElementById(entry.target)) {

    entry.target = document.getElementById(entry.target)
  
    mapp.ui.Dataview(entry).then(() => entry.update())
  
    return;
  }

  // Find tabview element from data-id attribute.
  const tabview = typeof entry.target === 'string'
    && document.querySelector(`[data-id=${entry.target}]`)

  if (tabview) {

    delete entry.target

    // Dataview creation must be complete for methods to be available.
    mapp.ui.Dataview(entry).then(()=>{

      // Assign border style based on the location view record (from list)
      entry.tab_style = `border-bottom: 3px solid ${entry.location.style.strokeColor}`

      // Create tabview after dataview creation is complete.
      tabview.dispatchEvent(new CustomEvent('addTab', {
        detail: entry
      }))

      // Show the tab if display is true.
      entry.display && entry.show()
    })
  };

  if (typeof entry.target === 'string') {
      
    target = mapp.utils.html.node`
      <div
        class="${`location ${entry.class}`}">`
  
    entry.target = target

    entry.display && mapp.ui.Dataview(entry).then(() => entry.update())
  }

  const chkbox = entry.label && mapp.ui.elements.chkbox({
    label: entry.label,
    checked: !!entry.display,
    onchange: (checked) => {

      entry.display = checked

      if (target) {

        target.style.display = entry.display ? 'block' : 'none'

        typeof entry.update === 'function'
          && entry.update()
          || mapp.ui.Dataview(entry).then(() => entry.update())

        return;
      }

      // Show or remove tab according to the checked/display value.
      entry.display ?
        entry.show() :
        entry.remove()
  
    }
  })

  const node = mapp.utils.html.node`${chkbox}${target || ''}`

  return node
}