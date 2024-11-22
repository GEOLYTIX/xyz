export function userLocale(plugin, mapview) {

  // if (!mapp.user?.email) {

  //   console.warn(`The userIDB plugin requires a mapp.user`)
  //   return;
  // }

  plugin.mapview = mapview

  // Find the btnColumn element.
  const btnColumn = document.getElementById('mapButton');

  if (!btnColumn) return;

  plugin.title ??= 'userLocale'

  plugin.btn = mapp.utils.html.node`<button
    title=${plugin.title}
    onclick=${() => {

      const locale = mapp.utils.jsonParser(mapview.locale)

      locale.layers = Object.values(mapview.layers).map(mapp.utils.jsonParser)
      
      console.log(locale)

    }}><div class="mask-icon settings">`

  // Append the plugin btn to the btnColumn.
  btnColumn.append(plugin.btn);
}
