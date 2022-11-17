export default (params) => mapp.utils.html.node`
  <label 
    data-id=${params.data_id || 'chkbox'}
    class="checkbox">
    <input
      type="checkbox"
      .disabled=${!!params.disabled}
      .checked=${!!params.checked}
      onchange=${e=>{
        params.onchange && params.onchange(e.target.checked, params.val)
      }}>
    </input>
    <div></div>
    <span>${params.label}`