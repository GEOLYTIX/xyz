document.dispatchEvent(new CustomEvent('scenario_comparison', {
  detail: _xyz => {

    _xyz.layers.plugins.scenario_comparison = async layer => {

      // Make the layer view panel expandable if it contains children.
      layer.view.classList.add('expandable')

      const header = layer.view.querySelector('.header')

      // Expander control for layer drawer.
      header.onclick = e => {
        e.stopPropagation()
        _xyz.utils.toggleExpanderParent(e.target, true)
      }

      // Add the expander toggle to the layer view header.
      header.appendChild(_xyz.utils.html.node`
      <button
        title=${_xyz.language.layer_toggle_dashboard}
        class="btn-header xyz-icon icon-expander"
        onclick=${e=>{
          e.stopPropagation()
          _xyz.utils.toggleExpanderParent(e.target)
        }}>`)

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
              "precision": 0
            }
          },
          {
            "field": "Post Forecast AWS",
            "title": "Post Forecast AWS",
            "hozAlign": "right",
            "formatter": "money",
            "formatterParams": {
              "precision": 0
            }
          },
          {
            "field": "Change",
            "title": "Change",
            "hozAlign": "right",
            "plugin": "create_percentage"
          }
        ]
      }

      _xyz.tabview.add(table)

      _xyz.dataviews.create(table)

      layer.view.addEventListener('display-off', () => {

        _xyz.layers.list.ying.remove()
        table.remove()

      })

      layer.view.addEventListener('display-on', () => {

        _xyz.layers.list.ying.show()
        if (layer.filter.current.scenario_id.eq === _xyz.layers.list.ying.filter.current.scenario_id.eq) return;
        table.show()

      })

      const scenarios = await _xyz.query({
        query: 'scenario_list'
      })

      const expander = layer.view.appendChild(_xyz.utils.html.node`<div>`)

      const panel = expander.appendChild(_xyz.utils.html.node`
      <div style="padding-right: 5px; grid-gap: 5px; display: grid;">`)

      layerControls(_xyz.layers.list.ying)

      panel.appendChild(_xyz.utils.html.node`
      <div style="width: 100%; margin: 5px 0; border-bottom: 1px solid #999;">`)

      layerControls(_xyz.layers.list.yang)

      panel.appendChild(_xyz.utils.html.node`
      <div style="width: 100%; margin: 5px 0; border-bottom: 1px solid #999;">`)

      const reportA = panel.appendChild(_xyz.utils.html.node`
        <a
          title="Open Comparison Report View"
          target="_blank"
          style="font-weight: bold; margin-bottom: 5px; color: #090;">Report View`)

      const reportB = document.getElementById('mapButton').appendChild(_xyz.utils.html.node`
        <a
          title="Open Comparison Report View"
          target="_blank">`)
          
      reportB.appendChild(_xyz.utils.html.node`<div class="xyz-icon icon-wysiwyg">`)


      function layerControls(_layer) {

        const _scenarios = _layer.key === 'ying' && scenarios || [{
            "scenario_id": 1,
            "scenario_name": "National v25"
          },
          {
            "scenario_id": 2,
            "scenario_name": "v25 Dense"
          },
          {
            "scenario_id": 4,
            "scenario_name": "V25 Covid"
          },
          {
            "scenario_id": 5,
            "scenario_name": "V25 Covid Dense"
          }
        ]

        panel.appendChild(_xyz.utils.html.node`
          <button class="btn-drop">
            <div
              class="head"
              onclick=${e => {
                e.preventDefault();
                e.target.parentElement.classList.toggle('active');
              }}>
              <span>${_scenarios[0].scenario_name}</span>
              <div class="icon"></div>
            </div>
            <ul>${_scenarios.map(scenario => _xyz.utils.html.node`
              <li onclick=${e => {

                const drop = e.target.closest('.btn-drop')
                drop.classList.toggle('active')

                drop.querySelector('span').textContent = scenario.scenario_name

                _layer.filter.current.scenario_id.eq = scenario.scenario_id

                _layer.reload()

                const href = _xyz.host + '/view/report?' + _xyz.utils.paramString(
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

                reportA.href = href
                reportB.href = href

                table.queryparams.ying = _xyz.layers.list.ying.filter.current.scenario_id.eq
                table.queryparams.yang = _xyz.layers.list.yang.filter.current.scenario_id.eq

                if (layer.filter.current.scenario_id.eq === _xyz.layers.list.ying.filter.current.scenario_id.eq) {
                  table.remove()
                  return;
                }
                table.show()

                //tableUpdate()
              
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


      _xyz.mapview.node.addEventListener('changeEnd', ()=>{

        const href = _xyz.host + '/view/report?' + _xyz.utils.paramString(
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

        reportA.href = href
        reportB.href = href

        tableUpdate()
      })

      function tableUpdate() {

        if (!table.tab.classList.contains('active')) return;

        if (_xyz.map.getView().getZoom() < 12) return;

        if (layer.filter.current.scenario_id.eq === _xyz.layers.list.ying.filter.current.scenario_id.eq) return;

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