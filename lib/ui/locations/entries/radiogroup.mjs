/**
Exports the radiogroup entry type

@module /ui/locations/entries/radiogroup
*/

/**
@function radiogroup

@description
Returns a radiogroup entry node for the location.view.
It requires a database column of type Boolean.
Radiobutton entries created with the same radiogroup name will function as mutually exclusive choice.
Each radio button has its own boolean field which can determine further actions for the data input.
Their placement in the infoj order does not matter as it is radiogroup name that determines them working together.
Radiogroup name is arbitrary and can be set to one of the field names of entries used in the group.

Example configuration for a group of 2 radiobuttons:

```json
{
    "field": "radiogroup",
    "title": "My radiogroup of 2 options",
    "label": "Choose me",
    "type": "radiogroup",
    "edit": true,
    "radiogroup": {
        "name": "my_radiogroup",
        "caption": "this happens if you choose this option"
    }
 },
 {
    "field": "radiogroup2",
    "label": "No choose me",
    "edit": true,
    "type": "radiogroup",
    "radiogroup": {
        "name": "my_radiogroup"
    }
}
```

@param {infoj-entry} entry type:numeric or type:integer infoj-entry typedef object.
@property {numeric} entry.value The entry value.
@property {numeric} [entry.newValue] The new entry value not yet stored.
@property {Boolean} [entry.edit] Makes radiobutton entry editable.
@property {Object} [entry.radiogroup] Configuration object for the radiogroup.
@property {String} [entry.radiogroup.name] Required value for grouping radiobuttons so that they work as a mutually exclusive group.
@property {String} [entry.radiogroup.caption] Placeholder for more text information on presented option.
@property {Object} [entry.label] Text label to display next to an option.

@returns {HTMLElement} Element to display a radiobutton which belongs to a group.
*/
export default function radiogroup(entry) {
  if (!entry.radiogroup?.name) return;

  entry.radiogroup.caption ??= '';

  const checked = entry.newValue !== undefined ? entry.newValue : entry.value;

  const options = {
    entry,
    checked,
    data_id: entry.field,
    caption: entry.radiogroup.caption,
    name: entry.radiogroup.name,
    label: entry.label,
  };

  if (entry.edit) {
    find_non_editable_members(entry);
    return mapp.ui.elements.radio({ ...{ onchange }, ...options });
  }

  return mapp.ui.elements.radio({ ...{ disabled: true }, ...options });
}

/**
@function onchange
@description
Function that runs following change event on a radiobutton, an onchange callback.
It toggles state of each radiogroup member based on most recent change.
Called automatically by the radiobutton ui element.
*/
function onchange(checked, params) {
  // tick off other siblings of the radiogroup
  params.entry.location.infoj
    .filter((item) => item.radiogroup)
    .filter((item) => item.radiogroup.name == params.entry.radiogroup.name)
    .filter((item) => item.field != params.entry.field)
    .forEach((item) => (item.newValue = false));

  // set current radio
  params.entry.newValue = checked;

  // send change event
  params.entry.location.view?.dispatchEvent(
    new CustomEvent('valChange', {
      detail: params.entry,
    }),
  );
}

/**
@function find_non_editable_members
@description
For an editable member of radiogroup this is a check whether all other members have been made editable.
In order to work correctly each member must have an edit flag otherwise radiogroup configuration may result in unexpected behaviour.
The function will warn if a non-editable radiogroup member is found. 
*/
function find_non_editable_members(entry) {
  // check for non-editable group members
  const non_editable = entry.location.infoj
    .filter((item) => item.radiogroup)
    .filter((item) => item.radiogroup.name == entry.radiogroup.name)
    .some((item) => !item.edit);

  if (non_editable)
    console.warn(
      `layer "${entry.location.layer.key}", radiogroup "${entry.radiogroup.name}": non-editable group members found.`,
    );
}
