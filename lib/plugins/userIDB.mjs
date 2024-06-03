export function userIDB(plugin, mapview) {

  if (!mapp.user?.email) {

    console.warn(`The userIDB plugin requires a mapp.user`)
    return;
  }

  // Find the btnColumn element.
  const btnColumn = document.getElementById('mapButton');

  if (!btnColumn) return;

  plugin.title ??= "Update userIDB locale"

  // Append the plugin btn to the btnColumn.
  btnColumn.append(mapp.utils.html.node`
    <button
      title=${plugin.title}
      onclick=${()=>{

        mapview.locale.layers.forEach(layer => {

          if (typeof layer !== 'object') return;

          updateLayer(layer, mapview.layers[layer.key])
        })

        mapp.utils.userIndexedDB.put('locales', mapview.locale)

        alert(`User ${mapp.user.email} IndexedDB updated.`)

      }}>
      <div class="mask-icon" style="mask-image:url(https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/rule_settings/default/24px.svg)">`);
}

function updateLayer(layer, _layer) {

  if (!_layer) return;

  Object.keys(_layer).forEach(key => {

    if (_layer[key] === undefined) return;

    if (_layer[key] === null) {
      layer[key] = null;
    }

    if (typeof _layer[key] === 'function') return;

    if (typeof _layer[key] === 'object') return;

    layer[key] = _layer[key]
  })

  return layer;
}
