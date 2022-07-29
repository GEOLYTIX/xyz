export default _xyz => entry => {

  const input = _xyz.utils.html.node`<input 
  type="${entry.type === 'datetime' ? 'datetime-local' : 'date'}" 
  value=${entry.value &&
    (entry.type === "datetime" && new Date(entry.value * 1000).toISOString().split('Z')[0]
      || new Date(entry.value * 1000).toISOString().split('T')[0])}
  placeholder=${_xyz.language.layer_filter_pick} 
  style="text-align: end;"
  oninput=${e => {
    e.stopPropagation()
      
    const date_unix = _xyz.utils.meltDateStr(e.target.value)

    entry.location.view.dispatchEvent(
      new CustomEvent('valChange', {detail:{
        input: input,
        entry: entry,
        newValue: date_unix
    }}))
  }}>`

  entry.val.appendChild(input)

}