export default (function(){

  mapp.ui.locations.entries.chart_plugin = entry => {

    Object.assign(entry, {
      "query": "chartdata",
      "chart": {
        "type": "pie",
        "labels": [
          "Owner Occupied",
          "Renting",
          "Social",
          "Rent Free"
        ],
        "plugins": [
          "ChartDataLabels"
        ],
        "options": {
          "maintainAspectRatio": false,
          "plugins": {
            "datalabels": {
              "color": "#fff"
            }
          }
        },
        "datasets": [
          {
            "fields": [
              "Owner Occupied",
              "Renting",
              "Social",
              "Rent Free"
            ],
            "backgroundColor": [
              "#cddc39",
              "#00bcd4",
              "#ffc107",
              "#33691e"
            ]
          }
        ]
      }
    })

    return mapp.ui.locations.entries.dataview(entry)

  }

})()
