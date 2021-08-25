document.dispatchEvent(new CustomEvent('filter_multiselect', { 
  detail: _xyz => {

    // "plugins": ["filter_multiselect"],
    // "filter_multiselect": [{
    //     "title": "Retailer (multiple)",
    //     "field": "retailer",
    //     "query": "idn_benchmark_brands_retailers"
    //   },
    //   {
    //     "title": "Fascia (multiple)",
    //     "field": "fascia",
    //     "query": "idn_benchmark_brands_fascias"
    //   }
    // ]

    _xyz.layers.plugins.filter_multiselect = layer => {

      if (!layer.filter_multiselect?.length) return;
    
      layer.filter_multiselect.forEach(async entry => {
        
        layer.filter.select.querySelector('ul').appendChild(_xyz.utils.html.node`
          <li onclick=${e => {
            
            e.target.closest('.btn-drop').classList.toggle('active')
   
            layer.filter.clear_all.style.display = 'block'
             
            return filter(layer, entry)
  
          }}>${entry.title}`)
      })

      async function filter(layer, entry) {

        const response = await _xyz.xhr(`${_xyz.host}/api/query/${entry.query}`)
                    
        if (entry.el && entry.el.parentNode) {
          return _xyz.layers.view.filter.reset(layer, entry)
        }
          
        const block = _xyz.layers.view.filter.block(layer, entry)
          
        block.dataset.field = entry.field
          
        entry.el = block
          
        layer.filter.current[entry.field] = {}
          
        block.appendChild(_xyz.utils.html.node`
          <button class="btn-drop">
            <div 
              class="head"
              onclick=${e => {
                e.preventDefault()
                e.target.parentElement.classList.toggle('active')
              }}>
              <span>Select multiple from the list</span>
              <div class="icon"></div>
            </div>
            <ul>${response.map(o => _xyz.utils.html`
              <li onclick=${e => {
  
                e.stopPropagation()
                e.target.classList.toggle('secondary-colour-bg')
                    
                if (e.target.classList.contains('secondary-colour-bg')) {

                  if (!layer.filter.current[entry.field].in?.length) {
                    layer.filter.current[entry.field] = {
                      in: []
                    }
                  }

                  // Add value to filter array.
                  layer.filter.current[entry.field].in.push(encodeURIComponent(e.target.innerText))

                } else {

                  // Get index of value in filter array.
                  let idx = layer.filter.current[entry.field].in.indexOf(encodeURIComponent(e.target.innerText))

                  // Splice filter array on idx.
                  layer.filter.current[entry.field].in.splice(idx, 1)

                  if (!layer.filter.current[entry.field].in.length) {
                    delete layer.filter.current[entry.field].in
                  }

                }

                layer.reload()
                  
                }}>${o[entry.field]}`)}`)

      }
    }
  } 
}))