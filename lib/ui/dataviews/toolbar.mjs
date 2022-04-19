const tools = {
  viewport,
  download_json,
  download_csv
}

export default dataview => {

  const elements = Object.keys(dataview.toolbar).map(key => tools[key](dataview))

  dataview.panel = mapp.utils.html.node`
    <div class="grid">
      <div class="btn-row">
        ${elements}`

  dataview.target = dataview.panel.appendChild(mapp.utils.html.node`
    <div class="dataview-target">`)

}

function viewport(dataview) {

  return mapp.utils.html`
    <button
      class=${`flat ${dataview.viewport && 'active' ||''}`}
      onclick=${e => {
        e.target.classList.toggle('active')
        dataview.viewport = !dataview.viewport
        dataview.update()
      }}>Viewport`

}

function download_json(dataview) {

  return mapp.utils.html`
    <button
      class="flat"
      onclick=${() => {
        dataview.Tabulator.download('json', `${dataview.title || 'table'}.json`)
      }}>JSON`

}

function download_csv(dataview) {

  return mapp.utils.html`
    <button
      class="flat"
      onclick=${() => {
        dataview.Tabulator.download('csv', `${dataview.title || 'table'}.csv`)
      }}>CSV`

}