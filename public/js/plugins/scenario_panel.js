document.dispatchEvent(new CustomEvent('scenario_panel', {
  detail: _xyz => {

    _xyz.layers.plugins.scenario_panel = async layer => {

      _xyz.layers.list.scenario_region.show()
      _xyz.layers.list.scenario_seeds.show()

      const scenarios = {}

      scenarios.panel = layer.view.insertBefore(_xyz.utils.html.node`
        <div style="padding-right: 5px; margin-bottom: 5px;">`,
        layer.view.querySelector('.drawer'))

      scenarios.demands = await _xyz.query({
        query: 'demand_list'
      })

      scenarios.fields = {
        scenario_id: value => scenarios.grid.appendChild(_xyz.utils.html.node`
          <div style="grid-column: 1">ID</div>
          <div style="grid-column: 2">${value}`),
        scenario_name: value => scenarios.grid.appendChild(_xyz.utils.html.node`
          <div style="grid-column: 1">Name</div>
          <div style="grid-column: 2">
            <input type="text"
              oninput=${e => onInput(e, 'scenario_name')} value=${value}>`),
        cap_main: value => scenarios.grid.appendChild(_xyz.utils.html.node`
          <div style="grid-column: 1">Cap (Plus)</div>
          <div style="grid-column: 2">
            <input type="number"
              oninput=${e => onInput(e, 'cap_main')} value=${value}>`),
        cap_local: value => scenarios.grid.appendChild(_xyz.utils.html.node`
          <div style="grid-column: 1">Cap (Light Touch)</div>
          <div style="grid-column: 2">
            <input type="number"
              oninput=${e => onInput(e, 'cap_local')} value=${value}>`),
        collar_main: value => scenarios.grid.appendChild(_xyz.utils.html.node`
          <div style="grid-column: 1">Collar(Plus)</div>
          <div style="grid-column: 2">
            <input type="number" 
              oninput=${e => onInput(e, 'collar_main')} value=${value}>`),
        collar_local: value => scenarios.grid.appendChild(_xyz.utils.html.node`
          <div style="grid-column: 1">Collar (Light Touch)</div>
          <div style="grid-column: 2">
            <input type="number"
              oninput=${e => onInput(e, 'collar_local')} value=${value}>`),
        created_by: value => scenarios.grid.appendChild(_xyz.utils.html.node`
          <div style="grid-column: 1">Created by</div>
          <div style="grid-column: 2">${value}`),
        created_datetime: value => scenarios.grid.appendChild(_xyz.utils.html.node`
          <div style="grid-column: 1">Created on</div>
          <div style="grid-column: 2">${value}`),
        run_datetime: value => scenarios.grid.appendChild(_xyz.utils.html.node`
          <div style="grid-column: 1">Last run</div>
          <div style="grid-column: 2">${value}`),
        status: value => scenarios.grid.appendChild(_xyz.utils.html.node`
          <div style="grid-column: 1">Status</div>
          <div style="grid-column: 2">${value}`),
        national_flag: async value => {
          
          scenarios.grid.appendChild(_xyz.utils.html.node`
            <label style="grid-column: 1/3" class="input-checkbox">
              <input
                type="checkbox"
                .checked=${value === 1}
                onchange=${e => {
                  scenarios.btn.textContent = 'Update'
                  scenarios.update.national_flag = e.target.checked && 1 || 0

                  drawButton.style.display =  e.target.checked && 'none' || 'block'
                }}>
              </input>
              <div></div>
              <span>National Extent`)

          const drawButton = scenarios.grid.appendChild(_xyz.utils.html.node`
            <button
              style="${`grid-column: 1/3; ${value === 1 && 'display: none;' ||''}`}"
              class="btn-wide primary-colour"
              onclick=${e => {
            
                e.stopPropagation()
                       
                if (drawButton.classList.contains('active')) return _xyz.mapview.interaction.draw.cancel()
            
                drawButton.classList.add('active')
            
                _xyz.mapview.interaction.draw.begin({
                  layer: _xyz.layers.list.scenario_region,
                  type: 'Polygon',
                  geometryFunction: _xyz.mapview.interaction.draw.polygonKinks,
                  callback: () => {
                    drawButton.classList.remove('active')
                  },
                  select_callback: async glid => {

                    await _xyz.query({
                      query: 'scenario_region_set',
                      queryparams: {
                        scenario_id: scenarios.current.scenario_id,
                        glid: glid
                      }
                    })

                    _xyz.layers.list.scenario_region.reload()

                  }
                })
            
              }}>Draw region`)

          scenarios.grid.appendChild(_xyz.utils.html.node`
            <div style="grid-column: 1">Seed Points`)

          const seedCount = scenarios.grid.appendChild(_xyz.utils.html.node`
            <div style="grid-column: 2">`)

          _xyz.query({
            query: 'count_locations',
            layer: _xyz.layers.list.scenario_seeds,
            queryparams: {
              table: 'ui.pol_scenario_pre_seed'
            }
          }).then(response => seedCount.textContent = parseInt(response.count) || 'All')

          const input = scenarios.grid.appendChild(_xyz.utils.html.node`
            <input
              type="file"
              accept=".csv"
              onchange=${seedImport}
              style="display: none;">`)

          scenarios.grid.appendChild(_xyz.utils.html.node`
            <button
              style="grid-column: 1/3"
              class="btn-wide primary-colour"
              onclick=${e => {
                e.stopPropagation()
                input.click()
            }}>CSV Import`)        

        },
        demandid: value => scenarios.grid.appendChild(_xyz.utils.html.node`
          <div style="grid-column: 1">Demand</div>
          <div style="grid-column: 2">
            <button class="btn-drop">
              <div
                class="head"
                onclick=${e => {
                  e.preventDefault();
                  e.target.parentElement.classList.toggle('active');
                }}>
                <span>${scenarios.demands.find(d => d.demandid === value).name}</span>
                <div class="icon"></div>
              </div>
              <ul>${scenarios.demands.map(d => _xyz.utils.html.node`
                <li onclick=${e => {

                  const drop = e.target.closest('.btn-drop')
                  drop.classList.toggle('active')

                  drop.querySelector('span').textContent = d.name
                  drop.querySelector('span').style.color = '#090'

                  scenarios.btn.textContent = 'Update'

                  scenarios.update.demandid = d.demandid
                
                }}>${d.name}`)}`),
      }

      loadPanel()

      async function loadPanel() {

        scenarios.panel.innerHTML = ''

        scenarios.list = await _xyz.query({
          query: 'scenario_list'
        })
  
        scenarios.list.push({
          scenario_name: 'New'
        })

        scenarios.current = scenarios.current || scenarios.list[0]

        layer.filter.current.scenario_id = {
          eq: scenarios.current.scenario_id
        }
  
        layer.reload()
  
        scenarios.panel.appendChild(_xyz.utils.html.node`
          <button class="btn-drop">
            <div
              class="head"
              onclick=${e => {
                e.preventDefault();
                e.target.parentElement.classList.toggle('active');
              }}>
              <span>${scenarios.current.scenario_name}</span>
              <div class="icon"></div>
            </div>
            <ul>${scenarios.list.map(scenario => _xyz.utils.html.node`
              <li onclick=${e => {
  
                const drop = e.target.closest('.btn-drop')
                drop.classList.toggle('active')
  
                drop.querySelector('span').textContent = scenario.scenario_name
  
                layer.filter.current.scenario_id.eq = scenario.scenario_id || 0
  
                layer.reload()

                scenarios.current = scenario
  
                loadScenario()
               
              }}>${scenario.scenario_name}`)}`)

        scenarios.grid = scenarios.panel.appendChild(_xyz.utils.html.node`
          <div style="margin-top: 5px; display:grid; grid-gap: 5px; align-items: center;">`)              

        loadScenario()
      }

      async function loadScenario() {

        scenarios.grid.innerHTML = ''

        if (scenarios.current.scenario_id) {

          Object.assign(scenarios.current, await _xyz.query({
            query: 'scenario_details',
            queryparams: {
              scenario_id: scenarios.current.scenario_id
            }
          }))

        } else {

          Object.assign(scenarios.current, {
            scenario_name: 'New Scenario',
            status: 'New'
          })
        }

        _xyz.layers.list.scenario_region.filter.current.scenario_id.eq = scenarios.current.scenario_id || -1
        _xyz.layers.list.scenario_region.reload()
        _xyz.layers.list.scenario_seeds.filter.current.scenario_id.eq = scenarios.current.scenario_id || -1
        _xyz.layers.list.scenario_seeds.reload()

        scenarios.update = {
          scenario_id: scenarios.current.scenario_id,
          scenario_name: scenarios.current.scenario_name,
          status: scenarios.current.status,
          cap_main: 'cap_main',
          collar_main: 'collar_main',
          cap_local: 'cap_local',
          collar_local: 'collar_local',
          demandid: 'demandid',
          national_flag: 'national_flag'
        }

        Object.entries(scenarios.current).forEach(entry => {

          scenarios.fields[entry[0]] && scenarios.fields[entry[0]](entry[1])

        })

        if (scenarios.current.status === 'running') setTimeout(pingScenario, 10000)

        scenarios.btn = scenarios.grid.appendChild(_xyz.utils.html.node`
          <button
            .disabled=${scenarios.current.status === 'running'}
            class="btn-wide primary-colour"
            style="grid-column: 1/3"
            onclick=${runScenario}>${scenarios.current.scenario_id && 'Make it so' || 'Create'}`)

      }

      async function createScenario() {

        scenarios.btn.disabled = true

        const response = await _xyz.query({
          query: 'scenario_create',
          queryparams: Object.assign({
            created_by: _xyz.user.email
          }, scenarios.update)
        })

        scenarios.current = scenarios.update
        scenarios.current.scenario_id = response.scenario_id

        loadPanel()
      }

      function onInput(e, param) {
        e.target.style.color = '#090'
        scenarios.update[param] = e.target.value
        if (scenarios.current.scenario_id) scenarios.btn.textContent = 'Update'
      }

      async function updateScenario() {

        scenarios.btn.disabled = true

        scenarios.update.status = 'Updated'

        await _xyz.query({
          query: 'scenario_update',
          queryparams: scenarios.update
        })

        scenarios.current.scenario_name = scenarios.update.scenario_name

        loadPanel()
      }

      async function runScenario() {

        if (!scenarios.current.scenario_id) return createScenario()

        if (scenarios.btn.textContent === 'Update') return updateScenario()

        if (!scenarios.current.national_flag) {

          const response = await _xyz.query({
            query: 'count_locations',
            layer: _xyz.layers.list.scenario_region,
            queryparams: {
              table: 'model.pol_local_region'
            }
          })

          if (!parseInt(response.count)) return alert('Unable to run regional model without regions.')

        }

        if (!window.confirm('Would like to run the scenario with the current settings. Running a scenario may take up to 30 minutes.')) return

        scenarios.btn.disabled = true

        scenarios.update.status = 'running'

        await _xyz.query({
          query: 'scenario_update',
          queryparams: scenarios.update
        })

        await _xyz.query({
          query: 'scenario_run',
          queryparams: {
            scenario_id: scenarios.current.scenario_id
          }
        })

        loadScenario()
      }

      async function pingScenario() {

        const response = await _xyz.query({
          query: 'scenario_ping',
          queryparams: {
            scenario_id: scenarios.current.scenario_id
          }
        })

        console.log(response)

        if (response.status === 'running') {

          return setTimeout(pingScenario, 10000)
        }

        if (response.status === 'Complete') {

          alert('Scenario Complete')

          return loadScenario()
        }

      }

      function seedImport(){

        const reader = new FileReader()

        reader.onload = async function() {
          try {

            // Split on new line to create array of rows.
            const csv = this.result.split(/\r?\n/)

            // Shift header row from array.
            csv.shift()

            const seeds = csv
              .filter(row => !!row.length)
              .map(row => `(${scenarios.current.scenario_id},${row.replace(/"/g, '\'')})`)
              //.join(',')

            await _xyz.query({
              query: 'scenario_seed_remove',
              queryparams: {
                scenario_id: scenarios.current.scenario_id
              }
            })

            const xhr = new XMLHttpRequest()

            xhr.open('POST', `${_xyz.host}/api/query/scenario_seed_insert`)
  
            xhr.setRequestHeader('Content-Type', 'application/json')
  
            xhr.responseType = 'json'
  
            xhr.onload = e => {

              loadScenario()
          
            }
          
            xhr.send(JSON.stringify(seeds))

          } catch (err) {
            console.error(err)
          }
        }

        reader.readAsText(this.files[0])
      }

    }

  }
}))