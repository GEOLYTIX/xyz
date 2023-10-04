mapp.utils.merge(mapp.dictionaries, {
  en: {
    layer_filter_header: 'Filter',
    layer_filter_select: 'Select filter from list',
    layer_filter_clear_all: 'Clear all filters',
    layer_filter_greater_than: 'Greater than',
    layer_filter_less_than: 'Less than',
  },
  de: {
    layer_filter_header: 'Filter',
    layer_filter_select: 'Filter Auswahl',
    layer_filter_clear_all: 'Entferne alle Filter'
  },
  cn: {
    layer_filter_header: '筛选',
    layer_filter_select: '从列表筛选',
  },
  pl: {
    layer_filter_header: 'Filtruj',
    layer_filter_select: 'Wybierz filtr z listy',
  },
  ko: {
    layer_filter_header: '필터',
    layer_filter_select: '리스트로 부터 필터 선택',
  },
  fr: {
    layer_filter_header: 'Filtres',
    layer_filter_select: 'Choisir un filtre dans la liste',
  },
  ja: {
    layer_filter_header: 'フィルター',
    layer_filter_select: 'リストからフィルターを選択',
  }
})

export default layer => {

  // Do not create the panel.
  if (layer.filter.hidden) return;

  // Layer without an infoj array of entries do not have a filter panel.
  if (!layer.infoj) return;

  layer.filter.list = layer.infoj
    .filter(entry => entry.filter !== undefined)
    .filter(entry => !layer.filter?.exclude?.includes(entry.field))
    .filter(entry => ![entry.key, entry.field, entry.query, entry.type, entry.group].some(val => new Set(layer.infoj_skip || []).has(val)))
    .map(entry => {

      // The filter is defined as a string e.g. "like"
      if (typeof entry.filter === 'string') {

        // Create filter object with the filter key value as type.
        entry.filter = {
          type: entry.filter,
          field: entry.field
        }
      }

      // Assign entry.title as filter title if not explicit in filter config.
      entry.filter.title ??= entry.title

      // Assign entry.field as filter field if not explicit in filter config.
      entry.filter.field ??= entry.field

      return entry.filter
    })

  if (!layer.filter.list.length) return;

  const dropdown = mapp.ui.elements.dropdown({
    data_id: `${layer.key}-filter-dropdown`,
    placeholder: mapp.dictionary.layer_filter_select,
    keepPlaceholder: true,
    entries: layer.filter.list,
    callback: async (e, filter) => {

      // Display clear all button.
      layer.filter.view.querySelector('[data-id=clearall]').style.display = 'block';

      // Return if filter card already exists.
      if (filter.card) return;

      filter.remove = () => {
        delete layer.filter.current[filter.field];
        delete filter.card
        layer.reload();

        // The changeEnd event will trigger dataview updates if set.
        layer.mapview.Map.getTargetElement().dispatchEvent(new Event('changeEnd'))

        // enable zoomToExtent button.
        let btn = layer.view.querySelector('[data-id=zoomToExtent]')
        if (btn) btn.disabled = false;

        // Only show the clearall filter button when filter cards are displayed as children to the filter view.
        layer.filter.view.querySelector('[data-id=clearall]').style.display = layer.filter.view.children.length === 3 ? 'none' : 'block';
      };

      // Return if no interface method for the filter type exists.
      if (!mapp.ui.layers.filters[filter.type]) return;

      // Get interface content for filter card.
      const content = [await mapp.ui.layers.filters[filter.type](layer, filter)].flat()

      // Add meta element to beginning of contents array.
      filter.meta && content.unshift(mapp.utils.html.node`<p>${filter.meta}`)

      filter.card = layer.filter.view.appendChild(mapp.ui.elements.card({
        header: filter.title,
        close: filter.remove,
        content
      }))
    }
  })

  const clearAll = mapp.utils.html`
    <button
      data-id=clearall
      class="primary-colour"
      style="display: none; margin-bottom: 5px;"
      onclick=${e => {

      layer.filter.list
        .filter((filter) => filter.card)
        .forEach(filter => {
          filter.card.querySelector('[data-id=close]').click()
        })

      // enable zoomToExtent button.
      let btn = layer.view.querySelector('[data-id=zoomToExtent]')

      if (btn) btn.disabled = false;

      layer.reload()

    }}>${mapp.dictionary.layer_filter_clear_all}`

  layer.filter.view = mapp.ui.elements.drawer({
    data_id: `filter-drawer`,
    class: `raised ${layer.filter.classList || ''}`,
    header: mapp.utils.html`
      <h3>${mapp.dictionary.layer_filter_header}</h3>
      <div class="mask-icon expander"></div>`,
    content: mapp.utils.html`
      ${dropdown}
      ${clearAll}`
  })

  return layer.filter.view
}
