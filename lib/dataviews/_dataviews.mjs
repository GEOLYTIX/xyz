import tabview from './tabview.mjs';

export default _xyz => {

  return {

    create: create,
   
    tabview: tabview(_xyz),

  }

  function array(dataview) {

    dataview.dataviews.forEach(_dataview => {
      _dataview.active = dataview.active
      _dataview.tab = dataview.tab
      _dataview.layer = dataview.layer
      _dataview.id = dataview.id
      _dataview.target = _xyz.utils.html.node`
        <div class="${_dataview.class || ''}" style="${_dataview.style || ''}">`
      dataview.target.appendChild(_dataview.target)
      dataview.target.style.gridTemplateRows = 'auto'
      create(_dataview)
    });

    return dataview;
  }

  function create(dataview) {

    dataview.target = dataview.target instanceof HTMLElement && dataview.target
    || _xyz.utils.html.node`<div class="${dataview.class || ''}" style="${dataview.style || ''}">`;

    if (dataview.dataviews) return array(dataview);

    dataview.layer && dataview.layer._dataviews.add(dataview);

    dataview.remove = () => {
      dataview.target.remove();
      dataview.layer && dataview.layer._dataviews.delete(dataview);
    }

    const toolbar = _xyz.utils.html.node`<div class="toolbar">`;

    dataview.target.appendChild(toolbar);

    const target = _xyz.utils.html.node`<div>`;

    dataview.target.appendChild(target);

    dataview.update = () => {

      if (dataview.active || dataview.tab && dataview.tab.classList.contains('active')) {
        _xyz.query(dataview).then(response => {
          dataview.setData(response)
        })
      }

    }

    if (dataview.chart) {

      dataview.chart.div = _xyz.utils.html.node`<div style="position: relative;">`;

      const canvas = _xyz.utils.html.node`<canvas>`;

      if(dataview.chart.height) canvas.setAttribute('height', dataview.chart.height);
      if(dataview.chart.width) canvas.setAttribute('width', dataview.chart.width);
    
      dataview.chart.div.appendChild(canvas);
       
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
      });
    
      dataview.chart.options && Object.assign(dataview.chart.ChartJS.options, dataview.chart.options);

      dataview.chart.setData = response => {

        dataview.chart.responseFunction && dataview.chart.responseFunction(response)

        dataview.chart.datasets && 
        dataview.chart.datasets.length && 
        response.datasets.forEach((dataset, i) => Object.assign(dataset, dataview.chart.datasets[i]));
    
        dataview.chart.ChartJS.data = {
          labels: typeof dataview.chart.labels == 'function' && dataview.chart.labels(response) || (response.labels || dataview.chart.labels),
          datasets: response.datasets
        }
    
      }
    
      target.appendChild(dataview.chart.div);

      dataview.setData = response => {
          if (!response) return

          dataview.chart.setData(response);
          dataview.chart.ChartJS.update();
      }
    }

    if (dataview.columns) {

      (function applyFormatters(cols){
        cols.forEach(col => {
          if(col.customFormatter) col.formatter = _xyz.utils.TabulatorFormatter[col.customFormatter];
          col.columns && applyFormatters(col.columns);
        });
      })(dataview.columns);

      dataview.Tabulator = new Tabulator(target, Object.assign({
        invalidOptionWarnings: false,
        tooltipsHeader: true,
        columnHeaderVertAlign: 'center',
        layout: dataview.layout || 'fitDataFill',
        autoColumns: dataview.autoColumns || false,
        height: 'auto',
        rowFormatter: row => {
          if(row.getData().backgroundcolour){
            const el = row.getElement();
            el.style.backgroundColor = row.getData().backgroundcolour;
          }
        },
        selectable: false,
        rowClick: (e, row) => {
          const rowData = row.getData();
          if (!dataview.layer || !rowData.id) return;
          _xyz.locations.select({
            locale: _xyz.locale.key,
            layer: rowData.layer && _xyz.layers.list[rowData.layer] || dataview.layer,
            table: rowData.table || dataview.table,
            id: rowData.id,
            //_flyTo: true,
          });
          row.deselect();
        }
      }, dataview));

      dataview.setData = response => {
        if (!response) return

        dataview.responseFunction && dataview.responseFunction(response)

        dataview.Tabulator.setData(response.length && response || [response]);

      }
    }

    !dataview.tab && dataview.update();

    if (dataview.toolbar && dataview.toolbar.viewport) toolbar.appendChild(_xyz.utils.html.node`
    <button
      class="off-white-hover primary-colour"
      onclick=${e => {
        e.target.classList.toggle('primary-colour');
        dataview.viewport = !dataview.viewport;
        dataview.update();
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

    return dataview;

  }

}