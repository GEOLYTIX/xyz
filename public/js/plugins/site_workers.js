document.dispatchEvent(new CustomEvent('site_workers', {
  detail: _xyz => {

    _xyz.locations.plugins.site_workers = entry => {

      _xyz.query({
        query: 'sites_workers_split',
        location: entry.location
      }).then(response => {

        const dataview = _xyz.locations.view.dataview({
          location: entry.location,
          target: "location",
          data: response,
          chart: {
            type: "doughnut",
            options: {
              plugins: {
                legend: {
                  display: false
                }
              }
            }
          }
        });
      
        dataview && entry.listview.appendChild(dataview);

        response.labels.forEach((label, i) => {
          if (response.datasets[0].data[i] === 0) return

          entry.listview.appendChild(_xyz.utils.html.node`
          <div class="label inline"
            style="${`padding-left: 6px; border-left: 3px solid ${response.datasets[0].backgroundColor[i]}; font-size: 90%; font-weight: 400;`}">${label}</div>
          <div class="val inline">${response.datasets[0].data[i]} %`)
        })
        
      })

    }

  }
}))