/**
The query_button [location] entries module exports the query_button method as default.

@requires /utils/queryParams

@module /ui/locations/entries/query_button
*/

/**
@function query_button

@description
## mapp.ui.locations.entries.query_button(entry)
Returns a button element. The `query(entry)` method will be called by the button onclick event.

```js
{
  "label": "Snap to Postal Sector",
  "type": "query_button",
  "query": "catchment_statistics_snap_to_postal_sector",
  "queryparams": {
    "id": true
  },
  "alert": "Query has executed!",
  "reload": true,
  "dependents": [
    "geom_3857",
    "perimeter",
    "area"
  ]
}
```

@param {infoj-entry} entry type:query_button infoj entry.

@returns {HTMLElement} Location view entry node.
*/

export default function _query_button(entry) {
  if (!entry.query) {
    console.warn('You must provide a query to use "type": "query_button".');
    return;
  }

  // If a label is provided, use it, otherwise use the default
  entry.label ??= `Run query:${entry.query}`;

  // Return button to update the entry.
  return mapp.utils.html.node`
    <button 
      class="flat wide bold"
      onclick=${() => query(entry)}>${entry.label}`;
}

/**
@function query
@async

@description
Will be called by the onclick event of the query_button element.

The `entry.location.view` will be disabled.

Runs the `entry.query` template with the provided `entry.queryparams`.

The `entry.host` defaults to the entry.mapview.host concatenated with the `/api/query` path.

The location.layer will reload after the query response with the `entry.reload` flag.

The entry values of fields in the `entry.dependents` array will be synched after the query has been resolved.

The `entry.alert` message will be displayed after the query has been resolved.

The `entry.location.view` will be enabled by calling the `updateInfo` element event.

@param {infoj-entry} entry type:query_button infoj entry.
@property {string} entry.query Query template.
@property {Object} [entry.queryparams] Parameter for query in template.
@property {string} [entry.host] The host for the query.
@property {string} [entry.alert] Alert message after the query has responded.
@property {boolean} [entry.reload] Reload location.layer if true.
@property {Array} [entry.dependents] Reload dependent entry.field values.
*/

async function query(entry) {
  // Warning for legacy config.
  if (entry.updated_fields) {
    console.warn(
      'entry.updated_fields is deprecated, please use entry.dependents instead.',
    );

    // If entry.updated_fields, set to entry.dependents and warn
    entry.dependents ??= entry.updated_fields;
  }

  // Disable location view.
  entry.location.view.classList.add('disabled');

  entry.queryparams ??= {};

  entry.queryparams.template = entry.query;

  // Stringify paramString from object.
  const paramString = mapp.utils.paramString(mapp.utils.queryParams(entry));

  entry.host ??= entry.location.layer.mapview.host + '/api/query';

  // Run query to get data to update the entry on the db.
  const response = await mapp.utils.xhr(`${entry.host}?${paramString}`);

  if (response instanceof Error) {
    alert('Query failed.');

    // Enable location view.
    entry.location.view.classList.remove('disabled');

    return;
  }

  entry.value = response;

  entry.alert && alert(entry.alert);

  entry.reload && entry.location.layer.reload();

  if (entry.dependents) {
    // Reload the dependent fields
    await entry.location.syncFields(entry.dependents);
  }

  // Updating the view will enable the view itself.
  // No need to enable the button and view themselves.
  entry.location.view.dispatchEvent(new Event('updateInfo'));

  // Enable location view.
  entry.location.view.classList.remove('disabled');
}
