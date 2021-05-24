document.dispatchEvent(new CustomEvent('stores_drivetimes', {
  detail: _xyz => {

    const uk_metrics = _xyz.query({query:'uk_metrics'})

    _xyz.locations.plugins.stores_drivetimes = entry => {

      if (!entry.location.infoj.find(e => e.field === 'geom_8_min').value) return

      if (!entry.location.infoj.find(e => e.field === 'geom_10_min').value) return

      if (!entry.location.infoj.find(e => e.field === 'geom_15_min').value) return

      console.log(uk_metrics)

      Promise.all([_xyz.query(Object.assign(
        entry, {
          query: 'stores_drivetimes_no_uk'
        }
      )), uk_metrics]).then(response => {
        
        const data = response[0].concat([response[1]])

        delete entry.query

        Object.assign(entry, {
          title: 'Stores Drivetimes',
          display: true,
          //data: data,
          columns: [{
              field: 'drivetime',
              title: 'metric'
            },
            {
              field: 'total_population',
              title: 'total_population'
            },
            {
              field: 'target_population',
              title: 'target_population'
            },
            {
              field: 'affluence_index_1',
              title: 'affluence_index_1'
            },
            {
              field: 'affluence_index_2',
              title: 'affluence_index_2'
            },
            {
              field: 'affluence_index_3',
              title: 'affluence_index_3'
            },
            {
              field: 'affluence_index_4',
              title: 'affluence_index_4'
            },
            {
              field: 'affluence_index_5',
              title: 'affluence_index_5'
            },
            {
              field: 'affluence_index_6',
              title: 'affluence_index_6'
            },
            {
              field: 'affluence_index_7',
              title: 'affluence_index_7'
            },
            {
              field: 'affluence_index_8',
              title: 'affluence_index_8'
            },
            {
              field: 'life_stage_index_1',
              title: 'life_stage_index_1'
            },
            {
              field: 'life_stage_index_2',
              title: 'life_stage_index_2'
            },
            {
              field: 'life_stage_index_3',
              title: 'life_stage_index_3'
            },
            {
              field: 'life_stage_index_4',
              title: 'life_stage_index_4'
            },
            {
              field: 'life_stage_index_5',
              title: 'life_stage_index_5'
            },
            {
              field: 'life_stage_index_6',
              title: 'life_stage_index_6'
            },
            {
              field: 'life_stage_index_7',
              title: 'life_stage_index_7'
            },
            {
              field: 'life_stage_index_8',
              title: 'life_stage_index_8'
            },
            {
              field: 'e_cultural_creators',
              title: 'e_cultural_creators'
            },
            {
              field: 'e_professinoals',
              title: 'e_professinoals'
            },
            {
              field: 'e_veterans',
              title: 'e_veterans'
            },
            {
              field: 'youthful_urban_fringe',
              title: 'youthful_urban_fringe'
            },
            {
              field: 'e_rational_utilitarians',
              title: 'e_rational_utilitarians'
            },
            {
              field: 'e_mainstream',
              title: 'e_mainstream'
            },
            {
              field: 'passive_and_uncommitted_users',
              title: 'passive_and_uncommitted_users'
            },
            {
              field: 'digital_seniors',
              title: 'digital_seniors'
            },
            {
              field: 'settled_offline_communities',
              title: 'settled_offline_communities'
            },
            {
              field: 'e_withdrawn',
              title: 'e_withdrawn'
            }
          ]
        })

        entry.listview.appendChild(_xyz.locations.view.dataview(entry))

        entry.setData(data)

        const Min8 = data.find(record=>record.drivetime === '8 Minutes')

        const Min10 = data.find(record=>record.drivetime === '10 Minutes')

        const Min15 = data.find(record=>record.drivetime === '15 Minutes')

        const UK = data.find(record=>record.drivetime === 'UK')
  
        const affluence_chart = {
          location: entry.location,
          "target": "location",
          "chart": {
            "height": "250px",
            "options": {
              "plugins": {
                "legend": {
                  "display": true,
                  "position": "bottom"
                }
              },
              "scales": {
                "left": {
                  "position": "left",
                  "title": {
                    "display": false
                  },
                  "ticks": {
                    "beginAtZero": true,
                    "stepSize": 5
                  }
                }
              }
            }
          },
          data: {
            "datasets": [{
                "label": Min8.drivetime,
                "type": "line",
                "pointRadius": 0,
                "borderColor": "#4a148c",
                "fill": false,
                "data": [
                  Min8.affluence_index_1,
                  Min8.affluence_index_2,
                  Min8.affluence_index_3,
                  Min8.affluence_index_4,
                  Min8.affluence_index_5,
                  Min8.affluence_index_6,
                  Min8.affluence_index_7,
                  Min8.affluence_index_8
                ]
              },
              {
                "label": Min10.drivetime,
                "type": "line",
                "pointRadius": 0,
                "borderColor": "#0d47a1",
                "fill": false,
                "data": [
                  Min10.affluence_index_1,
                  Min10.affluence_index_2,
                  Min10.affluence_index_3,
                  Min10.affluence_index_4,
                  Min10.affluence_index_5,
                  Min10.affluence_index_6,
                  Min10.affluence_index_7,
                  Min10.affluence_index_8
                ]
              },
              {
                "label": Min15.drivetime,
                "type": "line",
                "pointRadius": 0,
                "borderColor": "#00acc1",
                "fill": false,
                "data": [
                  Min15.affluence_index_1,
                  Min15.affluence_index_2,
                  Min15.affluence_index_3,
                  Min15.affluence_index_4,
                  Min15.affluence_index_5,
                  Min15.affluence_index_6,
                  Min15.affluence_index_7,
                  Min15.affluence_index_8
                ]
              },
              {
                "label": UK.drivetime,
                "type": "bar",
                "yAxisID": "left",
                "backgroundColor": "#ccc",
                "data": [
                  UK.affluence_index_1,
                  UK.affluence_index_2,
                  UK.affluence_index_3,
                  UK.affluence_index_4,
                  UK.affluence_index_5,
                  UK.affluence_index_6,
                  UK.affluence_index_7,
                  UK.affluence_index_8
                ]
              }
            ],
            "labels": [
              "1",
              "2",
              "3",
              "4",
              "5",
              "6",
              "7",
              "8"
            ]
          }
        }
  
        entry.listview.appendChild(_xyz.locations.view.dataview(affluence_chart))

        const life_stage_chart = {
          location: entry.location,
          "target": "location",
          "chart": {
            "height": "250px",
            "options": {
              "plugins": {
                "legend": {
                  "display": true,
                  "position": "bottom"
                }
              },
              "scales": {
                "left": {
                  "position": "left",
                  "title": {
                    "display": false
                  },
                  "ticks": {
                    "beginAtZero": true,
                    "stepSize": 5
                  }
                }
              }
            }
          },
          data: {
            "datasets": [{
                "label": Min8.drivetime,
                "type": "line",
                "pointRadius": 0,
                "borderColor": "#4a148c",
                "fill": false,
                "data": [
                  Min8.life_stage_index_1,
                  Min8.life_stage_index_2,
                  Min8.life_stage_index_3,
                  Min8.life_stage_index_4,
                  Min8.life_stage_index_5,
                  Min8.life_stage_index_6,
                  Min8.life_stage_index_7,
                  Min8.life_stage_index_8
                ]
              },
              {
                "label": Min10.drivetime,
                "type": "line",
                "pointRadius": 0,
                "borderColor": "#0d47a1",
                "fill": false,
                "data": [
                  Min10.life_stage_index_1,
                  Min10.life_stage_index_2,
                  Min10.life_stage_index_3,
                  Min10.life_stage_index_4,
                  Min10.life_stage_index_5,
                  Min10.life_stage_index_6,
                  Min10.life_stage_index_7,
                  Min10.life_stage_index_8
                ]
              },
              {
                "label": Min15.drivetime,
                "type": "line",
                "pointRadius": 0,
                "borderColor": "#00acc1",
                "fill": false,
                "data": [
                  Min15.life_stage_index_1,
                  Min15.life_stage_index_2,
                  Min15.life_stage_index_3,
                  Min15.life_stage_index_4,
                  Min15.life_stage_index_5,
                  Min15.life_stage_index_6,
                  Min15.life_stage_index_7,
                  Min15.life_stage_index_8
                ]
              },
              {
                "label": UK.drivetime,
                "type": "bar",
                "yAxisID": "left",
                "backgroundColor": "#ccc",
                "data": [
                  UK.life_stage_index_1,
                  UK.life_stage_index_2,
                  UK.life_stage_index_3,
                  UK.life_stage_index_4,
                  UK.life_stage_index_5,
                  UK.liufestage_index_6,
                  UK.life_stage_index_7,
                  UK.life_stage_index_8
                ]
              }
            ],
            "labels": [
              "1",
              "2",
              "3",
              "4",
              "5",
              "6",
              "7",
              "8"
            ]
          }
        }
  
        entry.listview.appendChild(_xyz.locations.view.dataview(life_stage_chart))


      })

    }
  }
}))