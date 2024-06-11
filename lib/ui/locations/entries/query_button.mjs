/**
mapp.ui.locations.entries.query_button(entry)

The method returns a button element which will execute a parameterised query.
"reload" is used to reload the location.layer after the query has been executed (e.g. when the location geometry has been updated).
"dependents" is used to reload the dependent fields after the query has been executed.
"alert" is used to display a message after the query has been executed.
@example
```json
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
@module query_button
*/


/**
### mapp.ui.locations.entries.query_button(entry)

Returns a button to execute a parameterised query.

@function query_button
@param {Object} [entry]
@param {string} [entry.query] The query template.
@param {string} entry.label The button label.
@param {Object} entry.queryparams Parameter object.
@returns {HTMLElement} The query button element.
*/
export default function query_button(entry) {

    if (!entry.query) {
      console.warn('You must provide a query to use "type": "query_button".');
      return;
    };
  
    // If a label is provided, use it, otherwise use the default
    entry.label ??= 'Update Entry With Query';
  
    // Return button to update the entry.
    return mapp.utils.html.node`
      <button 
        class="flat wide bold primary-colour"
        onclick=${() => query(entry)}>${entry.label}`;
  };
  
  /**
     ### query(entry)
     Executes a parameterised query.
     The paramString is created from the queryParams utility response.
     The `entry.host` defaults to the mapview.host concatenated with the `/api/query` path.
     @function query
     @param {Object} [entry]
     @param {string} [entry.query] The query template.
     @param {Object} entry.queryparams Parameter object.
     @param {string} entry.host The host for the query.
     @param {string} entry.alert Alert message (optionaL) - displays after the query has executed.
     @param {boolean} entry.reload Reload location.layer (optional) - useful when the location geometry has been updated to refresh the layer.
     @param {Array} entry.dependents Reload dependent fields (optional) - when the query has executed, the dependent fields will be reloaded.
     @returns {HTMLElement} The query button element.
     */
  async function query(entry) {
  
    // Disable location view.
    entry.location.view.classList.add('disabled');
  
    entry.queryparams ??= {}
  
    entry.queryparams.template = entry.query
  
    // Stringify paramString from object.
    const paramString = mapp.utils.paramString(mapp.utils.queryParams(entry))
  
    // 
    entry.host ??= entry.location.layer.mapview.host + '/api/query'
  
    // Run query to get data to update the entry on the db.
    const response = await mapp.utils.xhr(`${entry.host}?${paramString}`);
  
    if (response instanceof Error) {
  
      alert('Query failed.')
  
      // Enable location view.
      entry.location.view.classList.remove('disabled');
  
      return;
    }
  
    entry.value = response
  
    entry.alert && alert(entry.alert)
  
    entry.reload && entry.location.layer.reload()
  
    // Warning for legacy config.
    if (entry.updated_fields) {
  
      console.warn('entry.updated_fields is deprecated, please use entry.dependents instead.');
  
      // If entry.updated_fields, set to entry.dependents and warn
      entry.dependents ??= entry.updated_fields;
    }
  
    if (entry.dependents) {
  
      // Reload the dependent fields
      await entry.location.syncFields(entry.dependents)
  
    }
  
    // Updating the view will enable the view itself.
    // No need to enable the button and view themselves.
    entry.location.view.dispatchEvent(new Event('updateInfo'))
  
    // Enable location view.
    entry.location.view.classList.remove('disabled');
  }
  