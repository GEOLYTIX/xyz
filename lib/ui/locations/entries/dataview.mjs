/**
## ui/locations/entries/dataview

The dataview entry module exports the dataview method as mapp.ui.locations.entries.dataview()

@requires /ui/Dataview

@module /ui/locations/entries/dataview
*/

/**
@function dataview

@description
### mapp.ui.locations.entries.dataview()

The `dataview.data{}` will be assigned from the entry.value if available.

The `dataview.layer` will be assigned from the `entry.location.layer`

A document lookup for the target ID will be attempted if the target is provided as string. The dataview will be decorated, created, and updated in this case.

A dataview has already been decorated if a `dataview.update` method exists. The entry method will check the display condition to show the dataview and return the entry HTMLElements.

The `dataview.tabview` will be assigned if the document queryselector finds a matching data-id, eg. "tabview".

The dataview will be added as a new tab to the tabview.

A locationViewTarget element will be created and returned to the location.view without a tabview or implicit target element for the dataview.

The dataview entry is decorated to be a `typedef:dataview` object by passing the entry as argument to the `mapp.ui.Dataview(entry)` method.

A decorated dataview entry will have show(), hide(), and an update() method.

A checkbox element will be created if the dataview entry has a label.

The display flag controls whether the dataview should be immediately displayed.

The dataview checkbox and locationViewTarget elements will be returned if available.

@param {infoj-entry} entry type:dataview entry.
@property {location} entry.location The entry location.
@property {layer} entry.layer The entry layer will be assigned from the entry.location.
@property {Object} entry.data The dataview data.
@property {string} [entry.label] Label for checkbox element.
@property {string} [entry.dataview] The dataview type, eg. "chartjs", "tabulator".
@property {string} [entry.target] The dataview target. Will resolve to HTMLElement.
@property {Function} [entry.update] The dataview update method.
@property {boolean} [entry.display] The dataview display flag.
@property {Function} [entry.show] The dataview show method.
@property {Function} [entry.hide] The dataview hide method.
@property {HTMLElement} [entry.locationViewTarget] Dataview target for display in location.view.

@return {HTMLElement} Location view dataview and checkbox.
*/

export default function dataview(entry) {

  if (entry.value !== undefined) entry.data = entry.value;

  if (entry.data === null) {

    // The entry must be disabled if the query has run with querycheck:true and the data is null.
    // This is to prevent the query running over and over again getting the same result.
    entry._display = entry.display;
    delete entry.display;
    entry.disabled = true;

  } else {
    entry.display ??= entry._display;
    delete entry.disabled;
  }

  if (entry.label) {

    // Create checkbox if a label is provided.
    entry.chkbox = mapp.ui.elements.chkbox({
      data_id: entry.key,
      label: entry.label,
      checked: !!entry.display,
      disabled: entry.disabled,
      onchange: (checked) => {
        entry.display = checked;
        entry.display ? entry.show() : entry.hide();
      },
    });
  }

  // Dataview queries may require the layer and host to be defined on the entry.
  entry.layer ??= entry.location.layer;
  entry.host ??= entry.layer.mapview.host;

  // Dataview will be rendered into target identified by ID.
  if (
    typeof entry.target === 'string' &&
    document.getElementById(entry.target)
  ) {

    // Assign element by ID as target.
    entry.target = document.getElementById(entry.target);

    // Create and update the dataview.
    if (mapp.ui.Dataview(entry) instanceof Error) return;

    entry.update();
    return;
  }

  // Dataview has already been created. e.g. after the location (view) is updated, and it is not dynamic.
  if (entry.update && !entry.dynamic) {

    if (entry.display) entry.show?.();

    // Return elements to location view.
    return mapp.utils.html.node`
      ${entry.chkbox || ''}
      ${entry.locationViewTarget || ''}`;
  }

  if (
    typeof entry.target === 'string' &&
    document.querySelector(`[data-id=${entry.target}]`)
  ) {

    // Tabview entries return empty on mobile.
    if (mapp.utils.mobile()) return;

    // Assign tabview element from queryselector
    entry.tabview ??= document.querySelector(`[data-id=${entry.target}]`);
  }

  // Dataview will be rendered into a tabview panel.
  if (entry.tabview) {

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
      })
    );

  } else {

    // Dataview will be rendered into location view.
    const location_class = `location ${entry.key || entry.query}`;

    entry.locationViewTarget = mapp.utils.html.node`
      <div class="${location_class}">`;

    entry.target = entry.locationViewTarget;
  }

  // Decorate the dataview entry.
  if (mapp.ui.Dataview(entry) instanceof Error) return;

  // Dataview should be displayed.
  entry.display && entry.show?.();

  // Return elements to location view.
  return mapp.utils.html.node`
    ${entry.chkbox || ''}
    ${entry.locationViewTarget || ''}`;
}
