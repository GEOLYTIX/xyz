document.dispatchEvent(new CustomEvent('features_of_interest', {
    detail: _xyz => {

        _xyz.locations.plugins.features_of_interest = entry => {
          
          if(!_xyz.foi) _xyz.foi = []

          let label = _xyz.utils.html.node`<div>Add to Features of Interest`

          let icon = _xyz.utils.html.node`<div style="height: 1em;" class="xyz-icon icon-add"></div>`

          entry.location.view.appendChild(_xyz.utils.html.node`<button class="primary-colour" style="margin-top: 10px;"
            onclick=${e => {
              e.stopPropagation()

              let idx = _xyz.foi.indexOf(entry.location.hook)

              idx === -1 ? _xyz.foi.push(entry.location.hook) : _xyz.foi.splice(idx, 1)

              label.textContent = idx === -1 ? 'Remove from Features of Interest' : 'Add to Features of Interest'

              icon.classList = idx === -1 ? 'xyz-icon icon-remove' :  'xyz-icon icon-add'

            }}>
            <div style="display: grid; grid-template-columns: 1em auto; margin:auto;">
            ${icon}${label}`)
        
        }
    }
}))