document.dispatchEvent(new CustomEvent('filter_scenario', {
  detail: _xyz => {

    _xyz.layers.plugins.filter_scenario = async layer => {

      const scenarios = await _xyz.query({
        query: 'scenario_list'
      })

      layer.filter.current.scenario_id = {
        match: scenarios[0].scenario_id
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
             
            }}>${scenario.scenario}`)}`
        , layer.view.querySelector('.drawer'))

    }

  }
}))