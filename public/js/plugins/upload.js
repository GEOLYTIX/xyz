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

            // Split on new line to create array of rows.
            const csv = this.result.split(/\r?\n/)

            // Shift header row from array.
            csv.shift()

            
            const lines = csv
              .filter(row => !!row.length)
              .map(row => {

                row = row
                  .split(/,(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/)
                  .map(x => x.replace(/'/g, '\'\''))
                  .map(x => x.replace(/^"(.*)"$/, '$1'))
                  .map(x => !x.length && `NULL` || x)
                  .map(x => x !== 'NULL' && `'${x}'` || x)

                return row.join()

              })

            const uploadPromise = payload => new Promise((resolve, reject)=>{

              const xhr = new XMLHttpRequest()

              xhr.open('POST', `${_xyz.host}/api/query/upload?locale=UK&statement_timeout=100000`)
  
              xhr.setRequestHeader('Content-Type', 'application/json')
  
              xhr.responseType = 'json'
  
              xhr.onload = e => {
            
                if (e.target.status !== 200) return reject()
          
                resolve(payload[0])
          
              }
          
              xhr.send(JSON.stringify(payload))

            })

            const promises = []

            for (let i = 0; i < lines.length; i+=999) {
              let payload = lines.slice(i,i+999)
              promises.push(uploadPromise(payload))
            }

            Promise
              .all(promises)
              .then(arr => {

                //console.log(arr)

                button.disabled = false               
                layer.reload()
              })

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