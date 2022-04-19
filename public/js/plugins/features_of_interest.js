document.dispatchEvent(new CustomEvent('features_of_interest', {
    detail: _xyz => {

        _xyz.locations.plugins.features_of_interest = entry => {
          
          if(!_xyz.foi) _xyz.foi = new Set()

          if(entry.pluginDomEl) return

          let label = _xyz.utils.html.node`<div class="foi-label">Add to Features of Interest`

          let icon = _xyz.utils.html.node`<div style="height: 1em;" class="xyz-icon icon-add foi-icon"></div>`

          if(_xyz.foi.has(entry.location.hook)) label.textContent = 'Remove from Features of Interest'

          if(_xyz.foi.has(entry.location.hook)) icon.classList = 'xyz-icon icon-remove foi-icon'

          entry.pluginDomEl = _xyz.utils.html.node`<button class="primary-colour" style="margin-top: 10px;"
            onclick=${e => {
              e.stopPropagation()

              _xyz.foi.has(entry.location.hook) ? _xyz.foi.delete(entry.location.hook) : _xyz.foi.add(entry.location.hook)

              label.textContent = _xyz.foi.has(entry.location.hook) ? 'Remove from Features of Interest' : 'Add to Features of Interest'

              icon.classList = _xyz.foi.has(entry.location.hook) ? 'xyz-icon icon-remove foi-icon' :  'xyz-icon icon-add foi-icon'

              document.dispatchEvent(new CustomEvent('features_of_interest_update'))

            }}>
            <div style="display: grid; grid-template-columns: 1em auto; margin:auto;">
            ${icon}${label}`

           entry.location.view.appendChild(entry.pluginDomEl)
        
        }
    }
}))