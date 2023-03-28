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

  layer.draw.callback = async feature => {
 
    if (!feature) return;
  
    const location = {
      layer,
      new: true
    }
  
    location.id = await mapp.utils.xhr({
      method: 'POST',
      url: `${layer.mapview.host}/api/location/new?` +
        mapp.utils.paramString({
          locale: layer.mapview.locale.key,
          layer: layer.key,
          table: layer.tableCurrent()
        }),
      body: JSON.stringify(Object.assign({
        [layer.geom]: feature.geometry
      }, layer.edit?.defaults || {}))
    })
  
    layer.reload()
  
    mapp.location.get(location)
  }

  // Do not create the panel.
  if (layer.draw.hidden) return;
 
  const cards = Object.keys(layer.edit)
    .map(key => {
      return mapp.ui.elements.drawing[key] && mapp.ui.elements.drawing[key](layer)
    })
    .filter(node => !!node)

  // Short circuit panel creation without cards.
  if (!cards.length) return;

  const panel = mapp.ui.elements.drawer({
    data_id: `draw-drawer`,
    class: 'raised',
    header: mapp.utils.html`
      <h3>${mapp.dictionary.layer_add_new_location}</h3>
      <div class="mask-icon expander"></div>`,
    content: mapp.utils.html`
      ${cards}`,
  });

  return panel;
}