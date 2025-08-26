/**
## ui/locations/infoj

The infoj module exports a default method to process the infoj entries of a location.

@requires /ui/locations/entries
@requires /utils/queryParams
@requires /utils/paramString
@requires /utils/xhr
@requires /utils/merge

@module /ui/locations/infoj
*/

/**
@function infoj

@description
The infoj methods iterates through the location's infoj [entries] array.

mapp.ui.locations.entries{} methods matching the entry type keyvalue are called with the entry as argument.

The HTMLelements returned from a location entry method are appended to entry.listview which is appended to the location.view.

The infoj_order array argument provides an option to extend the location infoj_array with entries not stored in the location.layer.infoj array.

The infoj_order array may contain string entries which allow to order entries before processing. Ordered infoj_order string values are used to map infoj entries with matching key, field, or query values. Infoj entries which are not matched by infoj_order string values will be excluded from being processed for the creation of the location view.

@param {Object} location A decorated location object.
@param {array} infoj_order Optional array to order and expand the infoj array.
@property {Object} location.layer A decorated layer object to which the location belongs.
@property {Array} location.infoj Array of infoj-entry objects with values.
@property {HTMLElement} location.view Location view HTMLElement.

@return {HTMLElement} listview grid element with entry elements.
*/

let groups;
export default function infoj(location, infoj_order) {
  if (!location.infoj) return;

  // Create a grid view div.
  const listview = mapp.utils.html.node`<div class="location-view-grid">`;

  // Create object to hold view groups.
  groups = {};

  // The infoj_order may be assigned to the layer.
  infoj_order ??= location?.layer?.infoj_order;

  // infoj argument is provided as an array of strings to filter the location infoj entries.
  const infoj = Array.isArray(infoj_order)
    ? infoj_order.map(infoj_orderMap).filter((entry) => entry !== undefined)
    : location.infoj;

  /**
  @function infoj_orderMap

  @description
  The infoj_order argument allows to order and filter the location.layer.infoj array.

  The map function attempts to find and return an infoj-entry whose key, field, or query property values match the _entry string.

  If typeof object the _entry itself will be returned. This allows for additional infoj-entry objects to be spliced into the infoj array.

  @param {string|object} _entry
  @returns {infoj-entry} Either the _entry object itself, a lookup entry from the location.layer.infoj array, or undefined.
  */
  function infoj_orderMap(_entry) {
    if (typeof _entry === 'string') {
      // Find infoj-entry with matching key, field, or query property.
      const infoj_order_field = location.infoj.find((entry) =>
        new Set([entry.key, entry.field, entry.query]).has(_entry),
      );

      if (!infoj_order_field) {
        console.warn(
          `infoj_order field: "${_entry}" not found in location.infoj. Please add entry.key, entry.field, or entry.query to the entry.`,
        );
      }

      return infoj_order_field;
    } else if (typeof _entry === 'object') {
      _entry.location = location;

      return _entry;
    }
  }

  let keyIdx = 0;

  // Iterate through info fields and add to info table.
  for (const entry of infoj) {
    entry.key ??= entry.field || keyIdx++;

    // The location view entries should not be processed if the view is disabled.
    if (location.view?.classList.contains('disabled')) break;

    // Location view elements will appended to the entry.listview element.
    entry.listview = listview;

    // The default entry type is text.
    entry.type ??= 'text';

    if (entry.edit === true) {
      entry.edit = {};
    }

    entryJSONB(entry);

    entryObject(entry);

    // Skip entry depending on flag and value.
    if (entrySkip(entry)) continue;

    entryNullValue(entry);

    entryDefault(entry);

    entryGroup(entry);

    entryNode(entry);

    entryTitle(entry);

    if (entryQuery(entry)) continue;

    // Check whether a method exists for the entry type.
    if (!Object.hasOwn(mapp.ui.locations.entries, entry.type)) {
      console.error(`entry.type:${entry.type} method not found.`);
      continue;
    }

    // Execute the entry.type method providing the entry as only argument.
    const el = mapp.ui.locations.entries[entry.type]?.(entry);

    // Append any HTMLElement returned from the entry.type method to the entry.node element.
    el && entry.node.append(el);
  }

  return listview;
}

/**
@function entryJSONB

@description
The entryJSONB(entry) method assign an entry.value from a jsonb object contained in the entry.value assigned by the location.get method.

The entry must have an JSON object value which is not null.

The entry.jsonb_field and entry.jsonb_key must be configured and found in the entry.value object.

@param {infoj-entry} entry

@property {string} entry.jsonb_field Lookup of field in jsonb value object.
@property {string} entry.jsonb_key Lookup of key value in jsonb.field valye object.
*/
function entryJSONB(entry) {
  if (!entry.jsonb_field) return;
  if (!entry.jsonb_key) return;
  if (entry.value === null) return;
  if (typeof entry.value !== 'object') return;
  if (!entry.value.jsonb) return;

  entry.value = entry.value.jsonb[entry.jsonb_field][entry.jsonb_key];
}

