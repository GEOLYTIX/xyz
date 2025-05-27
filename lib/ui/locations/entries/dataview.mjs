/**
## ui/locations/entries/dataview

The dataview entry module exports the dataview method as mapp.ui.locations.entries.dataview()

@requires /ui/Dataview

@module /ui/locations/entries/dataview
*/

/**
@function dataview

@description
The entry object provided to the dataview entry method is effectively a dataview object.

The dataview data property is assigned from the entry value if not undefined in the location_get query response.

The assignTargetFromString method is called to consolidate the required dataview target as a HTMLElement.

The dataview will be shown if the boolean display property is true.

The HTMLElement returned from the method will contain a checkbox element if a label string property has been configured and a location view dataview target element.

@param {infoj-entry} entry type:dataview entry.
@property {location} entry.location The entry location.
@property {layer} entry.layer The entry layer will be assigned from the entry.location.
@property {Object} [entry.data] The dataview data.
@property {string} [entry.label] Label for checkbox element.
@property {string} [entry.dataview] The dataview type, eg. "chartjs", "tabulator".
@property {HTMLElement} [entry.target="location"] The dataview will be rendered into the target HTMLElement.
@property {Function} [entry.update] The dataview update method.
@property {boolean} [entry.display] The dataview display flag.
@property {Function} [entry.show] The dataview show method.
@property {Function} [entry.hide] The dataview hide method.

@return {HTMLElement} Location view dataview and checkbox.
*/
export default function dataview(entry) {
  if (entry.value !== undefined) {
    entry.data = entry.value;
  }

  // An empty data array is assumed to be null.
  if (entry.data?.length === 0) {
    entry.data = null;
  }

  // Dataview queries may be layer queries.
  entry.layer ??= entry.location.layer;

  assignTargetFromString(entry);

  // A dataview must have a HTMLElement target
  if (entry.target instanceof HTMLElement === false) return;

  // Decorate the dataview entry.
  if (mapp.ui.Dataview(entry) instanceof Error) return;

  //If queryCheck is true and theres no data, don't dislpay the dataview
  if ((!entry.data || entry.data instanceof Error) && entry.queryCheck) {
    entry.chkbox?.classList?.add?.('disabled');
    entry.chkbox.querySelector('input').checked = false;
    entry.display = false;
    entry.hide();
  }

  // Dataview should be displayed.
  entry.display && entry.show?.();

  // Return elements to location view.
  return mapp.utils.html.node`
    ${entry.chkbox || ''}
    ${entry.locationViewTarget || ''}`;
}

/**
@function assignTargetFromString

@description
The method assigns "location" as the default dataview [entry] target.

A lookup for an element with the id property matching the target string will be attempted. The dataview will always be displayed in the matched element and the method will shortcircuit.

The mapp default view has a tabview element with a "tabview" data-id property. The tab added to the tabview will be assigned as HTMLElement target.

Without a matched HTMLElement; A target <div> will be created and assigned as locationViewTarget to the dataview [entry].

@param {infoj-entry} entry type:dataview entry.
@property {string} [entry.target="location"] Target string identifying a HTMLElement target.
*/
function assignTargetFromString(entry) {
  // The location [view] is the default target for a location dataview entry.
  if (!entry.target) {
    entry.target = 'location';
  }

  if (typeof entry.target !== 'string') return;

  if (entry.target === 'dialog') {
    mapp.ui.utils.dataviewDialog(entry);

    return;
  }

  if (document.getElementById(entry.target)) {
    entry.target = document.getElementById(entry.target);
    entry.display = true;
    return;
  }

  if (document.querySelector(`[data-id=${entry.target}]`)) {
    // Tabview entries return empty on mobile.
    if (mapp.utils.mobile()) return;

    // Assign tabview element from queryselector
    entry.tabview ??= document.querySelector(`[data-id=${entry.target}]`);

    // Assign border style based on the location view record (from list)
    entry.tab_style ??= `border-bottom: 3px solid ${
      entry.location.style?.strokeColor || 'var(--color-primary)'
    }`;

    // Assign target html element for dataview.
    entry.target = mapp.utils.html.node`
      <div class="dataview-target">`;

    // Create tab after dataview creation is complete.
    entry.tabview.dispatchEvent(
      new CustomEvent('addTab', {
        detail: entry,
      }),
    );

    return;
  }

  // Dataview will be rendered into location view.
  const location_class = `location ${entry.key || entry.query}`;

  entry.locationViewTarget = mapp.utils.html.node`
    <div class="${location_class}">`;

  entry.target = entry.locationViewTarget;
}
