export default (function () {

  const mapButton = document.getElementById('mapButton')

  if (!mapButton) return

  const node = mapp.utils.html.node`
    <button
      class="mobile-display-none mask-icon restore"
      title="Reset View"
      onclick=${e => {

        if (confirm('Initial app view is about to be restored. Are you sure?')) {
          mapp.hooks.removeAll()
          location.reload()
        }
      }}>`

  mapButton.insertBefore(node, mapButton.firstChild)

})()