mapp.utils.merge(mapp.dictionaries, {
  en: {
    layer_add_new_location: 'Add new locations',
  },
  de: {
    layer_add_new_location: 'Erstelle neue Lage',
  },
  zh: {
    layer_add_new_location: '添加新地点',
  },
  zh_tw: {
    layer_add_new_location: '添加新地點',
  },
  pl: {
    layer_add_new_location: 'Dodaj nową lokalizację',
  },
  fr: {
    layer_add_new_location: 'Ajouter un site',
  },
  ja: {
    layer_add_new_location: '新しいロケーションを追加',
  },
  esp: {
    layer_add_new_location: 'Agregar nuevos sitios',
  },
  tr: {
    layer_add_new_location: 'Yeni konum ekle',
  },
  it: {
    layer_add_new_location: 'Aggiungi nuovo elemento',
  },
  th: {
    layer_add_new_location: 'เพิ่มสถานที่ใหม่',
  },
});

export default (layer) => {
  if (typeof layer.draw !== 'object') return;

  // Do not create the panel.
  if (layer.draw.hidden) return;

  const elements = Object.keys(layer.draw)
    .map((key) => {
      // Return element from drawing method.
      return mapp.ui.elements.drawing?.[key]?.(layer);
    })
    .filter((node) => !!node);

  // Short circuit panel creation without elements.
  if (!elements.length) return;

  // If the layer has no geom return with a warning as you need a geom to draw.
  if (!layer.geom) {
    console.warn(
      `Layer: ${layer.key} - You must have a geom property to draw new features.`,
    );
    return;
  }

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
};
