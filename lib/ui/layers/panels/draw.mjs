mapp.utils.merge(mapp.dictionaries, {
  en: {
    layer_add_new_location: "Add new locations",
  },
  de: {
    layer_add_new_location: "Erstelle neue Lage",
  },
  cn: {
    layer_add_new_location: "数据检视",
  },
  pl: {
    layer_add_new_location: "Dodaj nowe miejsca",
  },
  ko: {
    layer_add_new_location: "새로운 위치 추가",
  },
  fr: {
    layer_add_new_location: "Ajouter des nouveaux lieux",
  },
  ja: {
    layer_add_new_location: "新しいロケーションを追加",
  }
})

export default layer => {

  const options = {
    layer,
    srid: layer.srid,
    edit: layer.edit,
    mapview: layer.mapview
  };
  
  const cards = typeof layer.edit === 'object' && Object.keys(layer.edit)
    .map(key => mapp.ui.elements.drawing[key] && mapp.ui.elements.drawing[key](options, draw))
    .filter(node => !!node)

  if (!cards) return;

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

function draw(e, options) {

  const btn = e.target

  if (btn.classList.contains('active')) {
    btn.classList.remove('active')
    options.mapview.interactions.highlight()
    return;
  }

  btn.classList.add('active')
  
  options.layer.show()

  options.layer.view.querySelector('.header').classList.add('edited', 'active')

  options.mapview.interactions.draw({
    type: options.type,
    geometryFunction: options.geometryFunction,
    tooltip: options.tooltip,
    //snapSource: layer.L.getSource(),
    srid: options.srid,
    callback: async feature => {
      if (feature) {

        const location = {
          layer: options.layer
        }

        location.id = await mapp.utils.xhr({
          method: 'POST',
          url: `${location.layer.mapview.host}/api/location/new?` +
            mapp.utils.paramString({
              locale: location.layer.mapview.locale.key,
              layer: location.layer.key,
              table: location.layer.tableCurrent()
            }),
          body: JSON.stringify({
            geometry: feature.geometry
          })
        })
      
        options.layer.reload()
                                
        mapp.location.get(location)
      }

      options.layer.view.querySelector('.header').classList.remove('edited', 'active')

      if (btn.classList.contains('active')) {
        btn.classList.remove('active')
        options.mapview.interactions.highlight()
      }
     
    }
  })

}