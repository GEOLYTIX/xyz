/**
### /ui/elements/helpDialogControl

The helpDialogControl module returns etheir a button or a div to control whether help dialogs should be displayed.

@module /ui/elements/helpDialogControl
*/

/**
@function helpDialogControl
Creates the interfaces for controlling whether helpdialogs are displayed.

Creates either a circular button or a div with an on/off button.

@param {Object} mapview The mapview object.
@param {Object} [plugin] The disable_help config from the locale.

@returns {HTMLElement} Either a button or a div with the means to control help dialogs displaying.
*/

export default function helpDialogControl(mapview, plugin) {
  //Provide the ciruclar button
  if (plugin) {
    return mapp.utils.html
      .node`                                                                         
    <button                                                                         
            title=${mapp.dictionary.disable_help}                                         
            onclick=${(e) => {
        const on = e.target.classList.toggle('active');
        hideHelp(mapview, on);
      }}>                                                                           
     <span class="notranslate material-symbols-outlined strikethrough">help_center`;
  }

  //Provide the div with a brief explanation
  const settingsContent = mapp.utils.html`<div style="margin: 1em 0">
            <p> We display help dialogs for certain interactions such as drawing and editing geometries.<br />
                You can contol whether these dialogs display below.
            </p>
              <div style="display:flex; gap: 1em">
                <button data-id="display-help-on" class="action raised bold active"
                  onclick=${() => hideHelp(mapview, false)}>
                  <span class="material-symbols-outlined notranslate">task_alt</span>
                  On
                </button>
                <button data-id="display-help-off" class="action raised bold active"
                  onclick=${() => hideHelp(mapview, true)}>   
                  <span class="material-symbols-outlined notranslate">task_alt</span>  
                  Off                                                                   
                </button>                                                              
              </div>`;

  return settingsContent;
}

/**
@function hideHelp
Sets the hideHelp attribute on the layers present in the mapview to hide the help dialogs 
in drawing, modifying, etc interactions.

@param {Object} mapview The mapview object.
@param {boolean} [off] Flag for controlling help dialog hideHelp property.

*/
function hideHelp(mapview, off) {
  //Loop over the layers in the mapview.
  for (const layer of Object.values(mapview.layers)) {
    if (
      layer.draw ||
      layer.infoj?.find?.((entry) => entry.type === 'geometry' && entry.edit)
    ) {
      //Set hideHelp on applicable layers.
      layer.hideHelp = off;

      layer.reload?.();
    }
  }

  //Close any open locations.
  for (const location of Object.keys(mapview.locations)) {
    mapview.locations[location].remove();
  }

  //Set it hideHelp locale wide.
  mapview.locale.hideHelp = off;

  //Put the new locale in the indexdb
  mapp.utils.userLocale.putLocale(mapview);
}
