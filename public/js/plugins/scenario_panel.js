document.dispatchEvent(new CustomEvent('scenario_panel', {
  detail: _xyz => {

    _xyz.layers.plugins.scenario_panel = async layer => {

      let ping

      const scenarios = await _xyz.query({
        query: 'scenario_list'
      })

      layer.filter.current.scenario_id = {
        match: scenarios[0].scenario_id
      }

      layer.reload()

      const panel = layer.view.insertBefore(_xyz.utils.html.node`
        <div style="padding-right: 5px; margin-bottom: 5px;">`,
        layer.view.querySelector('.drawer'))

      panel.appendChild(_xyz.utils.html.node`
        <button class="btn-drop">
          <div
            class="head"
            onclick=${e => {
              e.preventDefault();
              e.target.parentElement.classList.toggle('active');
            }}>
            <span>${scenarios[0].scenario}</span>
            <div class="icon"></div>
          </div>
          <ul>${scenarios.map(scenario => _xyz.utils.html.node`
            <li onclick=${e => {

              const drop = e.target.closest('.btn-drop')
              drop.classList.toggle('active')

              drop.querySelector('span').textContent = scenario.scenario

              layer.filter.current.scenario_id.match = scenario.scenario_id

              layer.reload()

              load_scenario(scenario.scenario_id)
             
            }}>${scenario.scenario}`)}`)



      const scenario_grid = panel.appendChild(_xyz.utils.html.node`
        <div style="display:grid">`)


      load_scenario(scenarios[0].scenario_id)

      async function load_scenario(scenario_id) {

        scenario_grid.innerHTML = ''

        const scenario = await _xyz.query({
          query: 'scenario_details',
          queryparams: {
            scenario_id: scenario_id
          }
        })

        if (scenario.status === 'running') ping = setTimeout(pingScenario, 10000)

        Object.entries(scenario).forEach(entry => {

          scenario_grid.appendChild(_xyz.utils.html.node`
            <div style="grid-column: 1">${entry[0]}`)

          scenario_grid.appendChild(_xyz.utils.html.node`
            <div style="grid-column: 2">${entry[1]}`)
        
        })

        const btn = scenario_grid.appendChild(_xyz.utils.html.node`
          <button
            .disabled=${scenario.status === 'running'}
            class="btn-wide primary-colour"
            style="grid-column: 2"
            onclick=${runScenario}>Make it so`)

        async function runScenario() {

          btn.disabled = true

          await _xyz.query({
            query: 'scenario_set_running',
            queryparams: {
              scenario_id: scenario_id
            }
          })

          const test = await _xyz.query({
            query: 'scenario_run',
            queryparams: {
              scenario_id: scenario_id
            }
          })

          console.log(test)

          load_scenario(scenario_id)

        }

        async function pingScenario() {

          const test = await _xyz.query({
            query: 'scenario_ping',
            queryparams: {
              scenario_id: scenario_id
            }
          })

          console.log(test)

          if (test.status === 'running') {

            return setTimeout(pingScenario, 10000)
          }

          if (test.status === 'Complete') {

            alert('Scenario Complete')

            return load_scenario(scenario_id)
          }

        }

      }


    }

  }
}))