export default _xyz => {

  //console.log(Chart)

  return {

    create: create,

    plugins: {},
   
  }

  function create(dataview) {

    if (dataview.dataview) return;

    // Attempt to assign dataview element from id.
    dataview.dataview = typeof dataview.target === 'string' && document.getElementById(dataview.target)

    // The target will be assigned as dataview container if provided as HTMLelement.
    dataview.dataview = dataview.target instanceof HTMLElement && dataview.target
      || _xyz.utils.html.node`<div class="${`${dataview.class || ''}`}" style="${dataview.style || ''}">`
    
    // Assign the dataview element to the panel element if defined as HTMLelement.
    dataview.panel instanceof HTMLElement && dataview.panel.appendChild(dataview.dataview)

    // Dataviews can be nested in a dataviews array.
    if (dataview.dataviews) {

      // The dataview-container will be displayed as a grid.
      dataview.dataview.classList.add('dataview-container')
      
      for (const nestedDataview of dataview.dataviews) {

        nestedDataview.tab = dataview.tab
        nestedDataview.layer = nestedDataview.layer || dataview.layer
        nestedDataview.location = nestedDataview.location || dataview.location

        // The current dataview becomes the panel for the nested dataview.
        nestedDataview.panel = dataview.dataview
  
        create(nestedDataview)
      }

      return
    }

    dataview.dataview.classList.add('dataview')

    // Create a toolbar if required.
    toolbar(dataview)

    // Append dataview.target after the toolbar to the dataview element.
    dataview.target = dataview.dataview.appendChild(_xyz.utils.html.node`
      <div class="target">`)

    // The dataview target height must be reduced by 25px if a toolbar has been set.
    dataview.target.style.height = dataview.toolbar && 'calc(100% - 25px)'

    // Update method for dataview.
    dataview.update = () => {

      // Dataviews must not update without a query.
      if (!dataview.query) return

      _xyz.query(dataview).then(response => {
        dataview.setData(response)
      })
    }

    // Add event listener to update dataview when the dataview.tab is activated.
    dataview.tab && dataview.tab.addEventListener('activate', dataview.update)

    // Update the dataview on mapChange if set.
    dataview.mapChange && _xyz.mapview.node.addEventListener('changeEnd', ()=>{

      // Only update dataview if corresponding layer is visible.
      if (dataview.layer && !dataview.layer.display) return;

      // Only update dataview if dataview.tab is active.
      if (dataview.tab && !dataview.tab.classList.contains('active')) return;

      dataview.update()
    })

    // Create a ChartJS dataview is chart is defined.
    if (dataview.chart) chart(dataview)

    // Create a Tabulator dataview if columns are defined.
    if (dataview.columns) table(dataview)

    // Set data from dataview if provided
    if (dataview.data) return dataview.setData(dataview.data)

    // Update dataview if not in a tab.
    !dataview.tab && dataview.update()

  }

  function toolbar(dataview) {

    if (typeof dataview.toolbar !== 'object') return;

    dataview.toolbar.node = dataview.dataview.appendChild(_xyz.utils.html.node`
      <div class="toolbar">`)

    dataview.toolbar.viewport
      && dataview.toolbar.node.appendChild(_xyz.utils.html.node`
        <button
          class="off-white-hover primary-colour"
          onclick=${e => {
            e.target.classList.toggle('primary-colour')
            dataview.viewport = !dataview.viewport
            dataview.update()
          }}>Viewport`)

    dataview.toolbar.download_csv
      && dataview.toolbar.node.appendChild(_xyz.utils.html.node`
        <button
          class="off-white-hover primary-colour"
          onclick=${() => {
            dataview.Tabulator.download('csv', `${dataview.title || 'table'}.csv`)
          }}>CSV`)

    dataview.toolbar.download_json
      && dataview.toolbar.node.appendChild(_xyz.utils.html.node`
        <button
          class="off-white-hover primary-colour"
          onclick=${() => {
            dataview.Tabulator.download('json', `${dataview.title || 'table'}.json`)
          }}>JSON`)

  }

  function chart(dataview) {

    // The Chart target position must be relative for chart sizing.
    dataview.target.style.position = 'relative'

    const canvas = dataview.target.appendChild(_xyz.utils.html.node`<canvas>`)

    if(dataview.chart.height) canvas.setAttribute('height', dataview.chart.height)

    if(dataview.chart.width) canvas.setAttribute('width', dataview.chart.width)

    dataview.chart.ChartJS = new Chart(canvas, {
      type: dataview.chart.type || 'bar',
      options: dataview.chart.options
    })
    

    // Set chart data
    dataview.setData = data => {

      if (!data) {
        if(dataview.dataview.classList.contains('location')){
          dataview.target.innerHTML = ''
          return
        }
        dataview.target.innerHTML = `<div style="text-align:center;"><small>${_xyz.language.dataview_no_data}</small></div>`
        return;
      }

      dataview.data = data

      dataview.chart.responseFunction && dataview.chart.responseFunction(data)

      const nodata = !(data.datasets
      && data.datasets.length
      && data.datasets.some(dataset => !dataset.data || dataset.data.some(data => data !== null)))

      if (nodata) return dataview.target.style.display = 'none'

      dataview.chart.datasets && dataview.chart.datasets.length &&
        data.datasets.forEach((dataset, i) => Object.assign(dataset, dataview.chart.datasets[i]))

      dataview.chart.ChartJS.data = {
        labels: typeof dataview.chart.labels === 'function' && dataview.chart.labels(data)
          || (data.labels || dataview.chart.labels),
        datasets: data.datasets
      }

      dataview.target.style.display = 'block'

      dataview.chart.ChartJS.update()
    }

  }

  function table(dataview) {

    // The Tabulator target must be displayed as grid for the table header to be static.
    if (dataview.fixed_header) {
      dataview.target.style.display = 'grid'
      dataview.target.style.position = 'absolute'
    }

    dataview.target = dataview.target.appendChild(_xyz.utils.html.node`<div>`);

    // Assign column formatter from plugin.
    (function colPlugins(cols){
      cols.forEach(col => {
        if(col.plugin) col.formatter = _xyz.dataviews.plugins[col.plugin]
        col.columns && colPlugins(col.columns)
      });
    })(dataview.columns);

    dataview.target.style.visibility = 'hidden'

    dataview.Tabulator = new Tabulator(dataview.target, Object.assign({
      invalidOptionWarnings: false,
      tooltipsHeader: true,
      columnHeaderVertAlign: 'center',
      layout: dataview.layout || 'fitDataFill',
      autoColumns: dataview.autoColumns || false,
      height: 'auto',
      rowFormatter: row => {
        if(row.getData().backgroundcolour){
          const el = row.getElement()
          el.style.backgroundColor = row.getData().backgroundcolour
        }
      },
      selectable: false,
      rowClick: (e, row) => {

        const rowData = row.getData()

        if (!dataview.layer || !rowData[dataview.qID || 'id']) return;

        _xyz.locations.select({
          locale: _xyz.locale.key,
          layer: rowData.layer || dataview.layer,
          table: rowData.table || dataview.table,
          id: rowData[dataview.qID || 'id'],
          //_flyTo: true,
        })

        row.deselect()
      }
    }, dataview))

    // Set Tabulator data.
    dataview.setData = data => {

      if (!data) return

      dataview.data = data
      dataview.responseFunction && dataview.responseFunction(data)
      dataview.Tabulator.setData(data.length && data || [data])
      if(dataview.target.style) dataview.target.style.visibility = 'visible'
    }

  }

}