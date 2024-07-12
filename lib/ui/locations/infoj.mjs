/**
## ui/locations/infoj

The infoj module exports a default method to process the infoj entries of a location.

@module /ui/locations/infoj
*/

/**
### mapp.ui.infoj(location, infoj_order)

The infoj methods iterates through the location's infoj [entries] array.

mapp.ui.locations.entries{} methods matching the entry type keyvalue are called with the entry as argument.

The HTMLelements returned from a location entry method are appended to entry.listview which is appended to the location.view.

The infoj_order array argument provides an option to extend the location infoj_array with entries not stored in the location.layer.infoj array.

The infoj_order array may contain string entries which allow to order entries before processing. Ordered infoj_order string values are used to map infoj entries with matching key, field, or query values. Infoj entries which are not matched by infoj_order string values will be excluded from being processed for the creation of the location view.

@function infoj
@param {Object} location A decorated location object.
@param {Object} location.layer A decorated layer object to which the location belongs.
@param {Object} location.view Location view HTMLElement.
@param {array} infoj_order Optional array to order and expand the infoj array.
@return {HTMLElement} listview grid element with entry elements.
*/

let groups

export default function infoj(location, infoj_order) {

  if (!location.infoj) return

  // Create a grid view div.
  const listview = mapp.utils.html.node`<div class="location-view-grid">`

  // Create object to hold view groups.
  groups = {}

  // The infoj_order may be assigned to the layer.
  infoj_order ??= location?.layer?.infoj_order

  // infoj argument is provided as an array of strings to filter the location infoj entries.
  const infoj = Array.isArray(infoj_order) ?
    infoj_order.map(_entry => {

      if (typeof _entry === 'string') {
        const infoj_order_field = location.infoj.find(entry => (entry.key || entry.field || entry.query) === _entry);

        // if undefined then warn the user.
        if (!infoj_order_field) console.warn(`infoj_order field: "${_entry}" not found in location.infoj. Please add entry.key, entry.field, or entry.query to the entry.`);

        // Check whether the _entry string matches an infoj entry keyvalue.
        return infoj_order_field

      } else if (typeof _entry === 'object') {

        _entry.location = location

        // Return object _entry.
        return _entry
      }
    }).filter(entry => entry !== undefined)
    : location.infoj;

  
  let keyIdx = 0;

  // Iterate through info fields and add to info table.
  for (const entry of infoj) {

    entry.key ??= entry.field || keyIdx++

    // The location view entries should not be processed if the view is disabled.
    if (location.view?.classList.contains('disabled')) break;

    // Location view elements will appended to the entry.listview element.
    entry.listview = listview

    // The default entry type is text.
    entry.type = entry.type || 'text'

    entryJSONB(entry)

    entryObject(entry)

    // Skip entry depending on flag and value.
    if (entrySkip(entry)) continue;

    entryNullValue(entry)

    entryDefault(entry)

    entryGroup(entry)

    entryNode(entry)

    entryTitle(entry)

    if (entryQuery(entry)) continue;

    // Check whether a method exists for the entry type.
    if (!Object.hasOwn(mapp.ui.locations.entries, entry.type)) {
      console.warn(`entry.type:${entry.type} method not found.`)
      continue;
    }

    // Execute the entry.type method providing the entry as only argument.
    const el = mapp.ui.locations.entries[entry.type]?.(entry)

    // Append any HTMLElement returned from the entry.type method to the entry.node element.
    el && entry.node.append(el)
  }

  return listview
}

/**
The entryJSONB(entry) method assign an entry.value from a jsonb object contained in the entry.value assigned by the location.get method.

The entry must have an JSON object value which is not null.

The entry.jsonb_field and entry.jsonb_key must be configured and found in the entry.value object.

@param {Object} entry 
@param {string} entry.jsonb_field Lookup of field in jsonb value object.
@param {string} entry.jsonb_key Lookup of key value in jsonb.field valye object.
*/

function entryJSONB(entry) {
  if (!entry.jsonb_field) return;
  if (!entry.jsonb_key) return;
  if (entry.value === null) return;
  if (typeof entry.value !== 'object') return;
  if (!entry.value.jsonb) return;

  entry.value = entry.value.jsonb[entry.jsonb_field][entry.jsonb_key]
}

/**
The entryObject(entry) method can be used to lookup another entry and assign or merge the found entry object value.

A entry.json_key in combination with entry.json_field can be configured to assign a specific JSON key value to the entry.

@function entryObject
@param {Object} entry
@param {string} entry.objectAssignFromField - Lookup for json value entry for object assign.
@param {string} entry.objectMergeFromField Lookup for json value entry for object merge.
@param {string} entry.json_field Lookup for json value entry.
@param {string} entry.json_key Required for json_field assignment.
*/

function entryObject(entry) {

  const field = entry.objectAssignFromField || entry.objectMergeFromField || entry.json_field

  // entry must have a lookup field
  if (!field) return;

  const fieldEntry = entry.location.infoj.find(_entry => _entry.field === field)

  // info must contain a matching fieldEntry
  if (!fieldEntry) return;

  // fieldEntry must have an object type value.
  if (typeof fieldEntry.value !== 'object') return;

  // Lookup for json value field entry
  if (entry.json_field) {

    if (!entry.json_key) {
      console.warn('json_field requires entry.json_key to be specified')
      return;
    }

    // The fieldEntry value may be null or undefined.
    if (!fieldEntry.value) return;

    entry.value = fieldEntry.value[entry.json_key]
  }

  if (entry.objectAssignFromField) {

    Object.assign(entry, fieldEntry.value)
  }

  if (entry.objectMergeFromField) {

    mapp.utils.merge(entry, fieldEntry.value)
  }
}

