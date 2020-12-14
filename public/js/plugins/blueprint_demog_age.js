document.dispatchEvent(new CustomEvent('blueprint_demog_age', {
  detail: _xyz => {

    _xyz.locations.plugins.blueprint_demog_age = entry => {

      // Object assign params for tab and dataview.
      Object.assign(entry, {
        tab_style: `border-bottom: 2px solid ${entry.location.style.strokeColor}`,
        type: 'dataview',
        title: 'Age',
        class: 'label',
        layout: 'fitColumns',
        query: 'blueprint_demog_age',
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
            title: 'Age <18',
            field: 'age0to18',
            formatter: 'money',
            formatterParams: {
              precision: 3
            }
          },
          {
            title: 'Age 18 to 24',
            field: 'age18to24',
            formatter: 'money',
            formatterParams: {
              precision: 3
            }
          },
          {
            title: 'Age 25 to 44',
            field: 'age25to44',
            formatter: 'money',
            formatterParams: {
              precision: 3
            }
          },
          {
            title: 'Age 45 to 59',
            field: 'age45to59',
            formatter: 'money',
            formatterParams: {
              precision: 3
            }
          },
          {
            title: 'Age 60+',
            field: 'age60plus',
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