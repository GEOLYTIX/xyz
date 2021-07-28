document.dispatchEvent(new CustomEvent('csv_import', {
  detail: _xyz => {

    _xyz.layers.plugins.csv_import = layer => {

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

        const nanoid = _xyz.utils.nanoid(6)

        const reader = new FileReader()

        reader.onload = async function() {

          var _text = this.result.split(/\r?\n/)
        
          var header = _text.shift().split(';')
          
          var _list = _text.map(row => {

            if (!row.length) return

            const _row = row.split(';')

            const o = {nano_id:nanoid}

            for (let i = 0; i < header.length; i++) {
              o[header[i]] = _row[i]
            }
      
            return o
      
          }).filter(o => typeof o === 'object')
         
          const response = await _xyz.xhr({
            method: 'POST',
            url: `${_xyz.host}/api/query?${_xyz.utils.paramString({
              template: 'csv_import',
              statement_timeout: 1000000,
              nonblocking: true,
              stringifyBody: true,
            })}`,
            body: JSON.stringify(_list)
          })

          console.log(response)

          setTimeout(ping, 10000)

        }

        reader.readAsText(this.files[0])

        input.value = null
        button.disabled = true

        async function ping() {

          const response = await _xyz.xhr(`${_xyz.host}/api/query?${_xyz.utils.paramString({
            template: 'csv_import_ping',
            nano_id: nanoid,
          })}`)

          if (response) {
            console.log(response)
            alert(`The model has successfully run for batch number ${response.val}`)
            button.disabled = false
            layer.reload()
            return
          }

          setTimeout(ping, 10000) 
        }

      })

    }

  }
}))

// document.dispatchEvent(new CustomEvent('csv_import', {
//   detail: _xyz => {

//     _xyz.layers.plugins.csv_import = layer => {

//       const input = _xyz.utils.html.node`
//       <input type="file" accept=".csv" style="display: none;">`
        
//       const div = _xyz.utils.html.node`
//       <div style="padding-right: 5px">`

//       layer.view.appendChild(div)

//       const button = _xyz.utils.html.node`
//       <button
//         class="btn-wide primary-colour"
//         onclick=${e => {
//           e.stopPropagation()
//           input.click()

//       }}>CSV Import${input}`

//       div.appendChild(button)

//       input.addEventListener('change', function() {

//         const nanoid = _xyz.utils.nanoid(6)

//         const reader = new FileReader()

//         reader.onload = function() {
//           try {

//             const xhr = new XMLHttpRequest()

//             xhr.open('POST', `${_xyz.host}/api/query/csv_import?statement_timeout=1000000&nonblocking=true`)

//             xhr.setRequestHeader('Content-Type', 'application/json')

//             xhr.responseType = 'json'

//             xhr.onload = e => {

//               if (e.target.status !== 200) return alert('Import went wrong. Likely unescaped characters found in your input.')

//               setTimeout(ping, 10000)
//             }
        
//             var _text = this.result.split(/\r?\n/)
        
//             var header = _text.shift().split(';')
            
//             var _list = _text.map(row => {

//               if (!row.length) return

//               const _row = row.split(';')

//               const o = {nano_id:nanoid}

//               for (let i = 0; i < header.length; i++) {
//                 o[header[i]] = _row[i]
//               }
        
//               return o
        
//             }).filter(o => typeof o === 'object')
        
//             xhr.send(JSON.stringify(_list))

//           } catch (err) {
//             console.error(err)
//           }
//         }

//         reader.readAsText(this.files[0])

//         input.value = null
//         button.disabled = true

//         async function ping() {

//           const response = await _xyz.query({
//             query: 'csv_import_ping',
//             queryparams: {
//               nano_id: nanoid
//             }
//           })

//           if (response) {

//             console.log(response)
//             alert(`The model has successfully run for batch number ${response.val}`)
//             button.disabled = false
//             layer.reload()
//             return
//           }

//           setTimeout(ping, 10000) 
//         }

//       })

//     }

//   }
// }))

//select * from camelot.camelot_check_process_finish WHERE id='P9nki'