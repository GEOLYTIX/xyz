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

A container element is returned if edit.options are defined. The async textoptions method is called to populate this container element.

A text input is returned if no options are configured.

@param {infoj-entry} entry type:geometry entry.
@property {Object} entry.value geometry as JSON value.
@property {Object} entry.edit configuration object for editing the value.
@property {array} [edit.options] options array for valid values.

@return {HTMLElement} elements for the location view.
*/
function textedit(entry) {
  // If edit options are defined.
  if (entry.edit.options) {
    // Create container with loading text.
    entry.container = mapp.utils.html.node`<div>${mapp.dictionary.loading}`;

    textoptions(entry);

    // Return container.
    return entry.container;
  }

  // Return text input if no options are defined (free text input).
  return mapp.utils.html.node`<input
    type="text"
    maxlength=${entry.edit.maxlength}
    value="${entry.newValue || entry.value || ''}"
    placeholder="${entry.edit.placeholder || ''}"
    onkeyup=${(e) => onkeyup(e, entry)}>`;
}
/**
@function onkeyup

@description
The method is triggered by the onkeyup event of the text input.

The newValue property is assigned from the event target input element.

The value will be split into an array if the arraySeparator string property is defined in the entry.edit configuration.

The location valChange event is dispatched to check whether the newValue is changed from the current value.

@param {event} e onkeyup event.
@param {infoj-entry} entry type:geometry entry.
@property {object} entry.newValue value for valChange check.
@property {object} entry.edit editing configuration.
@property {string} [edit.arraySeparator] string value used to split a string into an array value.
@property {location} entry.location location to update.
*/
function onkeyup(e, entry) {
  // Split target value as array if an arraySeparator has been provided.
  entry.newValue = entry.edit.arraySeparator
    ? e.target.value.split(entry.edit.arraySeparator)
    : e.target.value;

  entry.location.infoj.find((el) => {
    if (
      (entry.field === el.field || entry.json_field === el.json_field) &&
      el.edit
    ) {
      //Add update flag for rerunning distinct query
      el.edit.update = true;
    }
  });

  entry.location.view?.dispatchEvent(
    new CustomEvent('valChange', { detail: entry }),
  );
}

/**
@function textoptions
@async

@description
The textoptions method will render a dropdown control for the edit.options[] array values into the entry.container.

@param {infoj-entry} entry type:geometry entry.
@property {Object} entry.value geometry as JSON value.
@property {Object} entry.edit configuration object for editing the value.
*/
async function textoptions(entry) {
  if (!entry.edit.options.length || entry.edit.update) {
    // We can query a particular template or Query distinct field values from the layer table.
    if (entry.jsonb_field || entry.json_field) {
      entry.edit.query ??= 'distinct_values_json';
    }

    entry.edit.query ??= 'distinct_values';

    const paramString = mapp.utils.paramString({
      field: entry.json_field || entry.jsonb_field || entry.field,
      filter: entry.location.layer.filter?.current,
      id: entry.location.id,
      key: entry.jsonb_key || entry.json_key,
      layer: entry.location.layer.key,
      locale: entry.location.layer.mapview.locale.key,
      table: entry.location.layer.tableCurrent(),
      template: entry.edit.query,
    });

    const response = await mapp.utils.xhr(
      `${entry.location.layer.mapview.host}/api/query?${paramString}`,
    );

    // If response is null, we can not create a dropdown, so we return a message.
    if (response === null) {
      entry.container.innerHTML = `${mapp.dictionary.no_options_available}`;
      return;
    }

    // Return first value from object row as options array.
    entry.edit.options = [response].flat().map((row) => {
      return Object.values(row)[0];
    });

    //Remove update falg to prevent recalling.
    delete entry.edit.update;
  }

  if (entry.edit.radio) {
    radio(entry);
    return;
  }

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

  // Render dropdown into entry.container
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

function radio(entry) {
  // Create array of objects for optionEntries.
  const stations = entry.edit.options.map((option) => {
    const params = {
      data_id: option,
      name: entry.field,
      label: option,
      onchange: () => {
        // find checked radio in the group
        const checked_radio = stations.find((item) =>
          item.querySelector('input[type="radio"]:checked'),
        );
        // set new entry value from data-id
        entry.newValue = checked_radio.querySelector(
          'input[type="radio"]',
        ).dataset.id;
        // send value change event
        entry.location.view?.dispatchEvent(
          new CustomEvent('valChange', { detail: entry }),
        );
      },
    };
    // create each radio
    return mapp.ui.elements.radio(params);
  });

  if (entry.value) {
    // if value exists find the radio to be checked
    const current_radio = stations.find(
      (item) =>
        item.querySelector('input[type="radio"]').dataset.id === entry.value,
    );
    // current value doesn't match any value in the list
    if (current_radio)
      current_radio.querySelector('input[type="radio"]').checked = true;
  }

  // Render radio group
  mapp.utils.render(entry.container, mapp.utils.html.node`${stations}`);
}
