/**
 * 
 * ## mapp.ui.locations.infoj()
 * @module /ui/locations/infoj
 */

let groups

/**
 * infoj method that will return a HTMLDivElement with ordered entries.
 * @function infoj
 * @param {Object} location - The location object
 * @param {Object} location.layer - The layer that belongs to the location.
 * @param {Object} location.layer.infoj - The location infoj Object
 * @param {Object} location.view - The location's view 
 * @param {array} infoj_order - Order array for the infoj
 * @return {HTMLDivElement} listview - Returns the listview of the infoj
 */

export default (location, infoj_order) => {

  if (!location.infoj) return

  // Create a grid view div.
  const listview = mapp.utils.html.node`<div class="location-view-grid">`

  // Create object to hold view groups.
  groups = {}

  // The infoj_order may be assigned to the layer.
  infoj_order ??= location.layer.infoj_order

  // infoj argument is provided as an array of strings to filter the location infoj entries.
  let infoj = Array.isArray(infoj_order) ?
    infoj_order.map(_entry => {

      if (typeof _entry === 'string') {
        let infoj_order_field = location.infoj.find(entry => (entry.key || entry.field || entry.query || entry.group) === _entry);

        // if undefined then warn the user.
        if (!infoj_order_field) console.warn(`infoj_order field: "${_entry}" not found in location.infoj. Please add entry.key, entry.field, entry.query, or entry.group to the entry.`);

        // Check whether the _entry string matches an infoj entry keyvalue.
        return infoj_order_field

      } else if (typeof _entry === 'object') {

        // Return object _entry.
        return _entry
      }
    }).filter(entry => entry !== undefined)
    : location.infoj;

  // Iterate through info fields and add to info table.
  for (const entry of infoj) {

    // The location view entries should not be processed if the view is disabled.
    if (location.view?.classList.contains('disabled')) break;

    // Location view elements will appended to the entry.listview element.
    entry.listview = listview

    // The default entry type is text.
    entry.type = entry.type || 'text'

    entryObject(entry)

    // Skip entry depending on flag and value.
    if (entrySkip(entry)) continue;

    entryNullValue(entry)

    // Groups must be checked first since it should be possible to next any type of location view element in a group.
    entryGroup(entry)

    entryNode(entry)

    entryTitle(entry)

    entryDefault(entry)

    if (entryQuery(entry)) continue;

    if (!Object.hasOwn(mapp.ui.locations.entries, entry.type)) {
      console.warn(`entry.type:${entry.type} method not found.`)
      continue;
    }

    // Create element to be appended into empty entry.node
    const el = mapp.ui.locations.entries[entry.type]?.(entry)

    // Break this for loop!
    if (el === 'break') break;

    el && entry.node.append(el)
  }

  return listview
}

/**
 * @function entryNode
 * @param {Object} entry
 * @param {string} entry.type - type of entry.
 * @param {string} entry.class - css class for entry.
 * @param {boolean} entry.inline - Whether or not its inline.
 */
function entryNode(entry) {

  const classString = `contents ${entry.type} ${entry.class || ''} ${entry.inline && 'inline' || ''}`

  entry.node = entry.listview.appendChild(mapp.utils.html.node`
  <div
    data-type=${entry.type}
    class=${classString}>`)
}

/**
 * @function entryNullValue
 * @param {Object} entry
 * @param {string} entry.nullValue - null value for the entry.
 * @param {string} entry.defaults - Default value for the entry.
 * @param {boolean} entry.edit - If the entry is editable.
 */
function entryNullValue(entry) {

  // Assign a default nullValue
  if (!entry.nullValue) return;

  // A default value should be assigned.
  if (entry.defaults) return;

  // The entry is editable.
  if (entry.edit) return;

  //nullish coalesce nullValue
  entry.value ??= entry.nullValue;
}

/**
 * @function entryDefault
 * @param {Object} entry
 * @param {string} entry.value - entry value.
 * @param {string} entry.default - default value. 
 */
function entryDefault(entry) {

  // Check whether entry has a value
  if (entry.value === null || typeof entry.value === 'undefined') {

    // Assign the default value if set.
    entry.value = entry.default || entry.value
  }
}

/**
 * @function entryTitle
 * @param {Object} entry
 * @param {Object} entry.title  
 */
function entryTitle(entry) {

  if (!entry.title) return;

  // Append title element to entry.node
  entry.node.append(mapp.ui.locations.entries.title(entry))
}

/**
 * @function entryQuery
 * @param {Object} entry
 * @param {string} entry.query - Query on entry.
 * @param {string} entry.queryparams - Params for query
 * @param {boolean} entry.queryCheck - Query check
 * @param {boolean} entry.run - If to run the query
 * @param {boolean} entry.hasRan - Has the query run.
 * @param {string} entry.value - Value for entry.
 * @param {string} entry.nullValue - Null value for entry.
 * @param {string} entry.type - Type of entry.
 * @param {string} entry.field - Field of entry.   
 */
