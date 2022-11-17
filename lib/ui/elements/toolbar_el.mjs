export default {
  viewport,
  download_json,
  download_csv
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
      }}>Export as JSON`

}

function download_csv(dataview) {

  return mapp.utils.html`
    <button
      class="flat"
      onclick=${() => {
        dataview.Tabulator.download('csv', `${dataview.title || 'table'}.csv`)
      }}>Download as CSV`

}