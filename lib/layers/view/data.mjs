export default _xyz => {

  return {

    panel: panel

  }

  function panel(layer) {

    if (!layer.dataviews || !_xyz.tabview.node) return

    const panel = _xyz.utils.html.node`<div class="drawer panel expandable">`
  
    // Panel header
    panel.appendChild(_xyz.utils.html.node`
      <div
        class="header primary-colour"
        onclick=${e => {
          e.stopPropagation()
          _xyz.utils.toggleExpanderParent(e.target, true)
        }}>
        <span>${_xyz.language.layer_dataview_header}</span>
        <button class="btn-header xyz-icon icon-expander primary-colour-filter">`)


    Object.entries(layer.dataviews).forEach(_dataview => {

      const dataview = _dataview[1]

      dataview.key = _dataview[0]
      dataview.layer = layer

      _xyz.tabview.add(dataview)

      _xyz.dataviews.create(dataview)

      layer.display && dataview.display && dataview.show()

      // Create checkbox to toggle whether table is in tabs list.
      panel.appendChild(_xyz.utils.html.node`
        <label class="input-checkbox inline">
          <input
            type="checkbox"
            .checked=${!!dataview.display}
            onchange=${e => {

              dataview.display = e.target.checked
              dataview.display ?
                dataview.show() :
                dataview.remove()

            }}></input>
          <div></div>
        </label>
        <span>${dataview.title || dataview.key}<span><br/>`)

      })

    return panel

  }

}