export default entry => {

  if (entry.edit) {

    return mapp.ui.elements.chkbox({
      label: entry.label || entry.title,
      checked: entry.newValue !== undefined ? entry.newValue: entry.value,
      disabled: !entry.edit,
      onchange: (checked) => {
  
        entry.newValue = checked
        entry.location.view?.dispatchEvent(
          new CustomEvent('valChange', {
            detail: entry
          }))
    
      }
    })

  }

  const icon = `mask-icon ${entry.value? 'done': 'close'}`

  return mapp.utils.html.node`
  <div class="link-with-img">
    <div class=${icon}></div>
    <span>${entry.label || entry.field}`
}