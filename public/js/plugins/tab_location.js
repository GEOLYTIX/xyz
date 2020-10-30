document.dispatchEvent(new CustomEvent('tab_location', {
  detail: _xyz => {

    _xyz.locations.plugins.tab_location = entry => {

      const tab = {
        title: 'Location',
        node: _xyz.utils.html.node`<div>So we all say`
      }

      entry.listview.appendChild(_xyz.utils.html.node`
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