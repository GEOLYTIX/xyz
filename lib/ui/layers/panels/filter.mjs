/**
## /ui/layers/panels/filter

The filter panel module exports the filterPanel method for the creation of a filter panel in the layer view.

Dictionary entries:
- layer_filter_header
- layer_filter_select
- layer_filter_clear_all
- layer_filter_reset_all

@requires /dictionary 

@module /ui/layers/panels/filter
*/

/**
@function filterPanel

@description
The filterPanel method creates a list of available filter from the layer infoj entries.

A dropdown will be created to select the filter. The dropdown callback will create a filter card element and append this element to the drawer.

A clearAll button is created and appended to the drawer. The clearAll button will only be visible when filter with cards are in the filter.list.

@param {Object} layer 
@property {Array} layer.infoj Array of infoj entries.

@returns {HTMLElement} The filter panel drawer element.
*/
export function filterPanel(layer) {

  // Do not create the panel.
  if (layer.filter.hidden) return;

  //Default to true for displaying the feature count
  layer.filter.location_count ??= {}
  layer.filter.location_count.hidden = layer.filter.location_count.hidden === undefined ? false : layer.filter.location_count.hidden

  // Layer without an infoj array of entries do not have a filter panel.
  if (!layer.infoj) return;

  layer.filter.list = layer.infoj
    .filter(entry => entry.filter !== undefined)
    .filter(entry => entry.field !== undefined)
    .map(entry => {

      // The filter is defined as a string e.g. "like"
      if (typeof entry.filter === 'string') {

        // Create filter object with the filter key value as type.
        entry.filter = {
          type: entry.filter,
          field: entry.field
        }
      }

      return entry;
    })
    .filter(entry => Object.hasOwn(mapp.ui.layers.filters, entry.filter.type))
    .filter(entry => !layer.filter?.exclude?.includes(entry.field))
    .filter(entry => !entry.skipEntry)
    .map(entry => {

      // Assign entry.title as filter title if not explicit in filter config.
      entry.filter.title ??= entry.title

      // Assign entry.field as filter field if not explicit in filter config.
      entry.filter.field ??= entry.field

      return structuredClone(entry.filter)
    })

  if (!layer.filter.list.length) return;

  layer.filter.dropdown = mapp.ui.elements.dropdown({
    data_id: `${layer.key}-filter-dropdown`,
    placeholder: mapp.dictionary.layer_filter_select,
    keepPlaceholder: true,
    entries: layer.filter.list,
    callback: async (e, filter) => {

      filter.li = e.target

      if (filter.li.classList.contains('selected')) {

        mapp.ui.layers.filters.removeFilter(layer, filter)
        return;
      }

      filter.li.classList.add('selected')

      // Return if filter card already exists.
      if (filter?.card) return;

      // Display clear and reset all button.
      layer.filter.clearAll.style.display = 'inline-block';
      layer.filter.resetAll.style.display = 'inline-block';

      if(typeof layer.tableCurrent === 'function' && layer?.tableCurrent() && !layer.filter.location_count.hidden){
        updateCount(layer)
        layer.filter.feature_count.style.setProperty('display','block');
      }

      // Get interface content for filter card.
      filter.content = [await mapp.ui.layers.filters[filter.type](layer, filter)].flat()

      // Add meta element to beginning of contents array.
      filter.meta && filter.content.unshift(mapp.utils.html.node`<p>${filter.meta}`)

      filter.header = filter.title

      filter.close = () => mapp.ui.layers.filters.removeFilter(layer, filter)

      filter.card = mapp.ui.elements.card(filter)

      layer.filter.view.append(filter.card)
    }
  })

  layer.filter.clearAll = mapp.utils.html.node`<button
    data-id=clearall
    class="flat underline"
    onclick=${e => {
      layer.filter.list
        .forEach(filter => mapp.ui.layers.filters.removeFilter(layer, filter))

    }}>${mapp.dictionary.layer_filter_clear_all}`

  layer.filter.resetAll = mapp.utils.html.node`<button
    data-id=resetall
    class="flat underline"
    onclick=${e => {
      layer.filter.list
        .forEach(filter => mapp.ui.layers.filters.resetFilter(layer, filter))

    }}>${mapp.dictionary.layer_filter_reset_all}`

  layer.filter.count = mapp.utils.html.node`<span class="bold">`

  layer.filter.feature_count = mapp.utils.html.node`<p class="flat" style="display:none">
      ${layer.filter.count} Location(s) match your criteria
    </p>`

  layer.filter.view = mapp.ui.elements.drawer({
    data_id: `filter-drawer`,
    class: `raised ${layer.filter.classList || ''}`,
    header: mapp.utils.html`
      <h3>${mapp.dictionary.layer_filter_header}</h3>
      <div class="mask-icon expander"></div>`,
    content: mapp.utils.html`
      ${layer.filter.dropdown}
      ${layer.filter.clearAll}
      ${layer.filter.resetAll}
      ${layer.filter.feature_count}`
  })

  return layer.filter.view
}

export async function updateCount(layer){

  layer = await layer;
  if(layer && !layer.filter.location_count.hidden){
    const feature_count = await mapp.utils.locationCount(layer)

    layer.filter.count.innerText = feature_count
  }

  return layer
}
