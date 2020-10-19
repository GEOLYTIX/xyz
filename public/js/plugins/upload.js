document.dispatchEvent(new CustomEvent('upload', {
  detail: _xyz => {

    _xyz.layers.plugins.upload = layer => {

      const input = _xyz.utils.html.node`
      <input type="file" accept=".csv" style="display: none;">`
        
      const div = _xyz.utils.html.node`
      <div style="padding-right: 5px">`

      layer.view.appendChild(div)

      const button = _xyz.utils.html.node`
      <button
        class="btn-wide primary-colour"
        onclick=${e => {
          e.stopPropagation()
          input.click()

      }}>CSV Import${input}`

      div.appendChild(button)

      input.addEventListener('change', function() {

        const reader = new FileReader()

        reader.onload = function() {
          try {

            var _text = this.result.split(/\r?\n/)

            _text.shift()

            const _list = _text
              .filter(row => !!row.length)
              .map(row => {

                row = row
                  .split(/,(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/)
                  .map(x => x.replace(/'/g, '\'\''))
                  .map(x => x.replace(/^"(.*)"$/, '$1'))
                  .map(x => !x.length && `NULL` || x)
                  .map(x => x !== 'NULL' && `'${x}'` || x)
                  //.map(x => isNaN(x) && `'${x}'` || x)
                  //.map(x => !x.length && `NULL` || x)

                return row.join()

              })

            const xhr = new XMLHttpRequest()

            xhr.open('POST', `${_xyz.host}/api/query/upload?locale=UK&statement_timeout=100000`)

            xhr.setRequestHeader('Content-Type', 'application/json')

            xhr.responseType = 'json'

            xhr.onload = e => {

              button.disabled = false
        
              if (e.target.status !== 200) return alert('Import went wrong. Likely unescaped characters found in your input.')
        
              console.log(e.target.response.glx_camelot)
              
              layer.reload()
        
            }
        
            xhr.send(JSON.stringify(_list))

          } catch (err) {
            console.error(err)
          }
        }

        reader.readAsText(this.files[0])

        input.value = null
        button.disabled = true
      })

    }

  }
}))