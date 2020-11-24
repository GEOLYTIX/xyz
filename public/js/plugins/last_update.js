document.dispatchEvent(new CustomEvent('last_update', {
  detail: _xyz => {

    _xyz.layers.plugins.last_update = layer => {

      const div = layer.view.appendChild(_xyz.utils.html.node`
      <div style="margin: 10px 0 5px 0; font-weight: bold;">`)

      _xyz.query({
        query: 'last_update'
      }).then(response => {
        const d = new Date(response.last_updated)
        div.textContent = `Last update: ${d.toLocaleDateString()}`
      })

    }

  }
}))