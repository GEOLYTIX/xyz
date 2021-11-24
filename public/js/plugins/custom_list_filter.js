document.dispatchEvent(new CustomEvent('custom_list_filter', {
  detail: _xyz => {

    _xyz.layers.plugins.custom_list_filter = async layer => {

      const block = layer.view.appendChild(_xyz.utils.html.node`<div>`)

      // "custom_list_filter_query": {
      //   "template": "select distinct(retailer) as retailer from geodata.vw_uk_glx_open_retail_points_display_brand",
      //   "dbs": "MAPP"
      // }
      
      const response = await _xyz.xhr(`${_xyz.host}/api/query/custom_list_filter_query`)
      
      layer.filter.current.retailer = {}
      
      response.forEach(o => {

        block.appendChild(_xyz.utils.html.node`
        <label class="input-checkbox">
        <input
          type="checkbox"
          onchange=${e=>{

            if (e.target.checked) {

              if(!layer.filter.current.retailer.in?.length) {

                layer.filter.current.retailer = {
                  in: []
                }

              }

              // Add value to filter array.
              layer.filter.current.retailer.in.push(encodeURIComponent(e.target.parentNode.innerText))
                      
            } else {

              // Get index of value in filter array.
              let idx = layer.filter.current.retailer.in.indexOf(encodeURIComponent(e.target.parentNode.innerText))

              // Splice filter array on idx.
              layer.filter.current.retailer.in.splice(idx, 1);

              if (!layer.filter.current.retailer.in.length) {
                delete layer.filter.current.retailer.in
              }

            }

            layer.reload()
            
            //layer.show()

          }}>
        </input>
        <div></div><span>${o.retailer}`);
      
      })


    }

  }
}))