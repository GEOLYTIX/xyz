mapp.utils.merge(mapp.dictionaries, {
  en: {
    layer_filter_header: "Filter",
    layer_filter_select: "Select filter from list",
  },
  de: {
    layer_filter_header: "Filter",
    layer_filter_select: "Filter Auswahl",
  },
  cn: {
    layer_filter_header: "筛选",
    layer_filter_select: "从列表筛选",
  },
  pl: {
    layer_filter_header: "Filtruj",
    layer_filter_select: "Wybierz filtr z listy",
  },
  ko: {
    layer_filter_header: "필터",
    layer_filter_select: "리스트로 부터 필터 선택",
  },
  fr: {
    layer_filter_header: "Filtres",
    layer_filter_select: "Choisir un filtre dans la liste",
  },
  ja: {
    layer_filter_header: "フィルター",
    layer_filter_select: "リストからフィルターを選択",
  }
})

export default layer => {

  if (!layer.infoj?.some((entry) => entry.filter)) return;

  layer.filter.list = layer.infoj.filter((entry) => entry.filter);

  const dropdown = mapp.ui.elements.dropdown({
    data_id: `${layer.key}-filter-dropdown`,
    placeholder: mapp.dictionary.layer_filter_select,
    entries: layer.filter.list,
    callback: async (e, entry) => {
      
      // Display clear all button.
      layer.filter.view.querySelector("[data-id=clearall]").style.display = 'block';

      if (entry.filter.card) return;

      entry.filter.field = entry.filter.field || entry.field

      entry.filter.remove = () => {
        delete layer.filter.current[entry.filter.field];
        delete entry.filter.card
        layer.reload();
    
        // Only show the clearall filter button when filter cards are displayed as children to the filter view.
        layer.filter.view.querySelector("[data-id=clearall]").style.display = layer.filter.view.children.length === 3 ? 'none' : 'block';
      };

      if (!mapp.ui.layers.filters[entry.filter.type]) return;

      // If not implicit in the filter object the field will be assigned from the entry.
      entry.filter.field = entry.filter.field || entry.field

      const input = await mapp.ui.layers.filters[entry.filter.type](layer, entry);

      entry.filter.card = layer.filter.view.appendChild(mapp.ui.elements.card({
        header: entry.filter_title || entry.title,
        close: entry.filter.remove,
        content: input
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
          .filter((entry) => entry.filter.card)
          .forEach(entry => {
            entry.filter.card.querySelector("[data-id=close]").click()
          })

        layer.reload()

      }}>${mapp.dictionary.layer_filter_clear_all}`

  layer.filter.view = mapp.ui.elements.drawer({
    data_id: `filter-drawer`,
    class: 'lv-1',
    header: mapp.utils.html`
      <h3>${mapp.dictionary.layer_filter_header}</h3>
      <div class="mask-icon expander"></div>`,
    content: mapp.utils.html`
      ${dropdown}
      ${clearAll}`
  })

  return layer.filter.view
}