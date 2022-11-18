export default entry => {

  let node, val = entry.value;

  if (entry.query) {

    const params = mapp.utils.queryParams(entry)

    const paramString = mapp.utils.paramString(params)

    mapp.utils
      .xhr(`${entry.host || entry.location.layer.mapview.host}/api/query?${paramString}`)
      .then(response => {
        node.innerHTML = Object.values(response)[0]
      })

  }

  if (entry.edit) {

    if (entry.edit.options) {

      val = options(entry)
    } else {

      val = mapp.utils.html`
      <input
        type="text"
        value="${entry.value || ''}"
        onkeyup=${e => {
          entry.newValue = e.target.value
          entry.location.view?.dispatchEvent(
            new CustomEvent('valChange', {
              detail: entry
            })
          )
        }}>`
    }
  }

  node = mapp.utils.html.node`
    <div
      class="val"
      style="${`${entry.css_val || ''}`}">
      ${entry.prefix}${val}${entry.suffix}`

  return node
}

function options(entry){

  const chk = entry.edit.options.find(
    option => typeof option === 'object' && Object.values(option)[0] === entry.value || option === entry.value
  ) || entry.value

  entry.value = chk 
    && typeof chk === 'object' 
    && Object.keys(chk)[0] || chk || entry.value || ' ';

  const entries = entry.edit.options.map(option => ({
    title: typeof option === 'string' && option || Object.keys(option)[0],
    option: typeof option === 'string' && option || Object.values(option)[0]
  }))

  const dropdown = mapp.ui.elements.dropdown({
    span: entry.value,
    entries: entries,
    callback: (e, _entry) => {
      entry.newValue = _entry.option
      entry.location.view?.dispatchEvent(
        new CustomEvent('valChange', {
          detail: entry,
        })
      );
    },
  });

  return dropdown
}