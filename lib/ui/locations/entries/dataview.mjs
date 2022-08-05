export default entry => {

  // Dataview methods require the layer and host to be defined on the entry.
  entry.layer = entry.location.layer
  entry.host = entry.host || entry.location.layer.mapview.host

  // An entry which depend on another entry field will not be displayed if that field value is falsy.
  if (entry.dependents && entry.dependents.some(
      dependant => entry.location.infoj.some(
        _entry => (!_entry.value && _entry.field === dependant)
      ))) delete entry.display;


  // Dataview will added assigned to a target by id.
  if (typeof entry.target === 'string' && document.getElementById(entry.target)) {

    entry.target = document.getElementById(entry.target)
  
    mapp.ui.Dataview(entry).then(() => entry.update())
  
    return;
  }

  // Find tabview element from data-id attribute.
  entry.tabview = entry.tabview || typeof entry.target === 'string'
    && document.querySelector(`[data-id=${entry.target}]`)

  // Dataview should be in tabview.
  if (entry.tabview) {

    // Assign target html element for dataview.
    entry.target = mapp.utils.html.node`<div class="dataview-target">`

    // Dataview should be displayed.
    entry.display && createTabAndShow(entry)
  };

  // Dataview should be in location view.
  if (typeof entry.target === 'string') {
      
    entry.locationViewTarget = mapp.utils.html.node`
      <div
        class="${`location ${entry.class}`}">`
  
    entry.target = entry.locationViewTarget

    entry.display && mapp.ui.Dataview(entry).then(() => entry.update())
  }

  // A checkbox will only be created if the label key value is provided.
  entry.chkbox = entry.label && mapp.ui.elements.chkbox({
    label: entry.label,
    checked: !!entry.display,
    onchange: (checked) => {

      entry.display = checked

      if (target) {

        target.style.display = entry.display ? 'block' : 'none'

        entry.display 
          && typeof entry.update === 'function'
          && entry.update()

        entry.display
          && typeof entry.update !== 'function'
          && mapp.ui.Dataview(entry).then(() => entry.update())

        return;
      }

      // Show or remove tab according to the checked/display value.
      entry.display ?
        createTabAndShow(entry) :
        entry.remove()
  
    }
  })

  return mapp.utils.html.node`${entry.chkbox}${entry.locationViewTarget || ''}`
}

function createTabAndShow(entry) {

  // The show method indicates that the tab has already been created.
  if (entry.show) return entry.show()

  // Dataview creation must be complete for methods to be available.
  mapp.ui.Dataview(entry).then(() => {

    // Assign border style based on the location view record (from list)
    entry.tab_style = `border-bottom: 3px solid ${entry.location.style.strokeColor}`

    // Create tab after dataview creation is complete.
    entry.tabview.dispatchEvent(new CustomEvent('addTab', {
      detail: entry
    }))

    // Show the tab if display is true.
    entry.display && entry.show()
  })
}