function entryQuery(entry) {

  if (!entry.query) return;

  // Assign queryparams from layer, and locale.
  entry.queryparams = Object.assign(
    entry.queryparams || {},
    entry.location.layer.queryparams || {},
    entry.location.layer.mapview.locale.queryparams || {})

  // Check whether query returns data.
  if (entry.queryCheck || entry.run === true) {

    // Stringify paramString from object.
    const paramString = mapp.utils.paramString(mapp.utils.queryParams(entry))

    // Delete run 
    delete entry.run;

    // Add flag to outline it has already been ran
    entry.hasRan = true;

    // Run the entry query.
    mapp.utils
      .xhr(`${entry.host || entry.location?.layer?.mapview?.host || mapp.host}/api/query?${paramString}`)
      .then(response => {

        if (response) {

          // Assign query response as entry value.
          entry.value = entry.field ? response[entry.field] : response;

        } else {

          entry.value = entry.nullValue || null;
        }

        // Check whether entry should be skipped.
        if (entrySkip(entry)) {

          // Remove the entry.node from location view.
          entry.node.remove();
          return;
        }

        // Create element to be appended into empty entry.node
        const el = mapp.ui.locations.entries[entry.type]?.(entry)

        el && entry.node.appendChild(el)
      })

    return true;

  } else if (entry.field && !entry.hasRan) {

    console.warn(`field:"${entry.field}" has a query:"${entry.query}" which is not set to run. To resolve this, add queryCheck:true or run:true to the entry.`)
  }
}

/**
 * @function entryObject
 * @param {Object} entry
 * @param {string} entry.field - entry field
 * @param {string} entry.objectAssignFromField - Assign object from field. 
 * @param {string} entry.objectMergeFromField - Merge object from field
 * @param {string} entry.objectMergeFromEntry - Merge object from entry.
 */
function entryObject(entry) {

  // Lookup for json value field entry
  if (entry.objectAssignFromField) {

    let fieldEntry = entry.location.infoj.find(_entry => _entry.field === entry.objectAssignFromField)

    fieldEntry && Object.assign(entry, fieldEntry.value)
  }

  if (entry.objectMergeFromField) {

    let fieldEntry = entry.location.infoj.find(_entry => _entry.field === entry.objectMergeFromField)

    fieldEntry && mapp.utils.merge(entry, fieldEntry.value)
  }

  // Merge from another entry.
  if (entry.objectMergeFromEntry) {

    // Find the entry to merge.
    let fieldEntry = entry.location.infoj.find(_entry => _entry.type === entry.objectMergeFromEntry)

    // Only merge the entry.merge object.
    fieldEntry
      && fieldEntry.merge instanceof Object
      && mapp.utils.merge(entry, fieldEntry.merge)
  }
}

/**
 * @function entryGroup
 * @param {Object} entry
 * @param {string} entry.group - Group entry belongs to.
 * @param {boolean} entry.expanded - Whether entry is expanded.
 * @param {string} entry.groupClassList - the css applied to the group.
 * @param {HTMLDivElement} entry.listview - The list view for the entry. 
 */
function entryGroup(entry) {

  if (!entry.group) return;

  // Create new group
  if (!groups[entry.group]) {

    // If entry.expanded, then console warn to change this 
    // As the configuration has changed
    if (entry.expanded) {

      console.warn('entry.expanded is deprecated. Use entry.groupClassList: "expanded" instead.')

      // Add to the string as this can have other classes.
      entry.groupClassList += ' expanded'
    }

    groups[entry.group] = entry.listview.appendChild(
      mapp.ui.elements.drawer({
        class: `group ${entry.groupClassList && 'expanded' || ''}`,
        header: mapp.utils.html`
          <h3>${entry.group}</h3>
          <div class="mask-icon expander"></div>`,
      }))
  }

  // The group will replace the entry listview to which elements will be appended.
  entry.listview = groups[entry.group]
}

/**
 * @function entrySkip
 * @param {Object} entry 
 * @param {Object} entry.skipEntry - Whether to skip entry.
 * @param {Object} entry.key - Entry key.
 * @param {Object} entry.field - Entry field.
 * @param {Object} entry.query - Entry query.
 * @param {Object} entry.type - Entry Type
 * @param {Object} entry.group - Entry Group.
 * @param {Object} entry.skipFalsyValue - Whether to Skip Falsy Value
 * @param {Object} entry.skipUndefinedValue - Whether to Skip undefined Value
 * @param {Object} entry.skipNullValue - Whether to Skip null Value
 * @param {Object} entry.value - Entry Value
 * @param {Object} entry.edit - Where it's editable.
 */
function entrySkip(entry) {

  // Skip entry, no matter what.
  if (entry.skipEntry) return true;

  // Skip entries from infoj_skip array;
  if (Array.isArray(entry.location?.layer?.infoj_skip)) {

    // Check whether some val from this array is in infoj_skip set.
    if ([entry.key, entry.field, entry.query, entry.type, entry.group]
      .some(val => new Set(entry.location?.layer?.infoj_skip).has(val))) return true;
  }

  // Skip entries which are falsy if flagged.
  if (entry.skipFalsyValue
    && !entry.value?.length
    && !entry.edit) return true;

  // Skip entries which are undefined if flagged.
  if (entry.skipUndefinedValue
    && typeof entry.value === 'undefined'
    && !entry.edit) return true;

  // Skip entries which are null if flagged.
  if (entry.skipNullValue
    && entry.value === null
    && !entry.edit) return true;

}