/**
The entrySkip(entry) methods checks whether a entry should be skipped from being processed in the iteration of infoj entries.

Skipping may be conditional on the entry.value.

Entries with falsy, null, or undefined values may be skipped if the entry is not editable.

A layer.infoj_skip[] array can be configured to define which infoj entries should be skipped.

@function entrySkip
@param {Object} entry 
@param {Object} entry.value
@param {Object} entry.skipEntry Entry will always be skipped.
@param {Object} entry.skipFalsyValue Entry with falsy value will be skipped.
@param {Object} entry.skipUndefinedValue Entry with undefined value will be skipped.
@param {Object} entry.skipNullValue - Entry with null value will be skipped.
*/

function entrySkip(entry) {

  // Skip entry, no matter what.
  if (entry.skipEntry) return true;

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

/**
@function entryNullValue

@description
The entryNullValue method will assign the nullValue property value as entry.value for non editable entries only.

@param {infoj-entry} entry An infoj-entry typedef object.
*/

function entryNullValue(entry) {

  // Assign a default nullValue
  if (entry.nullValue === undefined) return;

  // The nullValue is only applied to non editable entries.
  if (entry.edit) return;

  // Assign nullValue to nullish entry.value.
  entry.value ??= entry.nullValue;
}

/**
@function entryDefault

@description
The entryDefault method will assign the entry.default property value as entry.newValue on editable entries.

@param {infoj-entry} entry An infoj-entry typedef object.
*/

function entryDefault(entry) {

  // The entry.default must be defined.
  if (entry.default === undefined) return;

  if (!entry.edit) return;

  entry.newValue = entry.default
  entry.location.view?.dispatchEvent(
    new CustomEvent('valChange', {
      detail: entry
    }))
}

/**
The entryGroup(entry) method will create a new group for each unique entry.group string.

Entry elements in the same group will be added to a group element drawer added to the entry[location].listview.

@function entryGroup
@param {Object} entry
@param {string} entry.group The group key.
@param {string} entry.groupClassList Group element classlist.
@param {boolean} entry.expanded The 'expanded' class will be concatenated with group element classlist.
@param {HTMLDivElement} entry.listview The entry [location] listview.
*/

function entryGroup(entry) {
  
  if (!entry.group) return;

  // Create new group
  if (!groups[entry.group]) {

    groups[entry.group] = entry.listview.appendChild(
      mapp.ui.elements.drawer({
        class: `group`,
        header: mapp.utils.html`
          <h3>${entry.group}</h3>
          <div class="mask-icon expander"></div>`,
      }))
  }

  if (typeof entry.groupClassList === 'string') {
    groups[entry.group].classList.add(...entry.groupClassList.split(' '))
  }

  // The group will replace the entry listview to which elements will be appended.
  entry.listview = groups[entry.group]
}

/**
The entryNode(entry) method creates the entry.node div element with a concatenated classlist.

The entry.node element is appended to the entry[location].listview.

@function entryNode
@param {Object} entry
@param {string} entry.type Concatenate with entry.node classlist. 
@param {string} entry.class Concatenate with entry.node classlist.
@param {boolean} entry.inline Add 'inline' to entry.node classlist.
*/

function entryNode(entry) {

  const classString = `contents ${entry.type} ${entry.class || ''} ${entry.inline && 'inline' || ''}`

  entry.node = entry.listview.appendChild(mapp.utils.html.node`
  <div
    data-type=${entry.type}
    class=${classString}>`)
}

/**
The entryTitle methods checks whether a title element should be appended to the entry.node before any entry.type elements.

@function entryTitle
@param {Object} entry
@param {Object} entry.title The title value.
*/

function entryTitle(entry) {

  if (!entry.title) return;

  // Append title element to entry.node
  entry.node.append(mapp.ui.locations.entries.title(entry))
}

/**
The entryQuery(entry) method checks whether a query should be executed to populate the entry.value.

mapp.utils.paramString(mapp.utils.queryParams(entry)) will be used to create a parameter string for the query request from the entry.queryparams.

A query flagged with entry.run or entry.queryCheck will be executed immediately.

The infoj iteration will continue if the entryQuery method returns true.

The entry can be skipped depending on the response value.

The entry method will be called with the response value once the xhr utility promise has been resolved.

@function entryQuery
@param {Object} entry
@param {string} entry.query The query template.
@param {string} entry.queryparams Parameter for the query.
@param {boolean} entry.queryCheck Query should be immediate.
@param {boolean} entry.run Query should be immediate.
@param {boolean} entry.hasRan Flag whether query has been executed.
*/

function entryQuery(entry) {

  if (!entry.query) return;

  // Assign queryparams from layer, and locale.
  entry.queryparams = {
    ...entry.queryparams,
    ...entry.location.layer?.queryparams,
    ...entry.location.layer?.mapview?.locale?.queryparams
  }

  // Check whether query returns data.
  if (entry.queryCheck || entry.run === true) {

    // Stringify paramString from object.
    const paramString = mapp.utils.paramString(mapp.utils.queryParams(entry))

    // Delete run 
    delete entry.run;

    // Add flag to outline it has already been ran
    entry.hasRan = true;

    // Assign location layer or mapp.host as fallback if not implicit.
    entry.host ??= entry.location?.layer?.mapview?.host || mapp.host

    // Run the entry query.
    mapp.utils
      .xhr(`${entry.host}/api/query?${paramString}`)
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
