document.dispatchEvent(new CustomEvent('comparison_tab', {
  detail: _xyz => {

    _xyz.layers.plugins.comparison_tab = layer => {

      const labels = [
        'ID',
        'Location',
        'Population 2020',
        'Population 2021',
        'Population 2022',
        'Population 2023',
        'Population 2024',
        'Population 2025',
        'White %',
        'Car Ownership %',
        'House %',
        'Flats %',
        'Own Home %',
        'Social Rented %',
        'Private Rented %',
        'Social Grade AB %',
        'Social Grade C1 %',
        'Social Grade C2 %',
        'Social Grade DE %',
        'Students %',
        'OAC - Rural residents',
        'OAC - Cosmopolitans',
        'OAC - Ethnicity central',
        'OAC - Multicultural metropolitans',
        'OAC - Urbanites',
        'OAC - Suburbanites',
        'OAC - Constrained city dwellers',
        'OAC - Hard-pressed living',
        'Age 0 - 18 %',
        'Age 18 -24 %',
        'Age 25 - 44 %',
        'Age 45 - 59 %',
        'Age 60+ %',
        'e-Cultural Creators',
        'e-Professionals',
        'e-Veterans',
        'Youthful Urban Fringe',
        'e-Rational Utilitarians',
        'e-Mainstream',
        'Passive and Uncommitted Users',
        'Digital Seniors',
        'Settled Offline Communities',
        'e-Withdrawn'
      ]

      const target = _xyz.utils.html.node`
      <div
        style="
          display:grid;
          grid-template-columns: 240px repeat( auto-fit, minmax(0, 1fr) );
          padding: 20px;">${labels.map((label, i) => _xyz.utils.html`
            <div
              style="${`
                grid-column:1;
                grid-row:${i+1};
                font-weight: bold;
                padding-right: 10px;
                border-bottom: 1px solid #ddd`}">${label}`)}`

      layer.comparison_tab = {
        title: 'Comparison',
        display: true,
        target: target,
        layer: layer,
        columns: 1
      }

      _xyz.tabview.add(layer.comparison_tab)

      layer.display && layer.comparison_tab.show()

    }

  }
}))