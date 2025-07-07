/**
## ui/locations/entries/text

The locations entries text module exports the default text entry as mapp.ui.locations.entries.text(entry)

Dictionary entries:
- loading
- no_options_available

@requires /dictionary 

@module /ui/locations/entries/text
*/

/**
@function text

@description
The text method will return the textedit function for editable entries or an HTML node with the formated field value.

Non editable entries without a value will return void.

@param {infoj-entry} entry type:geometry entry.
@property {Object} entry.value geometry as JSON value.
@property {Object} [entry.edit] configuration object for editing the value.

@return {HTMLElement} elements for the location view.
*/

export default function text(entry) {
  // Short circuit if not editable without a value.
  if (!entry.edit && !entry.value) return;

  // Return inputs for editing.
  if (entry.edit) return textedit(entry);

  // Return value as text, including prefix and suffix.
  return mapp.utils.html.node`
    <div
      class="val"
      style=${entry.css_val}>
      ${entry.prefix}${entry.value}${entry.suffix}`;
}

/**
@function textedit

@description
The textedit method will return input elements for editable type:text entries.

The container populated by the textoptions method will be returned if an options array has been defined in the edit object.

The options array will be populated with distinct values from the data at rest if the length of the options array is naught.

A text input is returned if no options are configured.

The oninput method for the text input will split the value as an array if an arraySeparator has been defined in the entry.edit{} property.

@param {infoj-entry} entry type:geometry entry.
@property {Object} entry.value geometry as JSON value.
@property {Object} [entry.edit] configuration object for editing the value.

@return {HTMLElement} elements for the location view.
*/

function textedit(entry) {
  // If edit options are defined.
  if (entry.edit.options) {
    // Create container with loading text.
    entry.container = mapp.utils.html.node`<div>${mapp.dictionary.loading}`;

    // If options is an array and contains values, we can create a dropdown.
    if (entry.edit.options.length) {
      // Create dropdown from options.
      textoptions(entry);
    }
    // If options is empty array, we need to query the table to populate it.
    else {
      // We can query a particular template or Query distinct field values from the layer table.
      mapp.utils
        .xhr(
          `${entry.location.layer.mapview.host}/api/query?` +
            mapp.utils.paramString({
              field: entry.json_field || entry.jsonb_field || entry.field,
              filter: entry.location.layer.filter?.current,
              id: entry.location.id,
              key: entry.jsonb_key || entry.json_key,
              layer: entry.location.layer.key,
              locale: entry.location.layer.mapview.locale.key,
              table: entry.location.layer.tableCurrent(),
              template:
                entry.edit.query ||
                (entry.jsonb_field || entry.json_field
                  ? 'distinct_values_json'
                  : 'distinct_values'),
            }),
        )
        .then((response) => {
          // If response is null, we can not create a dropdown, so we return a message.
          if (response === null) {
            entry.container.innerHTML = `${mapp.dictionary.no_options_available}`;
            return;
          }

          // Return first value from object row as options array.
          entry.edit.options = [response].flat().map((row) => {
            return Object.values(row)[0];
          });

          // Create dropdown from options.
          textoptions(entry);
        });
    }

    // Return container.
    return entry.container;
  }

  // Return text input if no options are defined (free text input).
  return mapp.utils.html.node`
    <input
      type="text"
      maxlength=${entry.edit.maxlength}
      value="${entry.newValue || entry.value || ''}"
      placeholder="${entry.edit.placeholder || ''}"
      onkeyup=${onInput}>`;

  function onInput(e) {
    // Split target value as array if an arraySeparator has been provided.
    entry.newValue = entry.edit.arraySeparator
      ? e.target.value.split(entry.edit.arraySeparator)
      : e.target.value;

    entry.location.view?.dispatchEvent(
      new CustomEvent('valChange', { detail: entry }),
    );
  }
}

/**
@function textoptions

@description
The textoptions method will render a dropdown control for the edit.options[] array values into the entry.container.

@param {infoj-entry} entry type:geometry entry.
@property {Object} entry.value geometry as JSON value.
@property {Object} [entry.edit] configuration object for editing the value.
*/

function textoptions(entry) {
  // Create array of objects for optionEntries.
  const optionEntries = entry.edit.options.map((option) => ({
    // Assign null if option is null.
    option:
      option === null
        ? null
        : // Assign string as option.
          (typeof option === 'string' && option) ||
          // Assign first value as option.
          Object.values(option)[0],

    // Assign null if option is null.
    title:
      option === null
        ? null
        : // Assign string as title.
          (typeof option === 'string' && option) ||
          // Assign first key as title.
          Object.keys(option)[0],
  }));

  // Find title for the entry.value
  const option = optionEntries.find((e) => e.option === entry.value);

  const placeholder =
    entry.value !== undefined ? entry.value : entry.edit.placeholder;

  // Render dropdown.
  mapp.utils.render(
    entry.container,
    mapp.ui.elements.dropdown({
      callback: (e, _entry) => {
        // Assign entry option as newValue.
        entry.newValue = _entry.option;

        // Check whether newValue is different from current value.
        entry.location.view?.dispatchEvent(
          new CustomEvent('valChange', {
            detail: entry,
          }),
        );
      },
      entries: optionEntries,
      // Set entries to optionEntries provided.
      placeholder,
      span: option?.title || entry.value,
    }),
  );
}
