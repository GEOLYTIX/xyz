/**
### /ui/elements/radio
@module /ui/elements/radio
*/

/**

*/

export default (params) => {
  params.name ??= 'mapp-ui-radio-element';
  params.data_id ??= 'radio';

  const header = params.caption
    ? mapp.utils.html`<legend>${params.caption}`
    : '';

  const radio = mapp.utils.html.node`<input 
    type="radio"
    name="${params.name}"
    .disabled=${!!params.disabled}
    .checked=${!!params.checked}
    onchange=${(e) => {
      if (!params.onchange) return;

      params.onchange(e.target.checked, params);
    }}
    />`;

  return mapp.utils.html.node`<div>
    ${header}
    <label 
    data-id=${params.data_id}
    class="radio">
    ${radio}
    <span class="material-symbols-outlined"></span>
    <span>${params.label}
    `;
};
