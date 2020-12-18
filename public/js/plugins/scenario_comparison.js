document.dispatchEvent(new CustomEvent('scenario_comparison', {
  detail: _xyz => {

    _xyz.layers.plugins.scenario_comparison = async layer => {

      const scenarios = await _xyz.query({
        query: 'scenario_list'
      })

      layer.filter.current.scenario_id = {
        eq: scenarios[0].scenario_id
      }

      layer.reload()

      layer.view.insertBefore(_xyz.utils.html.node`
        <div style="padding-right: 5px; margin-bottom: 5px;">
        <button class="btn-drop">
          <div
            class="head"
            onclick=${e => {
              e.preventDefault();
              e.target.parentElement.classList.toggle('active');
            }}>
            <span>${scenarios[0].scenario_name}</span>
            <div class="icon"></div>
          </div>
          <ul>${scenarios.map(scenario => _xyz.utils.html.node`
            <li onclick=${e => {

              const drop = e.target.closest('.btn-drop')
              drop.classList.toggle('active')

              drop.querySelector('span').textContent = scenario.scenario_name

              layer.filter.current.scenario_id.eq = scenario.scenario_id

              layer.reload()
              
              tableUpdate()
             
            }}>${scenario.scenario_name}`)}`,
        layer.view.querySelector('.drawer'))


      if (layer.key === 'ying') return

      const bounds = _xyz.map && _xyz.mapview.getBounds(4326)

      const table = {
        query: 'scenario_comparison_table',
        queryparams: {
          ying: layer.filter.current.scenario_id.eq,
          yang: _xyz.layers.list.yang.filter.current.scenario_id.eq,
          xmin: bounds.west,
          ymin: bounds.south,
          xmax: bounds.east,
          ymax: bounds.north
        },
        viewport: true,
        display: true,
        title: 'Comparison Table',
        layer: layer,
        columns: [
          {
            "field": "FAD",
            "title": "FAD"
          },
          {
            "field": "Name",
            "title": "Name"
          },
          {
            "field": "Pre Forecast AWS",
            "title": "Pre Forecast AWS",
            "hozAlign": "right",
            "formatter": "money",
            "formatterParams": {
              "precision": 3
            }
          },
          {
            "field": "Post Forecast AWS",
            "title": "Post Forecast AWS",
            "hozAlign": "right",
            "formatter": "money",
            "formatterParams": {
              "precision": 3
            }
          },
          {
            "field": "Change",
            "title": "Change",
            "hozAlign": "right",
            "formatter": "money",
            "formatterParams": {
              "precision": 3
            }
          }
        ]
      }

      _xyz.tabview.add(table)

      _xyz.dataviews.create(table)

      table.show()

      _xyz.mapview.node.addEventListener('changeEnd', ()=>{

        if (!table.tab.classList.contains('active')) return;

        if (_xyz.map.getView().getZoom() < 12) return;

        tableUpdate()
      })

      function tableUpdate() {

        const bounds = _xyz.mapview.getBounds(4326)

        table.queryparams.xmin = bounds.west
        table.queryparams.ymin = bounds.south
        table.queryparams.xmax = bounds.east
        table.queryparams.ymax = bounds.north
  
        table.update()
      }

    }

  }
}))