/**
@function entryObject

@description
The entryObject(entry) method can be used to lookup another entry and assign or merge the found entry object value.

A entry.json_key in combination with entry.json_field can be configured to assign a specific JSON key value to the entry.

@param {infoj-entry} entry

@property {string} entry.objectAssignFromField Lookup for json value entry for object assign.
@property {string} entry.objectMergeFromField Lookup for json value entry for object merge.
@property {string} entry.json_field Lookup for json value entry.
@property {string} entry.json_key Required for json_field assignment.
*/
function entryObject(entry) {
  // Cannot have both objectAssignFromField and objectMergeFromField set to true.
  if (entry.objectAssignFromField && entry.objectMergeFromField) {
    console.warn(
      `${entry.key}: objectAssignFromField and objectMergeFromField cannot both be used on the same entry.`,
    );
    return;
  }

  const field =
    entry.objectAssignFromField ||
    entry.objectMergeFromField ||
    entry.json_field;

  // entry must have a lookup field
  if (!field) return;

  const fieldEntry = entry.location.infoj.find(
    (_entry) => _entry.field === field,
  );

  // info must contain a matching fieldEntry
  if (!fieldEntry) return;

  // fieldEntry must have an object type value.
  if (typeof fieldEntry.value !== 'object') return;

  // Lookup for json value field entry
  if (entry.json_field) {
    if (!entry.json_key) {
      console.warn('json_field requires entry.json_key to be specified');
      return;
    }

    // The fieldEntry value may be null or undefined.
    if (!fieldEntry.value) return;

    entry.value = fieldEntry.value[entry.json_key];
  }

  if (entry.objectAssignFromField) {
    Object.assign(entry, fieldEntry.value);
  }

  if (entry.objectMergeFromField) {
    mapp.utils.merge(entry, fieldEntry.value);
  }
}

/**
@function entrySkip

@description
The entrySkip(entry) methods checks whether a entry should be skipped from being processed in the iteration of infoj entries.

Skipping may be conditional on the entry.value.

Entries with falsy, null, or undefined values may be skipped if the entry is not editable.

A layer.infoj_skip[] array can be configured to define which infoj entries should be skipped.

@param {infoj-entry} entry

@property {Object} entry.value
@property {Object} entry.skipEntry Entry will always be skipped.
@property {Object} entry.skipFalsyValue Entry with falsy value will be skipped.
@property {Object} entry.skipUndefinedValue Entry with undefined value will be skipped.
@property {Object} entry.skipNullValue - Entry with null value will be skipped.
*/
function entrySkip(entry) {
  // Skip entry, no matter what.
  if (entry.skipEntry) return true;

  // Skip entries which are falsy if flagged.
  if (entry.skipFalsyValue && !entry.value && !entry.edit) return true;

  // Skip entries which are undefined if flagged.
  if (
    entry.skipUndefinedValue &&
    typeof entry.value === 'undefined' &&
    !entry.edit
  )
    return true;

  // Skip entries which are null if flagged.
  if (entry.skipNullValue && entry.value === null && !entry.edit) return true;
}

/**
@function entryNullValue

@description
The entryNullValue method will assigns the nullValue property value as entry.value for non editable entries only.

@param {infoj-entry} entry
@property {any} entry.nullValue Any JSON value; Must not be undefined.
@property {Object} entry.edit Must be falsy.
@property {any} entry.value
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

The valChange event of the entry.location.view HTMLElement will be called to indicate that the default value must be updated on the location.

@param {infoj-entry} entry An infoj-entry typedef object.

@property {Object} [entry.edit] The info-entry must have an edit config.
@property {any} entry.default Any JSON value to be assigned as default newValue.
@property {location} entry.location The location to which the entry belongs.
@property {HTMLElement} location.view The location view to which the entry.listview / entry.node will be appended.
*/
function entryDefault(entry) {
  // The entry.default must be defined.
  if (entry.default === undefined) return;

  if (!entry.edit) return;

  entry.newValue = entry.default;

  entry.location.view?.dispatchEvent(
    new CustomEvent('valChange', {
      detail: entry,
    }),
  );
}

