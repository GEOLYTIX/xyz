document.dispatchEvent(new CustomEvent('stores_drivetimes', {
  detail: _xyz => {

    _xyz.locations.plugins.stores_drivetimes = entry => {

      if (!entry.location.infoj.find(e => e.field === 'geom_8_min').value) return

      if (!entry.location.infoj.find(e => e.field === 'geom_10_min').value) return

      if (!entry.location.infoj.find(e => e.field === 'geom_15_min').value) return

      Object.assign(entry, {
        title: 'Stores Drivetimes',
        display: true,
        query: 'stores_drivetimes',
        columns: [{
            field: 'metric',
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


      const test = {
        "datasets": [{
            "label": "8min",
            "type": "line",
            "borderColor": "#4a148c",
            "fill": false,
            "data": [
              0,
              0.0015,
              0.0030,
              0.0344,
              0.3515,
              0.5446,
              0.0651
            ]
          },
          {
            "label": "10min",
            "type": "line",
            "borderColor": "#0d47a1",
            "fill": false,
            "data": [
              0,
              0.001,
              0.002,
              0.0377,
              0.3571,
              0.5012,
              0.1010
            ]
          },
          {
            "label": "15min",
            "type": "line",
            "borderColor": "#00acc1",
            "fill": false,
            "data": [
              0,
              0.0049,
              0.0167,
              0.0421,
              0.3592,
              0.4788,
              0.0983
            ]
          },
          {
            "label": "UK",
            "type": "bar",
            "yAxisID": "left",
            "backgroundColor": "#ccc",
            "data": [
              0.0949,
              0.1828,
              0.1786,
              0.2009,
              0.1628,
              0.1142,
              0.0514,
              0.0145
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

      const entry_chart = {
        location: entry.location,
        "target": "location",
        //"query": "site_age_profile",
        "chart": {
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
        data: test
      }

      entry.listview.appendChild(_xyz.locations.view.dataview(entry_chart))

    }
  }
}))