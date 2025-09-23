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
        mapp.user.hideHelp = on;
      }}>                                                                           
     <span class="notranslate material-symbols-outlined strikethrough">help_center`;
  }

  const onButton = `<button data-id="display-help-on" class="action raised bold active"                              
                            onclick=${() => {
      offButton.classList.toggle('active');
      mapp.user.hideHelp = false;
    }}>                                                                                               
                            <span class="material-symbols-outlined notranslate">task_alt</span>                            
                              On                                                                                           
                    </button >`;

  const offButton = `<button data-id="display-help-off" class="action raised bold active"                          
                             onclick=${() => {
      onButton.classList.toggle('active');
      mapp.user.hideHelp = true;
    }}>
                        <span class="material-symbols-outlined notranslate">task_alt</span>
                          Off                                                                                       
                    </button > `;

  //Provide the div with a brief explanation
  const settingsContent = mapp.utils.html`< div style = "margin: 1em 0" >
            <p> We display help dialogs for certain interactions such as drawing and editing geometries.<br />
                You can contol whether these dialogs display below.
            </p>
              <div style="display:flex; gap: 1em">
                ${onButton}
                ${offButton} 
              </div > `;

  return settingsContent;
}
