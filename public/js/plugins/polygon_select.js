document.dispatchEvent(new CustomEvent('polygon_select', {
  detail: _xyz => {

    _xyz.locations.plugins.polygon_select = entry => {

      _xyz.query({
        query: 'polygon_select_query',
        location: entry.location
      }).then(response => {

        entry.listview.appendChild(_xyz.utils.html.node`
        <div class="label inline">Total Workers</div>
        <div class="val inline">${response.workers}`)

        entry.listview.appendChild(_xyz.utils.html.node`
        <div class="label inline">Total Population</div>
        <div class="val inline">${response.pop}`)

        entry.listview.appendChild(_xyz.utils.html.node`
        <div class="label inline">Population aged 0-18</div>
        <div class="val inline">${response.age0to18}`)

        entry.listview.appendChild(_xyz.utils.html.node`
        <div class="label inline">Population aged 18-24</div>
        <div class="val inline">${response.age18to24}`)

        entry.listview.appendChild(_xyz.utils.html.node`
        <div class="label inline">Population aged 25-44</div>
        <div class="val inline">${response.age25to44}`)

        entry.listview.appendChild(_xyz.utils.html.node`
        <div class="label inline">Population aged 45-59</div>
        <div class="val inline">${response.age45to59}`)

        entry.listview.appendChild(_xyz.utils.html.node`
        <div class="label inline">Population aged 60+</div>
        <div class="val inline">${response.age60plus}`)

        entry.listview.appendChild(_xyz.utils.html.node`
        <div class="label inline">Competition Count</div>
        <div class="val inline">${response.comp_count}`)

        entry.listview.appendChild(_xyz.utils.html.node`
        <div class="label inline">Population per competition</div>
        <div class="val inline">${response.pop_per_comp}`)

        entry.listview.appendChild(_xyz.utils.html.node`
        <div class="label inline">Beauty salon count</div>
        <div class="val inline">${response.beauty_salon_count}`)
        
      })

    }

  }
}))