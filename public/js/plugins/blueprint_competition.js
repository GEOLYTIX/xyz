document.dispatchEvent(new CustomEvent('blueprint_competition', {
  detail: _xyz => {

    _xyz.locations.plugins.blueprint_competition = entry => {

      // Object assign params for tab and dataview.
      Object.assign(entry, {
        tab_style: `border-bottom: 2px solid ${entry.location.style.strokeColor}`,
        type: 'dataview',
        title: 'Competition',
        class: 'label',
        layout: 'fitColumns',
        query: 'blueprint_competition',
        queryparams: {

          // Get scenario_id from entry location field value.
          scenario_id: entry.location.infoj.find(e => e.field === 'scenario_id').value

        },
        columns: [
          {
            title: 'Brand',
            field: 'brand',
            hozAlign: 'left'
          },
          {
            title: '0.25 mile',
            field: '025 mile'
          },
          {
            title: '0.5 mile',
            field: '05 mile'
          },
          {
            title: '0.75 mile',
            field: '075 mile'
          },
          {
            title: '1 mile',
            field: '1 mile'
          },
          {
            title: '3 mile',
            field: '3 mile'
          }
        ]
      })

      // Create tab for tabview first.
      _xyz.tabview.add(entry)

      // Create the dataview after the tab.
      _xyz.dataviews.create(entry)

      entry.display && entry.show()

      entry.listview.appendChild(_xyz.utils.html.node`
        <label
          class="${`input-checkbox mobile-disabled ${entry.class}`}">
          <input
            type="checkbox"
            .checked=${!!entry.display}
            onchange=${e => {

              entry.display = e.target.checked
              entry.display ?
                entry.show() :
                entry.remove()

            }}></input>
          <div></div>
          <span>${entry.title || 'Dataview'}`)

    }

  }
}))