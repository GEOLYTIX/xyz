document.dispatchEvent(new CustomEvent('blueprint_nearest_branch', {
  detail: _xyz => {

    _xyz.locations.plugins.blueprint_nearest_branch = entry => {

      // Object assign params for tab and dataview.
      Object.assign(entry, {
        tab_style: `border-bottom: 2px solid ${entry.location.style.strokeColor}`,
        type: 'dataview',
        title: 'Nearest Branch',
        class: 'label',
        layout: 'fitColumns',
        query: 'blueprint_nearest_branch',
        queryparams: {

          // Get scenario_id from entry location field value.
          scenario_id: entry.location.infoj.find(e => e.field === 'scenario_id').value

        },
        columns: [
          {
            title: 'FAD',
            field: 'fad',
            hozAlign: 'left'
          },
          {
            title: 'Branch',
            field: 'branch_name'
          },
          {
            title: 'Address',
            field: 'address1'
          },
          {
            title: 'Location',
            field: 'address4'
          },
          {
            title: 'Postcode',
            field: 'postcode'
          },
          {
            title: 'Type',
            field: 'type'
          },
          {
            title: 'Status',
            field: 'open_status'
          },
          {
            title: 'Distance',
            field: 'distance_mile',
            formatter: 'money',
            formatterParams: {
              precision: 2
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