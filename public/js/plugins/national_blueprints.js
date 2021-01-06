document.dispatchEvent(new CustomEvent('national_blueprints', {
  detail: _xyz => {

    _xyz.layers.plugins.national_blueprints = async layer => {
     
      const scenarios = [{
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

      layer.view.insertBefore(
        _xyz.utils.html.node`
          <div style="padding: 5px">
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

                  layer.filter.current.scenario_id.eq = scenario.scenario_id || 0

                  layer.reload()
                
                }}>${scenario.scenario_name}`)}`,
        layer.view.querySelector('.drawer'))

    }

  }
}))