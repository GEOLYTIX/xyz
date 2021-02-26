document.dispatchEvent(new CustomEvent('compare_location', {
  detail: _xyz => {

    _xyz.locations.plugins.compare_location = entry => {

      console.log(entry.location.layer)

      entry.location.layer.comparison_tab.target
        .appendChild(_xyz.utils.html.node`<div>${entry.location.id}`)

    }

  }
}))