mapp.utils.merge(mapp.dictionaries, {
  en: {
    layer_dataview_header: "Data Views",
  },
  de: {
    layer_dataview_header: "Datenansichten",
  },
  cn: {
    layer_dataview_header: "数据检视",
  },
  pl: {
    layer_dataview_header: "Widoki danych",
  },
  ko: {
    layer_dataview_header: "데이터 보기",
  },
  fr: {
    layer_dataview_header: "Vues des données",
  },
  ja: {
    layer_dataview_header: "データビュー",
  }
})

export default layer => {
  
  // Create chkbox controls for each dataview entry.
  const dataviewChkboxes = Object.entries(layer.dataviews).map(entry => {

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

    // Create dataview from entry.
    mapp.ui.Dataview(dataview)

    // Pass dataview entry as detail to the tabview.
    // The dataview entry becomes a tab.
    tabview.dispatchEvent(new CustomEvent('addTab', {
      detail: dataview
    }))

    layer.tabs ?
      layer.tabs.push(dataview) :
      layer.tabs = [dataview];

    // Show the tab if display is true.
    layer.display && dataview.display && dataview.show()

    // Return the chkbox control.
    return mapp.ui.elements.chkbox({
      label: dataview.title || dataview.key,
      checked: !!dataview.display,
      onchange: (checked) => {
  
        dataview.display = checked

        // Show or remove tab according to the checked/display value.
        dataview.display ?
          dataview.show() :
          dataview.remove()
    
      }
    })

  })

  // Create a drawer with the dataview chkbox controls.
  const drawer = mapp.ui.elements.drawer({
    data_id: `dataviews-drawer`,
    class: 'lv-1',
    header: mapp.utils.html`
      <h3>${mapp.dictionary.layer_dataview_header}</h3>
      <div class="mask-icon expander"></div>`,
    content: mapp.utils.html`${dataviewChkboxes}`
  })

  return drawer
}