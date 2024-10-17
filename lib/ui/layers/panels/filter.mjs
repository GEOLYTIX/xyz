/**
## /ui/layers/panels/filter

The filter panel module exports the filterPanel method for the creation of a filter panel in the layer view.

@module /ui/layers/panels/filter
*/

mapp.utils.merge(mapp.dictionaries, {
  en: {
    layer_filter_header: 'Filter',
    layer_filter_select: 'Select filter from list',
    layer_filter_clear_all: 'Clear all filters',
    layer_filter_reset_all: 'Reset all filters',
    layer_filter_greater_than: 'Greater than',
    layer_filter_less_than: 'Less than',
    layer_filter_set_filter: 'Set filter',
  },
  de: {
    layer_filter_header: 'Filter',
    layer_filter_select: 'Filter Auswahl',
    layer_filter_clear_all: 'Entferne alle Filter',
    layer_filter_greater_than: 'Mehr als',
    layer_filter_less_than: 'Weniger als',
    layer_filter_set_filter: 'Filter einstellen',
  },
  zh: {
    layer_filter_header: '筛选',
    layer_filter_select: '从列表筛选',
    layer_filter_clear_all: '清除所有筛选',
    layer_filter_greater_than: '大于',
    layer_filter_less_than: '小于',
    layer_filter_set_filter: '设置筛选',
  },
  zh_tw: {
    layer_filter_header: '篩選',
    layer_filter_select: '從列表篩選',
    layer_filter_clear_all: '清除所有篩選',
    layer_filter_greater_than: '大於',
    layer_filter_less_than: '小於',
    layer_filter_set_filter: '設置篩選',
  },
  pl: {
    layer_filter_header: 'Filtruj',
    layer_filter_select: 'Wybierz z listy',
    layer_filter_clear_all: 'Wyczyść wszystkie filtry',
    layer_filter_greater_than: 'Większe niż',
    layer_filter_less_than: 'Mniejsze niż',
    layer_filter_set_filter: 'Ustaw filtr',
  },
  fr: {
    layer_filter_header: 'Filtre',
    layer_filter_select: 'Sélectionner un filtre de la liste',
    layer_filter_clear_all: 'Enlever tous les filtres',
    layer_filter_greater_than: 'Plus grand que',
    layer_filter_less_than: 'Moins que',
    layer_filter_set_filter: 'Définir le filtre',
  },
  ja: {
    layer_filter_header: 'フィルター',
    layer_filter_select: 'リストからフィルターを選択',
    layer_filter_clear_all: '全フィルターをクリア',
    layer_filter_greater_than: '以上',
    layer_filter_less_than: '以下',
    layer_filter_set_filter: 'フィルターを設定',
  },
  esp: {
    layer_filter_header: 'Filtro',
    layer_filter_select: 'Seleccionar filtro de la lista',
    layer_filter_clear_all: 'Anular todos los filtros',
    layer_filter_greater_than: 'Mas grande que',
    layer_filter_less_than: 'Menos que',
    layer_filter_set_filter: 'Definir el filtro',
  },
  tr: {
    layer_filter_header: 'Filtrele',
    layer_filter_select: 'Listeden filtre sec',
    layer_filter_clear_all: 'Tum filtreleri kaldir',
    layer_filter_greater_than: 'Buyuktur',
    layer_filter_less_than: 'Kucuktur',
    layer_filter_set_filter: 'Filtreyi ayarla',
  },
  it: {
    layer_filter_header: 'Filtro',
    layer_filter_select: 'Seleziona filtro dalla lista',
    layer_filter_clear_all: 'Elimina tutti i filtri',
    layer_filter_greater_than: 'Maggiore di',
    layer_filter_less_than: 'Minore di',
    layer_filter_set_filter: 'Imposta filtro',
  },
  th: {
    layer_filter_header: 'กรอง',
    layer_filter_select: 'เลือกตัวกรองจากรายการ',
    layer_filter_clear_all: 'ล้างตัวกรองทั้งหมด',
    layer_filter_greater_than: 'มากกว่า',
    layer_filter_less_than: 'น้อยกว่า',
    layer_filter_set_filter: 'ตั้งค่าตัวกรอง',
  },
})

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
export default function filterPanel(layer) {

  // Do not create the panel.
  if (layer.filter.hidden) return;

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

  layer.filter.view = mapp.ui.elements.drawer({
    data_id: `filter-drawer`,
    class: `raised ${layer.filter.classList || ''}`,
    header: mapp.utils.html`
      <h3>${mapp.dictionary.layer_filter_header}</h3>
      <div class="mask-icon expander"></div>`,
    content: mapp.utils.html`
      ${layer.filter.dropdown}
      ${layer.filter.clearAll}
      ${layer.filter.resetAll}`
  })

  return layer.filter.view
}
