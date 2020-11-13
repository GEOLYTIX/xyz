export default _xyz => {

  return {

    create: create
   
  }

  function create(dataview) {

    dataview.dataview = typeof dataview.target === 'string' && document.getElementById(dataview.target)

    dataview.dataview = dataview.target instanceof HTMLElement && dataview.target
      || _xyz.utils.html.node`<div class="${`${dataview.class || ''}`}" style="${dataview.style || ''}">`
      
    dataview.dataview.classList.add('dataview')

    dataview.panel && dataview.panel.appendChild(dataview.dataview)

    // Dataviews maybe provided as an array within a single dataview object.
    if (dataview.dataviews) {
      
      for (const nestedDataview of dataview.dataviews) {

        nestedDataview.tab = dataview.tab
        nestedDataview.layer = dataview.layer
        nestedDataview.location = dataview.location
        nestedDataview.panel = dataview.dataview
  
        create(nestedDataview)
      }

      return;
    }

    toolbar(dataview)

    dataview.target = dataview.dataview.appendChild(_xyz.utils.html.node`
      <div class="target">`)

    dataview.update = () => {
      _xyz.query(dataview).then(response => {
        if (_xyz.utils.isEqual(dataview.data, response)) return;
        dataview.setData(response)
      })
    }

    dataview.tab && dataview.tab.addEventListener('activate', dataview.update)

    dataview.mapChange && _xyz.mapview.node.addEventListener('changeEnd', ()=>{

      if (!dataview.display) return;

      if (dataview.layer && !dataview.layer.display) return;

      if (dataview.tab && !dataview.tab.classList.contains('active')) return;

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

      dataview.chart.setData = data => {

        dataview.chart.responseFunction && dataview.chart.responseFunction(data)

        dataview.chart.datasets
          && dataview.chart.datasets.length
          && data.datasets.forEach((dataset, i) => Object.assign(dataset, dataview.chart.datasets[i]))
    
        dataview.chart.ChartJS.data = {
          labels: typeof dataview.chart.labels === 'function' && dataview.chart.labels(data)
            || (data.labels || dataview.chart.labels),
          datasets: data.datasets
        }
    
      }
    
      dataview.target.appendChild(dataview.chart.div)

      dataview.setData = data => {

          if (!data) return;

          dataview.data = data
          dataview.chart.setData(data)
          dataview.chart.ChartJS.update()
      }
    }


    if (dataview.columns) {

      dataview.target.style.display = 'grid'
      
      dataview.target = dataview.target.appendChild(_xyz.utils.html.node`<div>`);

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

          if (!dataview.layer || !rowData[dataview.qID || 'id']) return;

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

      dataview.setData = data => {

        if (!data) return;

        dataview.data = data
        dataview.responseFunction && dataview.responseFunction(data)
        dataview.Tabulator.setData(data.length && data || [data])
        dataview.target.style.visibility = 'visible'
      }
    }

    // Set data from dataview if provided
    if (dataview.data) return dataview.setData(dataview.data)

    !dataview.tab && dataview.update()

  }

  function toolbar(dataview) {

    dataview.toolbar = dataview.toolbar || {}

    dataview.toolbar.node = dataview.dataview.appendChild(_xyz.utils.html.node`
      <div class="toolbar">`)

    if (dataview.toolbar.viewport) dataview.toolbar.node.appendChild(_xyz.utils.html.node`
    <button
      class="off-white-hover primary-colour"
      onclick=${e => {
        e.target.classList.toggle('primary-colour')
        dataview.viewport = !dataview.viewport
        dataview.update()
      }}>Viewport`)

    if (dataview.toolbar.download_csv) dataview.toolbar.node.appendChild(_xyz.utils.html.node`
    <button
      class="off-white-hover primary-colour"
      onclick=${() => {
        dataview.Tabulator.download('csv', `${dataview.title || 'table'}.csv`)
      }}>CSV`)

    if (dataview.toolbar.download_json) dataview.toolbar.node.appendChild(_xyz.utils.html.node`
    <button
      class="off-white-hover primary-colour"
      onclick=${() => {
        dataview.Tabulator.download('json', `${dataview.title || 'table'}.json`)
      }}>JSON`)

  }

}