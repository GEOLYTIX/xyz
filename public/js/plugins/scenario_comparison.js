document.dispatchEvent(new CustomEvent('scenario_comparison', {
  detail: _xyz => {

    _xyz.layers.plugins.scenario_comparison = async layer => {

      layer.view.addEventListener('display-off', () => {

        _xyz.layers.list.ying.remove()

      })

      layer.view.addEventListener('display-on', () => {

        _xyz.layers.list.ying.show()

      })

      const scenarios = await _xyz.query({
        query: 'scenario_list'
      })

      const panel = layer.view.appendChild(_xyz.utils.html.node`
      <div style="padding-right: 5px; grid-gap: 5px; display: grid;">`)

      layerControls(_xyz.layers.list.ying)

      panel.appendChild(_xyz.utils.html.node`
      <div style="width: 100%; margin: 5px 0; border-bottom: 1px solid #999;">`)

      layerControls(_xyz.layers.list.yang)

      panel.appendChild(_xyz.utils.html.node`
      <div style="width: 100%; margin: 5px 0; border-bottom: 1px solid #999;">`)

      const report = panel.appendChild(_xyz.utils.html.node`
      <a
        target="_blank"
        style="font-weight: bold; margin-bottom: 5px; color: #090;">Report View`)


      function layerControls(_layer) {

        panel.appendChild(_xyz.utils.html.node`
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

                _layer.filter.current.scenario_id.eq = scenario.scenario_id

                _layer.reload()

                report.href = _xyz.host + '/view/report?' + _xyz.utils.paramString(
                  Object.assign({
                    locale: _xyz.locale.key,
                    layers: _xyz.hooks.current.layers,
                    lat: _xyz.hooks.current.lat,
                    lng: _xyz.hooks.current.lng,
                    z: _xyz.hooks.current.z,
                    ying: _xyz.layers.list.ying.filter.current.scenario_id.eq,
                    yang: _xyz.layers.list.yang.filter.current.scenario_id.eq
                  })
                )

                tableUpdate()
              
              }}>${scenario.scenario_name}`)}`)

     
        panel.appendChild(_xyz.utils.html.node`
          <button class="btn-drop">
            <div
              class="head"
              onclick=${e => {
                e.preventDefault();
                e.target.parentElement.classList.toggle('active');
              }}>
              <span>${Object.keys(_layer.style.themes)[0]}</span>
              <div class="icon"></div>
            </div>
            <ul>${Object.entries(_layer.style.themes).map(theme => _xyz.utils.html.node`
              <li onclick=${e=>{
                const drop = e.target.closest('.btn-drop')
                drop.querySelector('span').textContent = theme[0]
                drop.classList.toggle('active')
                _layer.style.theme = theme[1]
                _layer.reload()

                _xyz.utils.render(_layer.style._legend, _xyz.layers.view.style.legend(_layer))

                }}>${theme[0]}`)}`)

        _layer.style._legend = panel.appendChild(_xyz.utils.html.node`<div>`)

        _xyz.utils.render(_layer.style._legend, _xyz.layers.view.style.legend(_layer))

      }


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

        report.href = _xyz.host + '/view/report?' + _xyz.utils.paramString(
          Object.assign({
            locale: _xyz.locale.key,
            layers: _xyz.hooks.current.layers,
            lat: _xyz.hooks.current.lat,
            lng: _xyz.hooks.current.lng,
            z: _xyz.hooks.current.z,
            ying: _xyz.layers.list.ying.filter.current.scenario_id.eq,
            yang: _xyz.layers.list.yang.filter.current.scenario_id.eq
          })
        )

        if (!table.tab.classList.contains('active')) return;

        if (_xyz.map.getView().getZoom() < 12) return;

        tableUpdate()
      })

      function tableUpdate() {

        const bounds = _xyz.mapview.getBounds(4326)

        table.queryparams.ying = layer.filter.current.scenario_id.eq
        table.queryparams.yang = _xyz.layers.list.yang.filter.current.scenario_id.eq,
        table.queryparams.xmin = bounds.west
        table.queryparams.ymin = bounds.south
        table.queryparams.xmax = bounds.east
        table.queryparams.ymax = bounds.north
  
        table.update()
      }

    }

  }
}))