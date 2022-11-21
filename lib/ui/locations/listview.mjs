mapp.utils.merge(mapp.dictionaries, {
  en: {
    location_clear_all: "Clear locations",
    location_listview_full: "The listview for locations is full."
  },
  de: {
    location_clear_all: "Entferne Auswahl"
  },
  cn: {
    location_clear_all: "모든 위치 제거",
  },
  pl: {
    location_clear_all: "Wyczyść selekcje",
  },
  ko: {
    location_clear_all: "清除所有地点",
  },
  fr: {
    location_clear_all: "Desélectionner tous les lieux.",
  },
  ja: {
    location_clear_all: "全ロケーションをクリア",
  }
})

export default params => {

  const listview = Object.assign({
    records: [
      {
        symbol: 'A',
        colour: '#2E6F9E'
      },
      {
        symbol: 'B',
        colour: '#EC602D'
      },
      {
        symbol: 'C',
        colour: '#5B8C5A'
      },
      {
        symbol: 'D',
        colour: '#B84444'
      },
      {
        symbol: 'E',
        colour: '#514E7E'
      },
      {
        symbol: 'F',
        colour: '#E7C547'
      },
      {
        symbol: 'G',
        colour: '#368F8B'
      },
      {
        symbol: 'H',
        colour: '#841C47'
      },
      {
        symbol: 'I',
        colour: '#61A2D1'
      },
      {
        symbol: 'J',
        colour: '#37327F'
      }
    ]
  }, params)

  const clearAll = listview.target.appendChild(mapp.utils.html.node`
    <button 
      style="display: none; width: 100%; text-align: right;"
      class="tab-display bold primary-colour text-shadow"
      onclick=${e => {

        // Remove all mapview locations
        Object.values(listview.mapview.locations)
          .forEach(location => location.remove())
      }}>
      ${mapp.dictionary.location_clear_all}`)

  // Create proxy for mapview.locations
  params.mapview.locations = new Proxy(params.mapview.locations, {
    set: function(target, key, location){

      // Find a free record for location.
      const record = listview.records.find(record => !record.hook)

      // No empty record found.
      if (!record) {

        alert(mapp.dictionary.location_listview_full)
        return true;
      }

      // Proxy default.
      Reflect.set(...arguments)

      // Set record hook from location.
      record.hook = location.hook

      // Assign record to the location.
      location.record = record

      // Set style from record.
      location.style = {
        strokeColor: record.colour,
        fillColor: record.colour,
        fillOpacity: 0.1
      };

      // Create OL Style object.
      location.Style = mapp.utils.style([
        {
          strokeColor: "#000",
          strokeOpacity: 0.1,
          strokeWidth: 8,
        },
        {
          strokeColor: "#000",
          strokeOpacity: 0.1,
          strokeWidth: 6,
        },
        {
          strokeColor: "#000",
          strokeOpacity: 0.1,
          strokeWidth: 4,
        },
        {
          strokeColor: location.style.strokeColor || "#000",
          strokeWidth: 2,
          fillColor: location.style.fillColor || "#fff",
          fillOpacity: location.style.fillOpacity || 0.2,
        }
      ]);

      // Create OL Style object for pin icon.
      location.pinStyle = mapp.utils.style({
        icon: {
          type: 'markerLetter',
          letter: record.symbol,
          color: location.style.strokeColor,
          scale: 3,
          anchor: [0.5, 1]
        }
      })

      // Create location view.
      mapp.ui.locations.view(location)

      // Collapse all location view drawer in list.
      Object.values(listview.target.children).forEach(el => el.classList.remove('expanded'))

      // New location view should be inserted after clearAll but before first current location view.
      listview.target.insertBefore(location.view, clearAll.nextSibling)

      // Send event after the location view has been added to the DOM.
      location.view.dispatchEvent(new Event('addLocationView'))

      // Show the clear all button.
      clearAll.style.display = 'block'

      // Click locations tab header.
      document.querySelector("[data-id=locations]").click()

      // Hide locations tab if no gazetteer input present.
      document.querySelector("[data-id=locations]").style.display = 'block'

      return true
    },
    deleteProperty: function (target, hook) {

      // Proxy default
      Reflect.deleteProperty(...arguments)

      let record = listview.records.find(record => record.hook === hook)
      record && delete record.hook

      setTimeout(() => {

        // clearAll should not be shown without locations to clear
        if (!document.querySelectorAll('#locations > .location-view').length) {
          
          // Activate the layers panel
          document.querySelector("[data-id=layers]").click()

          clearAll.style.display = 'none'

          // Find gazetteer input.
          const gazInput = document.querySelector('#locations #gazetteerInput')

          if (gazInput) {

            // Clear the gazetteer input value.
            gazInput.value = '';
          } else {

            // Hide locations tab if no gazetteer input present.
            document.querySelector("[data-id=locations]").style.display = 'none'
          }
        }
        
      }, 300)

      return true
    },
  })

  return listview
}