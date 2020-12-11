document.dispatchEvent(new CustomEvent('blueprint_demog_ethnicity', {
  detail: _xyz => {

    _xyz.locations.plugins.blueprint_demog_ethnicity = entry => {

      // Object assign params for tab and dataview.
      Object.assign(entry, {
        tab_style: `border-bottom: 2px solid ${entry.location.style.strokeColor}`,
        type: 'dataview',
        title: 'Ethnicity',
        class: 'label',
        layout: 'fitColumns',
        query: 'blueprint_demog_ethnicity',
        queryparams: {

          // Get scenario_id from entry location field value.
          scenario_id: entry.location.infoj.find(e => e.field === 'scenario_id').value

        },
        columns: [
          {
            field: 'band',
            title: 'Band',
            hozAlign: 'left'
          },
          {
            title: 'White',
            field: 'white',
            formatter: 'money',
            formatterParams: {
              precision: 3
            }
          },
          {
            title: 'Non-white',
            field: 'nonwhite',
            formatter: 'money',
            formatterParams: {
              precision: 3
            }
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