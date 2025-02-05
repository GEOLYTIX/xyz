/**
### /ui/elements/radiogroup
@module /ui/elements/radiogroup
*/

/**

*/

export default (params) => {
  params.name ??= 'mapp-ui-radio-element';

  const header = params.title
    ? mapp.utils.html.node`<legend><b>${params.title}`
    : '';

  return mapp.utils.html.node`<div>
    ${header}
    <label 
    data-id=${params.data_id || 'radio'}
    class="radio">
    <input 
    type="radio"
    name="${params.name}"
    .disabled=${!!params.disabled}
    .checked=${!!params.checked}
    onchange=${(e) => {
      if (!params.onchange) return;

      params.onchange(e.target.checked, params);
    }}
    />
    <span class="material-symbols-outlined"/>
    <span>${params.label}
    `;
};
