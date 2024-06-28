/**
## ui/locations/entries/dataview

The dataview entry module exports the dataview method as mapp.ui.locations.entries.dataview()

@requires /ui/Dataview

@module /ui/locations/entries/dataview
*/

/**
@function dataview

@description
The dataview entry method called from the infoj method returns a Dataview HTMLElement for the location view.

The dataview is created by passing the entry as argument to the mapp.ui.Dataview(entry) method.

A decorated dataview entry will have show(), hideDataview(), and an update() method.

The display flag controls whether the dataview should be displayed.

A checkbox element will only be returned from the dataview entry method if an `entry.label` has been configured with the string value for the checkbox label.

The dataview target itself will be returned with a checkbox if no implicit target is avilable in the documentview and the dataview should not be created in a tabview.

@param {Object} entry type:dataview entry.
@param {Object} entry.location The entry location.
@param {Object} entry.location.layer The entry location layer.
@param {string} [entry.label] Label for the dataview checkbox.
@param {string} [entry.dataview] The dataview type, eg. "chartjs", "tabulator".
@param {string} [entry.target] The dataview target. Will resolve to HTMLElement.
@param {Function} [entry.update] The dataview update method.
@param {boolean} [entry.display] The dataview display falg.
@param {Function} [entry.show] The dataview show method.
@param {Function} [entry.hideDataview] The dataview hide method.

@return {HTMLElement} Location view dataview and checkbox.
*/

export default function dataview(entry) {

  entry.data ??= entry.value

  // Dataview queries may require the layer and host to be defined on the entry.
  entry.layer ??= entry.location.layer
  entry.host ??= entry.layer.mapview.host

  // Dataview will be rendered into target identified by ID.
  if (typeof entry.target === 'string' && document.getElementById(entry.target)) {

    // Assign element by ID as target.
    entry.target = document.getElementById(entry.target)

    // Create and update the dataview.
    if (mapp.ui.Dataview(entry) instanceof Error) return;

    entry.update()
    
    return;
  }

  // Dataview is dependent on other field entries.
  if (entry.dependents) {

    console.warn(`The dataview type entry key:${entry.key} may be dependent on other entries but has no dependents.`)
  }

  // Dataview has already been created. e.g. after the location (view) is updated.
  if (entry.update) {

    if (entry.display) entry.show()

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

    // Assign border style based on the location view record (from list)
    entry.tab_style ??= `border-bottom: 3px solid ${entry.location.style.strokeColor}`

    // Assign target html element for dataview.
    entry.target = mapp.utils.html.node`
      <div class="dataview-target">`

  } else {

    // Dataview will be rendered into location view.
    entry.locationViewTarget = mapp.utils.html.node`
      <div class="${`location ${entry.class}`}">`

    entry.target = entry.locationViewTarget
  }

  if (mapp.ui.Dataview(entry) instanceof Error) return;

  // Dataview should be displayed.
  entry.display && entry.show()

  // Return elements to location view.
  return mapp.utils.html.node`
    ${entry.chkbox || ''}
    ${entry.locationViewTarget || ''}`
}
