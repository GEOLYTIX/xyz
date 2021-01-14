document.dispatchEvent(new CustomEvent('demand_chart', {
  detail: _xyz => {

    _xyz.locations.plugins.demand_chart = entry => {

      Object.assign(entry, {
        title: 'Demand',
        display: true,
        //layer: entry.location.layer,
        //id: entry.location.id,
        //location: entry.location,
        //query: entry.query,
        chart: {
          height: 150,
          type: 'line',
          options: {
            scales: {
              yAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: 'Demand (£100,000)'
                },
                ticks: {
                  stepSize: 100
                }
              }],
              xAxes: [{
                ticks: {
                  maxRotation: 90,
                  minRotation: 90
                },
                scaleLabel: {
                  display: true,
                  labelString: 'Week start date',
                  padding: 20
                }
              }]
            },
            tooltips: {
              enabled: true,
              intersect: true,
              position: 'average',
              displayColors: false,
              callbacks: {
                label: function (tooltipItem, data) {
  
                  let label = data.datasets[tooltipItem.datasetIndex].label,
                    online = data.datasets[1].data,
                    instore = data.datasets[0].data,
                    idx = data.labels.indexOf(tooltipItem.xLabel),
                    pct = Math.round(online[idx] * 1000 / (instore[idx] + online[idx]), 1) / 10
  
                  return [
                    `InStore ${instore[idx].toLocaleString()} (£100,000)`,
                    `Online ${online[idx].toLocaleString()} (£100,000)`,
                    `Online ${pct}%`
                  ]
                }
              }
            },
            legend: {
              display: true,
              align: 'end'
            },
            plugins: {
              datalabels: {
                display: false
              }
            }
          }
        }
      })

      entry.listview.appendChild(_xyz.locations.view.dataview(entry));

    }
  }
}))