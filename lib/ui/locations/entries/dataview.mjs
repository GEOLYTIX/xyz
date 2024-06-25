/**
## ui/locations/entries/dataview

The geometry entry module exports a default entry method to process infoj entries with a dataview configuration.

@module /ui/locations/entries/dataview
*/

/**
@function dataview

@description
mapp.ui.locations.entries.dataview(entry)

@param {Object} entry type:dataview entry.

@return {HTMLElement}

*/

export default function dataview(entry) {

  entry.displayDataview ??= displayDataview
  entry.hideDataview ??= hideDataview

  entry.data ??= entry.value

  // Dataview queries may require the layer and host to be defined on the entry.
  entry.layer ??= entry.location.layer
  entry.host ??= entry.layer.mapview.host

  // Dataview will be rendered into target identified by ID.
  if (typeof entry.target === 'string' && document.getElementById(entry.target)) {

    // Assign element by ID as target.
    entry.target = document.getElementById(entry.target)

    // Create and update the dataview.
    mapp.ui.Dataview(entry).then(dataview => dataview.update())

    return;
  }

  // Dataview is dependent on other field entries.
  if (entry.dependents) {

    console.warn(`The dataview type entry key:${entry.key} may be dependent on other entries but has no dependents.`)
  }

  // Dataview has already been created. e.g. after the location (view) is updated.
  if (entry.update) {

    if (entry.display) entry.displayDataview()

    // Return elements to location view.
    return mapp.utils.html.node`
      ${entry.chkbox || ''}
      ${entry.locationViewTarget || ''}`
  }

  // Find tabview element from data-id attribute.
  entry.tabview ??= typeof entry.target === 'string'
    && document.querySelector(`[data-id=${entry.target}]`)

  // Dataview will be rendered into a tabview panel.
  if (entry.tabview) {

    // Assign target html element for dataview.
    entry.target = mapp.utils.html.node`
      <div class="dataview-target">`

  } else {

    // Dataview will be rendered into location view.
    entry.locationViewTarget = mapp.utils.html.node`
      <div class="${`location ${entry.class}`}">`

    entry.target = entry.locationViewTarget
  }

  // Dataview should be displayed.
  entry.display && entry.displayDataview()

  // A checkbox will only be created if the label key value is provided.
  entry.chkbox = entry.label && mapp.ui.elements.chkbox({
    data_id: entry.key,
    label: entry.label,
    disabled: entry.disabled,
    checked: !!entry.display,
    onchange: (checked) => {

      entry.display = checked

      entry.display 
        ? entry.displayDataview() 
        : entry.hideDataview()
    }
  })

  // Return elements to location view.
  return mapp.utils.html.node`
    ${entry.chkbox || ''}
    ${entry.locationViewTarget || ''}`
}

async function displayDataview(entry = this) {

  entry.display = true

  if (entry.dynamic || !entry.update) {
    await mapp.ui.Dataview(entry)
    entry.update()

  } else if (entry.reload) {

    entry.update()
  }

  if (entry.locationViewTarget) {

    entry.locationViewTarget.style.display = 'block'
  }

  if (entry.tabview) {

    // Assign border style based on the location view record (from list)
    entry.tab_style ??= `border-bottom: 3px solid ${entry.location.style.strokeColor}`

    // Create tab after dataview creation is complete.
    entry.tabview.dispatchEvent(new CustomEvent('addTab', {
      detail: entry
    }))

    entry.show()
  }
}

function hideDataview(entry = this) {

  entry.display = false

  if (entry.locationViewTarget) {

    entry.locationViewTarget.style.display = 'none'
  }

  if (entry.tabview && typeof entry.remove === 'function') {

    entry.remove()
  }
}