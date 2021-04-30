document.dispatchEvent(new CustomEvent('reset_view', {
  detail: _xyz => {
      
    const node = _xyz.utils.html.node`
      <div
        title="Reset View"
        onclick=${e => {
          
          if(confirm('Initial app view is about to be restored. Are you sure?')) {
            _xyz.hooks.removeAll() 
            location.reload()
          }
        
        }}>
        <a class="link-with-img">
          <div
            class="xyz-icon icon-restore primary-colour-filter"
            style="width: 30px; height: 30px; margin-left: 10px;">`

      document
        .getElementById('mapButton')
        .insertBefore(node, document.getElementById('mapButton').firstChild)

  }
}))