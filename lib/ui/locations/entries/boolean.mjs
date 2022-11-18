export default entry => {

  const chkbox = mapp.ui.elements.chkbox({
    label: entry.label || entry.title,
    checked: entry.value,
    disabled: !entry.edit,
    onchange: (checked) => {

      entry.newValue = checked
      entry.location.view?.dispatchEvent(
        new CustomEvent('valChange', {
          detail: entry
        }))
  
    }
  })

  const node = mapp.utils.html.node`${chkbox}`

  return node
}