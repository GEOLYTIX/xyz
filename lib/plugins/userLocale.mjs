export function userLocale(plugin, mapview) {

  // test assignment to check for self reference
  plugin.mapview = mapview

  const layersNode = document.getElementById('layers')

  if (!layersNode) return;

  plugin.panel = mapp.utils.html.node`
    <div class="drawer" style="border: 1px solid #333;">User Locale:
      <button class="raised"
      onclick=${e => mapp.utils.userLocale.save(mapview)}
      >Save</button>
      <button class="raised"
      onclick=${e => mapp.utils.userLocale.remove()}
      >Delete</button>`

  // Append the plugin btn to the btnColumn.
  layersNode.append(plugin.panel);
}
