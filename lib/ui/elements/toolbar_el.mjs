export default {
  viewport,
  layerfilter,
  download_json,
  download_csv,
  clear_table_filters,
}

function viewport(dataview) {

  return mapp.utils.html`
    <button class=${`flat ${dataview.viewport && 'active' ||''}`}
      onclick=${e => {
        e.target.classList.toggle('active')
        dataview.viewport = !dataview.viewport
        dataview.update()
      }}>Viewport`

}

function layerfilter(dataview) {

  return mapp.utils.html`
    <button class=${`flat ${dataview.queryparams.filter && 'active' ||''}`}
      onclick=${e => {
        e.target.classList.toggle('active')
        dataview.queryparams.filter = !dataview.queryparams.filter
        dataview.update()
      }}>Layer Filter`

}

function download_json(dataview) {

  return mapp.utils.html`
    <button class="flat"
      onclick=${() => {
        dataview.Tabulator.download('json', `${dataview.title || 'table'}.json`)
      }}>Export as JSON`

}

function download_csv(dataview) {

  return mapp.utils.html`
    <button class="flat"
      onclick=${() => {
        dataview.Tabulator.download('csv', `${dataview.title || 'table'}.csv`)
      }}>Download as CSV`

}

function clear_table_filters(dataview) {

  return mapp.utils.html`
    <button class="flat"
      onclick=${() => {
        dataview.Tabulator.clearFilter(true);
      }}>Clear Filters`;

}