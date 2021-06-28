document.dispatchEvent(new CustomEvent('reset_view', {
  detail: _xyz => {

    const mapButton = document.getElementById('mapButton')

    if (!mapButton) return
      
    const node = _xyz.utils.html.node`
      <button
        class="mobile-display-none"
        title="Reset View"
        onclick=${e => {
          
          if(confirm('Initial app view is about to be restored. Are you sure?')) {
            _xyz.hooks.removeAll() 
            location.reload()
          }
        
        }}>
        <div class="xyz-icon icon-restore">`

    mapButton.insertBefore(node, mapButton.firstChild)

  }
}))