export default {
  viewport,
  download_json,
  download_csv,
  clear_table_filters
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

        // The data array must have a length
        if (!dataview.data.length) return;

        // download_csv is an object with 
        if (dataview.toolbar.download_csv instanceof Object) {

          // Parse data from download_csv.fields
          const data = dataview.data.map(record => {

            // Check whether string values should be escaped.
            return dataview.toolbar.download_csv.fields.map(field => (record[field.field] && field.string) ?
              `"${record[field.field].replace(`"`, `\"`)}"` : record[field.field])
          })

          // Unshift the header row with either the title or field names.
          data.unshift(dataview.toolbar.download_csv.fields.map(field => field.title || field.field))

          mapp.utils.csvDownload(data, dataview.toolbar.download_csv)
          return;
        }
        
        // Use Tabulator download method
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