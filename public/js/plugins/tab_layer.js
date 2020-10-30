document.dispatchEvent(new CustomEvent('tab_layer', {
  detail: _xyz => {

    _xyz.layers.plugins.tab_layer = layer => {

      const tab = {
        title: 'Layer',
        node: _xyz.utils.html.node`<div>So we all say`
      }

      layer.view.appendChild(_xyz.utils.html.node`
        <label class="input-checkbox">
        <input
          type="checkbox"
          onchange=${e => {
            tab.display = e.target.checked
            if (tab.display) return _xyz.dataviews.tabview.add(tab)
            tab.remove()
          }}>
        </input>
        <div></div><span>BSG75`)

    }

  }
}))