mapp.utils.merge(mapp.dictionaries, {
  en: {
    layer_filter_header: 'Filter',
    layer_filter_select: 'Select filter from list',
    layer_filter_clear_all: 'Clear all filters',
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
  es: {
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

export default layer => {

  // Do not create the panel.
  if (layer.filter.hidden) return;

  // Layer without an infoj array of entries do not have a filter panel.
  if (!layer.infoj) return;

  layer.filter.list = layer.infoj
    .filter(entry => entry.filter !== undefined)
    .filter(entry => entry.field !== undefined)
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

      return structuredClone(entry.filter)
    })

  if (!layer.filter.list.length) return;

  const dropdown = mapp.ui.elements.dropdown({
    data_id: `${layer.key}-filter-dropdown`,
    placeholder: mapp.dictionary.layer_filter_select,
    keepPlaceholder: true,
    entries: layer.filter.list,
    callback: async (e,filter) => {

      
      // Return if no interface method for the filter type exists.
      if (!mapp.ui.layers.filters[filter.type]) return;

      // Return if filter card already exists.
      if (filter?.card) return;

      // Display clear all button.
      layer.filter.view.querySelector('[data-id=clearall]').style.display = 'block';
      e.target.classList.add('selected')

      filter.remove = () => {

        // Delete filter for empty input.
        if(layer.filter.current[filter.field]){
          if(!layer.filter.current[filter.field][filter.type]){
            delete layer.filter.current[filter.field]
          }
          else{
            delete layer.filter.current[filter.field][filter.type]
          }
          if (layer.filter.current[filter.field] && !Object.keys(layer.filter.current[filter.field]).length) {
            delete layer.filter.current[filter.field]
          }
        }
        
        delete filter.card
        e.target.classList.remove('selected')

        if (layer.style.legend) {
          mapp.ui.layers.legends[layer.style.theme.type](layer)
        }
        
        layer.reload();

        // The changeEnd event will trigger dataview updates if set.
        layer.mapview.Map.getTargetElement().dispatchEvent(new Event('changeEnd'))

        // Only show the clearall filter button when filter cards are displayed as children to the filter view.
        layer.filter.view.querySelector('[data-id=clearall]').style.display = layer.filter.view.children.length === 3 ? 'none' : 'block';
        
      };

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
