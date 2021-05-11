document.dispatchEvent(new CustomEvent('practice_catchment', {
  detail: _xyz => {

    const index_color = val => {
      if (val < 0.95) return '#FF4E33'
      if (val <= 1.05) return '#FFAE33'
      return '#090'
    }

    _xyz.locations.plugins.practice_catchment = entry => {

      _xyz.query({
        query: 'practice_directory_catchment',
        location: entry.location
      }).then(response => {

        _xyz.locations.view.geometry({
          title: "Patient Catchment",
          type: "geometry",
          location: entry.location,
          listview: entry.listview,
          value: response.geom,
          style: {
            strokeColor: "#BB0A21",
            fillColor: "#BB0A21",
            fillOpacity: 0.3
          }
        })

        entry.listview.appendChild(_xyz.utils.html.node`
        <div class="label inline">Population</div>
        <div class="val inline">${response.pop}`)

        entry.listview.appendChild(_xyz.utils.html.node`
        <div class="label inline">OAC Index</div>
        <div class="val inline"
          style="${`color:${index_color(response.oac_index)}`}">${parseFloat(response.oac_index).toFixed(2)}`)

        entry.listview.appendChild(_xyz.utils.html.node`
        <div class="label inline">Index - NHS exempt</div>
        <div class="val inline"
          style="${`color:${index_color(response.nhs_ex_index)}`}">${parseFloat(response.nhs_ex_index).toFixed(2)}`)

        entry.listview.appendChild(_xyz.utils.html.node`
        <div class="label inline">Index - NHS Fee Pay</div>
        <div class="val inline" 
          style="${`color:${index_color(response.nhs_fee_index)}`}">${parseFloat(response.nhs_fee_index).toFixed(2)}`)

        entry.listview.appendChild(_xyz.utils.html.node`
        <div class="label inline">Index - Full Price Private</div>
        <div class="val inline"
          style="${`color:${index_color(response.private_fp_index)}`}">${parseFloat(response.private_fp_index).toFixed(2)}`)

        entry.listview.appendChild(_xyz.utils.html.node`
        <div class="label inline">Index - Private Affordable</div>
        <div class="val inline"
          style="${`color:${index_color(response.private_afford_index)}`}">${parseFloat(response.private_afford_index).toFixed(2)}`)

        entry.listview.appendChild(_xyz.utils.html.node`
        <div class="label inline">Competitiveness Index</div>
        <div class="val inline"
          style="${`color:${index_color(response.competitiveness)}`}">${parseFloat(response.competitiveness).toFixed(2)}`)

        entry.listview.appendChild(_xyz.utils.html.node`
        <div class="label inline">Gap to NHS Index</div>
        <div class="val inline"
          style="${`color:${index_color(response.gap_to_nhs_index)}`}">${parseFloat(response.gap_to_nhs_index).toFixed(2)}`)          

        entry.listview.appendChild(_xyz.utils.html.node`
        <div class="label inline">Total Demand (£)</div>
        <div class="val inline">${response.total_dem}`)
        
      })

    }

  }
}))