/**
@function entryGroup

@description
The entryGroup(entry) method will create a new group for each unique entry.group string.

Entry elements in the same group will be added to a group element drawer added to the entry[location].listview.

The group layout will be expanded by adding the expanded class to the group elements classList if the entry.expanded property is true.

@param {infoj-entry} entry

@property {string} entry.group The group key.
@property {string} [entry.groupClassList] Group element classlist.
@property {boolean} [entry.expanded] The 'expanded' class will be concatenated with group element classList.
@property {HTMLElement} entry.listview The listview element will be returned from the infoj method and appended to the location.view.
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
          <div class="notranslate material-symbols-outlined caret"/>`,
      }),
    );
  }

  if (typeof entry.groupClassList === 'string') {
    groups[entry.group].classList.add(...entry.groupClassList.split(' '));
  }

  // The group will replace the entry listview to which elements will be appended.
  entry.listview = groups[entry.group];
}

/**
@function entryNode

@description
The method assigns a <div> element with no children as entry.node and appends the HTMLElement to the entry.listview.

This allows entry methods to render into the entry.node after the infoj iteration has completed.

A classList is assigned to the <div> element to represnt custom classes and layout (eg. inline).

@param {infoj-entry} entry

@property {string} entry.type Concatenate with entry.node classList.
@property {string} [entry.class] Concatenate with entry.node classList.
@property {boolean} [entry.inline] Add 'inline' to entry.node classList.
@property {HTMLElement} entry.listview The listview element will be returned from the infoj method and appended to the location.view.
*/
function entryNode(entry) {
  const classString = `contents ${entry.type} ${entry.class || ''} ${(entry.inline && 'inline') || ''}`;

  entry.node = entry.listview.appendChild(mapp.utils.html.node`
  <div
    data-type=${entry.type}
    class=${classString}>`);
}

/**
@function entryTitle

@description
The entryTitle methods will append a title element returned from mapp.ui.locations.entries.title(entry) to the entry.node if the entry.title is not falsy.

@param {infoj-entry} entry

@property {Object} entry.title The title value.
@property {HTMLElement} entry.node The entry HTMLElement to be appended to the location.view element grid.
*/
function entryTitle(entry) {
  if (!entry.title) return;

  // Append title element to entry.node
  entry.node.append(mapp.ui.locations.entries.title(entry));
}

/**
@function entryQuery

@description
The entryQuery() method checks whether a query should be executed to populate the entry.value.

A query will be executed everytime with either the `run` or `queryCheck` entry property.

A query will only be executed once with the `runOnce` entry property.

The infoj method for loop will continue if the entryQuery method returns true.

The queryCallback method will be assigned as default if undefined on the entry param.

The queryParams object will be processed by the queryParams utility method before a paramString is created for the query entry.url.

The query will be cancelled if the entry is provided to the XHR util before a previous query on the same entry object has been resolved.

The response and the entry will be provided as params to the queryCallback method once the XHR utility resolves the query.

The following json entry will be populated with the GeoJSON value from the geom_3857 field of the location.

```json
{
  "type": "json",
  "query": "json_query",
  "queryparams": {
    "table": true,
    "id": true
  },
  "runOnce": true,
  "blocking": true,
  "template": {
    "key": "json_query",
    "template": "SELECT ST_asGeoJSON(geom_3857) FROM ${table} WHERE glx_id = %{id}",
    "value_only": true
  }
}
```

@param {infoj-entry} entry

@property {string} entry.query The query template.
@property {string} entry.host The host for the XHR request.
@property {string} entry.queryparams Parameter for the query.
@property {boolean} entry.run Query should be immediate.
@property {boolean} entry.queryCheck Query should be immediate.
@property {function} entry.queryCallback The method to be executed with the query response as response argument.
*/
function entryQuery(entry) {
  if (!entry.query) return;

  // The run property does the same as the queryCheck property.
  entry.queryCheck ??= entry.run;

  entry.queryCallback ??= queryCallback;

  // Check whether query returns data.
  if (entry.runOnce || entry.queryCheck) {
    // The query will only be run once not every time.
    delete entry.runOnce;

    // Assign location layer or mapp.host as fallback if not implicit.
    entry.host ??= entry.location.layer?.mapview?.host || mapp.host;

    const queryParams = mapp.utils.queryParams(entry);

    const paramString = mapp.utils.paramString(queryParams);

    entry.url = `${entry.host}/api/query?${paramString}`;

    if (entry.blocking) {
      entry.location.view?.classList.add('loading');
    }

    mapp.utils
      .xhr(entry)
      .then((response) => entry.queryCallback(response, entry));

    return true;
  } else if (entry.field && !entry.xhr) {
    console.warn(
      `field:"${entry.field}" has a query:"${entry.query}" which is not set to run, please add the run or runOnce flag to the entry.`,
    );
  }
}

/**
@function queryCallback

@description
The queryCallback method is assigned as default callback method for entries with a query property.

@param {object} response The response from the entry.query
@param {infoj-entry} entry
*/
function queryCallback(response, entry) {
  if (entry.blocking) {
    entry.location.view?.classList.remove('loading');
  }

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
  const el = mapp.ui.locations.entries[entry.type]?.(entry);

  el && entry.node.appendChild(el);
}
