mapp.utils.merge(mapp.dictionaries, {
  en: {
    layer_dataview_header: 'Data Views',
  },
  de: {
    layer_dataview_header: 'Datenansichten',
  },
  zh: {
    layer_dataview_header: '显示数据',
  },
  zh_tw: {
    layer_dataview_header: '顯示數據',
  },
  pl: {
    layer_dataview_header: 'Widok danych',
  },
  fr: {
    layer_dataview_header: 'Voir les données',
  },
  ja: {
    layer_dataview_header: 'データビュー',
  },
  es: {
    layer_dataview_header: 'Ver los datos',
  },
  tr: {
    layer_dataview_header: 'Veri gorunumleri',
  },
  it: {
    layer_dataview_header: 'Visualizzazione dei dati',
  },
  th: {
    layer_dataview_header: 'มุมมองข้อมูล',
  },
})

export default layer => {
  
  // Create chkbox controls for each dataview entry.
  const dataviewChkboxes = Object.entries(layer.dataviews).map(entry => {

    if (typeof entry[1] !== 'object') return;

    // Assign layer and key to the dataview entry object.
    const dataview = Object.assign(entry[1], {
      key: entry[0],
      layer,
      host: layer.mapview.host
    })

    // Find tabview element from data-id attribute.
    const tabview = document.querySelector(`[data-id=${dataview.target}]`)

    // Return if the named tabview is not found in document.
    if (!tabview) return;

    // Assign target html element for dataview.
    dataview.target = mapp.utils.html.node`<div class="dataview-target">`

    // Create dataview from entry.
    layer.display && dataview.display && createTabAndShow()

    function createTabAndShow() {

      if (dataview.show) return dataview.show()

      // Pass dataview entry as detail to the tabview.
      // The dataview entry becomes a tab.
      tabview.dispatchEvent(new CustomEvent('addTab', {
        detail: dataview
      }))

      mapp.ui.Dataview(dataview).then(() => dataview.show())
    }

    layer.showCallbacks.push(()=>{
      dataview.display && createTabAndShow()
    })

    // Return the chkbox control.
    return mapp.ui.elements.chkbox({
      label: dataview.title || dataview.key,
      checked: !!dataview.display,
      onchange: (checked) => {
  
        dataview.display = checked

        // Show or remove tab according to the checked/display value.
        dataview.display ?
          createTabAndShow() :
          dataview.remove()
    
      }
    })

  })

  if (layer.dataviews.hide) return;

  // Create a drawer with the dataview chkbox controls.
  const drawer = mapp.ui.elements.drawer({
    data_id: `dataviews-drawer`,
    class: 'raised',
    header: mapp.utils.html`
      <h3>${mapp.dictionary.layer_dataview_header}</h3>
      <div class="mask-icon expander"></div>`,
    content: mapp.utils.html`${dataviewChkboxes.filter(dv => !!dv)}`
  })

  return drawer
}