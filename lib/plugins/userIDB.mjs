export function userIDB(plugin, mapview) {

  if (!mapp.user?.email) {

    console.warn(`The userIDB plugin requires a mapp.user`)
    return;
  }

  // Find the btnColumn element.
  const btnColumn = document.getElementById('mapButton');

  if (!btnColumn) return;

  plugin.title ??= 'Update userIDB locale'

  // Append the plugin btn to the btnColumn.
  btnColumn.append(mapp.utils.html.node`
    <button
      title=${plugin.title}
      onclick=${()=>{

        const locale = mapp.utils.merge({}, mapview.locale)

        locale.layers.forEach(layer => {

          if (typeof layer !== 'object') return;

          updateLayer(layer, mapview.layers[layer.key])
        })
        
        if(!plugin.object_store){
          mapp.utils.userIndexedDB.put('locales', locale)
          alert(`User ${mapp.user.email} IndexedDB updated.`)
        }
        else{
          let instance = mapp.host.replace('/','').replaceAll('/','_')
          fetch(`${mapp.host}/api/sign/${plugin.object_store}?${mapp.utils.paramString({email: mapp.user.email.replaceAll('.',''),instance: instance})}`).then( 
            async response => {
              let responseJSON = await response.json()
              
              if(responseJSON.missing_keys){
                console.warn(`UserIDB - Firebase: missing environment key(s) ${responseJSON.missing_keys.join(',')}`)
                alert(`User ${mapp.user.email} Firebase Table failed to update.`)
                return
              }

              fetch(responseJSON.signedUrl,{
                method: 'PATCH',
                body:JSON.stringify({'locales':locale})
              }).then(
                alert(`User ${mapp.user.email} Firebase Table updated.`)
              )
          })
        }
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