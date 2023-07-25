mapp.utils.merge(mapp.dictionaries, {
  en: {
    layer_add_new_location: 'Add new locations',
  },
  de: {
    layer_add_new_location: 'Erstelle neue Lage',
  },
  cn: {
    layer_add_new_location: '数据检视',
  },
  pl: {
    layer_add_new_location: 'Dodaj nowe miejsca',
  },
  ko: {
    layer_add_new_location: '새로운 위치 추가',
  },
  fr: {
    layer_add_new_location: 'Ajouter des nouveaux lieux',
  },
  ja: {
    layer_add_new_location: '新しいロケーションを追加',
  }
})

export default layer => {

  if (typeof layer.draw !== 'object') return;

  // Do not create the panel.
  if (layer.draw.hidden) return;
 
  const elements = Object.keys(layer.draw)
    .map(key => {

      // Return element from drawing method.
      return mapp.ui.elements.drawing[key] && mapp.ui.elements.drawing[key](layer)
    })
    .filter(node => !!node)

  // Short circuit panel creation without elements.
  if (!elements.length) return;

  const panel = mapp.ui.elements.drawer({
    data_id: `draw-drawer`,
    class: `raised ${layer.draw.classList || ''}`,
    header: mapp.utils.html`
      <h3>${mapp.dictionary.layer_add_new_location}</h3>
      <div class="mask-icon expander"></div>`,
    content: mapp.utils.html`
      ${elements}`,
  });

  return panel;
}