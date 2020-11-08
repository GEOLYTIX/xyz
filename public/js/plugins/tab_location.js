document.dispatchEvent(new CustomEvent('tab_location', {
  detail: _xyz => {

    _xyz.locations.plugins.tab_location = entry => {

      const tab = {
        title: 'Location',
        target: _xyz.utils.html.node`<div>So we all say`,
        location: entry.location
      }

      _xyz.tabview.add(tab)

      entry.listview.appendChild(_xyz.utils.html.node`
        <label class="input-checkbox">
        <input
          type="checkbox"
          onchange=${e => {
            tab.display = e.target.checked
            tab.display ? tab.show() : tab.remove()
          }}>
        </input>
        <div></div><span>BSG75`)

    }

  }
}))