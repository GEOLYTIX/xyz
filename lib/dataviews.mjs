export default _xyz => {

  return {

    create: create
   
  }

  function array(dataview) {

    dataview.dataviews.forEach(nestedDataview => {
      nestedDataview.node = dataview.node
      nestedDataview.layer = dataview.layer
      nestedDataview.location = dataview.location
      nestedDataview.id = dataview.id
      nestedDataview.target = dataview.target.appendChild(_xyz.utils.html.node`
        <div
          class="${nestedDataview.class || ''}"
          style="${nestedDataview.style || ''}">`)

      create(nestedDataview)
    });

    return dataview;
  }

  function create(dataview) {

    dataview.target = dataview.target || _xyz.utils.html.node`
      <div
        class="${dataview.classList || ''}"
        style="${dataview.style || ''}">`

    // Dataviews maybe provided as an array within a single dataview object.
    if (dataview.dataviews) return array(dataview)

    const toolbar = dataview.target.appendChild(_xyz.utils.html.node`<div class="toolbar">`)

    dataview.update = () => {
      _xyz.query(dataview).then(response => {
        dataview.setData(response)
      })
    }

    dataview.panel && dataview.panel.appendChild(dataview.target)

    dataview.node && dataview.node.addEventListener('activate', dataview.update)

    dataview.active && _xyz.mapview.node.addEventListener('changeEnd', ()=>{

      if (!dataview.display) return

      if (dataview.layer && !dataview.layer.display) return

      if (dataview.node && !dataview.node.classList.contains('active')) return

      dataview.update()
    })


    if (dataview.chart) {

      dataview.chart.div = _xyz.utils.html.node`<div style="position: relative;">`

      const canvas = _xyz.utils.html.node`<canvas>`

      if(dataview.chart.height) canvas.setAttribute('height', dataview.chart.height)

      if(dataview.chart.width) canvas.setAttribute('width', dataview.chart.width)
    
      dataview.chart.div.appendChild(canvas)
       
      dataview.chart.ChartJS = new Chart(canvas, {
        type: dataview.chart.type || 'bar',
        plugins: dataview.chart.plugins || [],
        options: dataview.chart.options || {
          legend: {
            display: false
          },
          plugins: {
            datalabels: {
              display: false
            }
          }
        }
      })
    
      dataview.chart.options && Object.assign(dataview.chart.ChartJS.options, dataview.chart.options)

      dataview.chart.setData = response => {

        dataview.chart.responseFunction && dataview.chart.responseFunction(response)

        dataview.chart.datasets
          && dataview.chart.datasets.length
          && response.datasets.forEach((dataset, i) => Object.assign(dataset, dataview.chart.datasets[i]))
    
        dataview.chart.ChartJS.data = {
          labels: typeof dataview.chart.labels == 'function' && dataview.chart.labels(response) || (response.labels || dataview.chart.labels),
          datasets: response.datasets
        }
    
      }
    
      dataview.target.appendChild(dataview.chart.div)

      dataview.setData = response => {
          if (!response) return

          dataview.chart.setData(response)
          dataview.chart.ChartJS.update()
      }
    }


    if (dataview.columns) {

      (function applyFormatters(cols){
        cols.forEach(col => {
          if(col.customFormatter) col.formatter = _xyz.utils.TabulatorFormatter[col.customFormatter]
          col.columns && applyFormatters(col.columns)
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

          if (!dataview.layer || !rowData[dataview.qID || 'id']) return

          _xyz.locations.select({
            locale: _xyz.locale.key,
            layer: rowData.layer && _xyz.layers.list[rowData.layer] || dataview.layer,
            table: rowData.table || dataview.table,
            id: rowData[dataview.qID || 'id'],
            //_flyTo: true,
          })

          row.deselect()
        }
      }, dataview))

      dataview.setData = response => {
        if (!response) return

        dataview.responseFunction && dataview.responseFunction(response)

        dataview.Tabulator.setData(response.length && response || [response])

        dataview.target.style.visibility = 'visible'
      }
    }


    if (dataview.toolbar && dataview.toolbar.viewport) toolbar.appendChild(_xyz.utils.html.node`
    <button
      class="off-white-hover primary-colour"
      onclick=${e => {
        e.target.classList.toggle('primary-colour')
        dataview.viewport = !dataview.viewport
        dataview.update()
      }}>Viewport`)

    if (dataview.toolbar && dataview.toolbar.download_csv) toolbar.appendChild(_xyz.utils.html.node`
    <button
      class="off-white-hover primary-colour"
      onclick=${() => {
        dataview.Tabulator.download('csv', `${dataview.title || 'table'}.csv`)
      }}>CSV`)

    if (dataview.toolbar && dataview.toolbar.download_json) toolbar.appendChild(_xyz.utils.html.node`
    <button
      class="off-white-hover primary-colour"
      onclick=${() => {
        dataview.Tabulator.download('json', `${dataview.title || 'table'}.json`)
      }}>JSON`)

    return dataview

  }

}