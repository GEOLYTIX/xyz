/**
## ui/layers/panels/dataviews

The dataviews panel module exports the dataviews method as mapp.ui.layers.panels.dataviews().

@requires /ui/Dataview

@module /ui/layers/panels/dataviews
*/

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

/**
@function dataviews

@description
The dataviews method creates returns a drawer with checkbox elements each of the layer dataviews{} object.

The dataviews will be decorated with the mapp.ui.Dataview() method.

@param {Object} layer The decorated mapp layer object.
@param {Object} layer.dataviews The layer dataviews.
@param {Boolean} layer.dataviews.hide Flag to prevent return of the dataviews drawer element.

@return {HTMLElement}
*/

export default function dataviews(layer) {
  
  // Create chkbox controls for each dataview entry.
  const dataviewChkboxes = Object.entries(layer.dataviews).map(entry => {

    // The layer.dataviews{} object may include a hide flag.
    if (typeof entry[1] !== 'object') return;

    // Spread dataview properties.
    const dataview = {
      key: entry[0],
      host: layer.mapview.host,
      ...entry[1],
      layer,
    }

    // Find tabview element from data-id attribute.
    dataview.tabview = document.querySelector(`[data-id=${dataview.target}]`)

    // Return if the named tabview is not found in document.
    if (!dataview.tabview) return;

    // Assign target html element for dataview.
    dataview.target = mapp.utils.html.node`<div class="dataview-target">`

    // Assign label for dataview.chkbox
    dataview.label ??= dataview.title || dataview.key

    dataview.show ??= () => {

      // Create tab after dataview creation is complete.
      dataview.tabview.dispatchEvent(new CustomEvent('addTab', {
        detail: dataview
      }))

      // Show the dataview tab.
      dataview.show()
    }

    dataview.hide ??= () => {

      dataview.display = false

      dataview.remove()
    }

    if (mapp.ui.Dataview(dataview) instanceof Error) return;

    // Display dataview if layer and dv have display flag.
    layer.display
      && dataview.display
      && dataview.show()

    layer.showCallbacks.push(()=>{
      dataview.display && dataview.show()
    })

    return dataview.chkbox
  })

  // The dataviews are created but no panel is returned.
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
