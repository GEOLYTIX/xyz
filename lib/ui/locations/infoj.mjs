export default (location, infoj) => {

  if (!location.infoj) return

  // Create a grid view div.
  const listview = mapp.utils.html.node`<div class="location-view-grid">`

  // Create object to hold view groups.
  const groups = {}

  // Iterate through info fields and add to info table.
  for (const entry of infoj || location.infoj) {

    // The location view entries should not be processed if the view is disabled.
    if (location.view && location.view.classList.contains('disabled')) break;

    // Location view elements will appended to the entry.listview element.
    entry.listview = listview

    // The default entry type is text.
    entry.type = entry.type || 'text'

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

    // Skip entries from infoj_skip array;
    if (Array.isArray(entry.location?.layer?.infoj_skip)) {

      // Check whether some val from this array is in infoj_skip set.
      if ([entry.key, entry.field, entry.query, entry.type, entry.group]
        .some(val => new Set(entry.location?.layer?.infoj_skip).has(val))) continue;
    }

    // Skip entry.
    if (entry.skipEntry) continue;

    // Skip entries which are falsy if flagged.
    if (entry.skipFalsyValue
      && !entry.value
      && !entry.edit) continue;

    // Skip entries which are undefined if flagged.
    if (entry.skipUndefinedValue
      && typeof entry.value === 'undefined'
      && !entry.edit) continue;

    // Skip entries which are null if flagged.
    if (entry.skipNullValue
      && entry.value === null
      && !entry.edit) continue;

    if (entry.nullValue
      && entry.value === null
      && !entry.defaults
      && !entry.edit) entry.value = entry.nullValue;

    // Groups must be checked first since it should be possible to next any type of location view element in a group.
    if (entry.group) {

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

    entry.node = entry.listview.appendChild(mapp.utils.html.node`
      <div
        data-type=${entry.type}
        class=${`contents ${entry.type} ${entry.class || ''} ${entry.inline && 'inline' || ''}`}>`)

    if (entry.title) {

      entry.node.append(mapp.utils.html.node`
        <div
          class="label"
          style="${`${entry.css_title || ''}`}"
          title="${entry.tooltip || null}">${entry.title}`)
    }

    // Check whether entry has a value
    if (entry.value === null || typeof entry.value === 'undefined') {

      // Assign the default value if set.
      entry.value = entry.default || entry.value
    }

    if (entry.query) {

      // Assign queryparams from layer, and locale.
      entry.queryparams = Object.assign(
        entry.queryparams || {}, 
        entry.location.layer.queryparams || {}, 
        entry.location.layer.mapview.locale.queryparams || {})

      // Check whether query returns data.
      if (entry.queryCheck || entry.run === true) {

        // Stringify paramString from object.
        const paramString = mapp.utils.paramString(mapp.utils.queryParams(entry))

        // Run the entry query.
        mapp.utils
          .xhr(`${entry.host || entry.location.layer.mapview.host}/api/query?${paramString}`)
          .then(response => {

            // Assign query response as entry value.
            entry.val = response;

            // Create element to be appended into empty entry.node
            const el = mapp.ui.locations.entries[entry.type]?.(entry)

            el && entry.node.append(el)
          })

        continue;
      }

    }

    // Create element to be appended into empty entry.node
    const el = mapp.ui.locations.entries[entry.type]?.(entry)

    // Break this for loop!
    if (el === 'break') break;

    el && entry.node.append(el)
  }

  return listview
}