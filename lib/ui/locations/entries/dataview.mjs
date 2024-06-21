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

    // Remove display flag if dependent field entry.value is falsy.
    entry.dependents.some(dependant =>
      entry.location.infoj.some(_entry =>
        (!_entry.value && _entry.field === dependant)
      )
    ) && delete entry.display;
  }

    // if (entry.data === null) {

  //   // The entry must be disabled if the query has run and the data is null.
  //   // This is to prevent the query running over and over again getting the same result.
  //   delete entry.display
  //   entry.disabled = true
  // } else {

  //   delete entry.disabled
  // }

  // Dataview has already been created. e.g. after the location (view) is updated.
  if (entry.update) {

    if (entry.dynamic) {

      entry.displayDataview()

    } else if (entry.reload) {

      entry.setData(entry.data)
    }

    // Update dataview if displayed.
    // entry.display && entry.update()

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
    entry.target = mapp.utils.html.node`<div class="dataview-target">`

    // Dataview should be displayed.
    entry.display && entry.displayDataview()
  };

  if (!entry.target) {

    console.warn('type:dataview entry must have a target')
    return;
  }

  // Dataview will be rendered into location view.
  if (typeof entry.target === 'string') {
      
    entry.locationViewTarget = mapp.utils.html.node`
      <div
        class="${`location ${entry.class}`}">`
  
    entry.target = entry.locationViewTarget

    entry.display && mapp.ui.Dataview(entry).then(() => entry.update())
  }

  // A checkbox will only be created if the label key value is provided.
  entry.chkbox = entry.label && mapp.ui.elements.chkbox({
    data_id: entry.key,
    label: entry.label,
    disabled: entry.disabled,
    checked: !!entry.display,
    onchange: (checked) => {

      entry.display = checked

      // Dataview is location view.
      if (entry.locationViewTarget) {

        // Hide dataview
        if (!entry.display) {
          entry.locationViewTarget.style.display = 'none'
          return;
        }

        entry.locationViewTarget.style.display = 'block'
        
        // Location view has already been created.
        typeof entry.update === 'function' && entry.update()

        // Create location view.
        typeof entry.update !== 'function' && mapp.ui.Dataview(entry).then(() => {

          // Run update query if data has not already been asigned.
          typeof entry.data === 'object'
            ? entry.setData(entry.data)
            : entry.update()
        })

        return;
      }

      // Dataview is in tabview
      entry.display ? entry.displayDataview() : entry.remove()
    }
  })

  // Return elements to location view.
  return mapp.utils.html.node`
    ${entry.chkbox || ''}
    ${entry.locationViewTarget || ''}`
}

async function displayDataview(entry = this) {

  entry.display = true

  if (!entry.update) {
    await mapp.ui.Dataview(entry)

  } else if (entry.dynamic) {

    await mapp.ui.Dataview(entry)
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