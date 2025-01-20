/** 
Dictionary entries:
- layer_add_new_location

@requires /dictionary 

*/

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
      <div class="material-symbols-outlined expander"/>`,
    content: mapp.utils.html`
      ${elements}`,
  });

  return panel;
}