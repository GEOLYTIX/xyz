document.dispatchEvent(new CustomEvent('add_region', {
  detail: _xyz => {

    _xyz.locations.plugins.add_region = entry => {

      entry.listview.appendChild(_xyz.utils.html.node`
        <button
          style="grid-column: 1/3;"
          class="btn-wide primary-colour"
          onclick=${addRegion}
        >Add Region to current Scenario`)

      async function addRegion() {

        await _xyz.query({
          query: 'scenario_region_copy',
          location: entry.location,
          queryparams: {
            layer_key: entry.location.layer.key,
            table: entry.location.layer.table,
            geom: entry.location.layer.geom,
            qID: entry.location.layer.qID,
            scenario_id: _xyz.layers.list.scenario_region.filter.current.scenario_id.eq
          }
        })

        _xyz.layers.list.scenario_region.reload()
      }

    }

  }
}))