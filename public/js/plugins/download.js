document.dispatchEvent(new CustomEvent('download', {
  detail: _xyz => {

    _xyz.layers.plugins.download = layer => {

      layer.view.appendChild(_xyz.utils.html.node`
      <div style="padding-right: 5px;">
      <button
        class="btn-wide primary-colour"
        onclick=${download}>Download CSV`)

      async function download() {

        const scenarios = await _xyz.query({
          query: 'scenario_list'
        })

        _xyz.query({
          query: 'blueprint_csv',
          locale: _xyz.locale.key,
          layer: layer
        }).then(response => {

          const rows = response.map(record=>{
    
            return Object.values(record).map(record => {
      
              return isNaN(record) && `"${record}"` || record
      
            }).join(',')
          })

          rows.unshift([
            '"GLID"', 
            '"FAD"', 
            '"NAME"', 
            '"CURRENT TYPE"', 
            '"NEW TYPE"', 
            '"CURRENT AWS"', 
            '"FORECAST AWS"', 
            '"X"', 
            '"Y"', 
            '"Closest Postcode"', 
            '"Post Office Market"'
          ])
          
          const csv = rows.join('\r\n')
      
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })

          const link = _xyz.utils.html.node `
          <a
            href=${URL.createObjectURL(blob)}
            download=${scenarios
              .find(s => s.scenario_id === layer.filter.current.scenario_id.eq)
              .scenario_name}}.csv>`

          link.click()

        })
      }

    }

  }
}))