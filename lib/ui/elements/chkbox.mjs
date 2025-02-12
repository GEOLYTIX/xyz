export default (params) => mapp.utils.html.node`
  <label 
    data-id=${params.data_id || 'chkbox'}
    class="checkbox">
    <input
      name="mapp-ui-chkbox-element"
      type="checkbox"
      .disabled=${!!params.disabled}
      .checked=${!!params.checked}
      onchange=${(e) => {
        params.onchange && params.onchange(e.target.checked, params.val);
      }}/>
    <span class="material-symbols-outlined"/>
    <span>${params.label}`;
