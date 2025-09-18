/**
### /plugins/disable_help
 
The disable_help plugin appends the disable_help button to the button panel.

@module /plugins/disable_help
*/

/**
@function disable_help

A plugin for controlling whether helpDialogs are displayed. 

@param {Object} plugin The disable_help config from the locale.
@param {Object} mapview The mapview object.
*/
export async function disable_help(plugin, mapview) {
  const btnColumn = mapview.mapButton;

  // the btnColumn element only exist in the default mapp view.
  if (!btnColumn) return;

  const hideHelpBtn = mapp.ui.elements.helpDialogControl(mapview, plugin);

  btnColumn.appendChild(hideHelpBtn);

  //Preclick the button if the setting is found in the index.
  const indexLocale = await mapp.utils.userLocale.get(mapview.locale);
  indexLocale.hideHelp && hideHelpBtn.dispatchEvent(new Event('click'));
}
