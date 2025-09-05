export function disable_help(plugin, mapview) {
  const btnColumn = mapview.mapButton;

  // the btnColumn element only exist in the default mapp view.
  if (!btnColumn) return;

  btnColumn.appendChild(mapp.utils.html.node`                                   
    <button                                                                          
      title=${mapp.dictionary.disable_help}                                    
      onclick=${(e) =>
      e.target.classList.toggle('active')}>                                  
      <span class="notranslate material-symbols-outlined strikethrough">help_center`);
}
