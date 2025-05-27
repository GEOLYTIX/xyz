/**
### /plugins/userLocale

The userLocale plugin appends the userLocale utility interface to the layer panel.

@module /plugins/userLocale
*/

/**
@function userLocale
An input allows to define the userlocale name with buttons to either put (create or overwrite) a stored userlocale or delete a stored userlocale.
The panel will be disabled during the transaction to save or remove a user locale.

@param {Object} plugin The userLocale config from the locale.
@param {Object} mapview The mapview object.
*/
export function userLocale(plugin, mapview) {
  const layersNode = document.getElementById('layers');

  if (!layersNode) return;

  // Call the utility method to create the userLocale interface.
  plugin.content = mapp.ui.elements.userLocale(plugin, mapview);

  // Append the content to the layersNode.
  layersNode.append(plugin.content);
}
