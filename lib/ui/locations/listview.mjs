/**
## /ui/locations/listview

The listview module exports the listview method as mapp.ui.locations.listview()

@module /ui/locations/listview
*/

mapp.utils.merge(mapp.dictionaries, {
  en: {
    location_clear_all: 'Clear locations',
    location_listview_full: 'The listview for locations is full.',
  },
  de: {
    location_clear_all: 'Entferne Auswahl',
    location_listview_full: 'Lagenliste ist voll.',
  },
  zh: {
    location_clear_all: '清除位置点',
    location_listview_full: '位置列表视图已满',
  },
  zh_tw: {
    location_clear_all: '清除位置點',
    location_listview_full: '位置列表視圖已滿',
  },
  pl: {
    location_clear_all: 'Usuń lokalizacje',
    location_listview_full: 'Lista dla lokalizacji jest pełna',
  },
  fr: {
    location_clear_all: 'Effacer les emplacements',
    location_listview_full: 'La liste des emplacements est pleine.',
  },
  ja: {
    location_clear_all: 'ロケーションをクリア',
    location_listview_full: 'ロケーションのリストビューがいっぱいです',
  },
  esp: {
    location_clear_all: 'Borrar localizaciones',
    location_listview_full: 'La vista de lista de ubicaciones está llena.',
  },
  tr: {
    location_clear_all: 'Konumlari temizle',
    location_listview_full: 'Konum listesi dolu',
  },
  it: {
    location_clear_all: 'Elimina località',
    location_listview_full: 'L elenco delle località è pieno',
  },
  th: {
    location_clear_all: 'ลบสถานที่ทั้งหมด',
    location_listview_full: 'มุมมองรายการสถานที่เต็ม',
  },
})

// Default records for storing locations in locale.
const records = [
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

/**
@function listview

@description
The listview method appends a list of the selected locations to the provided target.

Creates the pins on each location using the styling supplied in locales.listview_records or defined on the entry type pin.

@param {object} params 
@property {mapview} params.mapview The mapview of the instance.
@property {HTMLElement} params.target The target for the listview.
*/
export default function listview(params) {

  if (!params.mapview) {

    console.warn('A mapview is required in the locations listview params argument.')
  }

  if (!params.target) {

    console.warn('A target element is required in the locations listview params argument.')
  }

  const locale = params.mapview.locale

  locale.locations ??= {}

  locale.locations.pinStyle ??= {
    type: 'markerLetter',
    scale: 1,
    anchor: [0.5, 1]
  }

  locale.locations.records ??= locale.listview_records || structuredClone(records)

  locale.locations.clearAll = params.target.appendChild(mapp.utils.html.node`
    <button 
      style="display: none; width: 100%; text-align: right;"
      class="tab-display bold primary-colour text-shadow"
      onclick=${e => {

        // Remove all mapview locations
        Object.values(params.mapview.locations)
          .forEach(location => location.remove())

      }}>
      ${mapp.dictionary.location_clear_all}`)

  // Create proxy for mapview.locations
  params.mapview.locations = new Proxy(params.mapview.locations, {
    set: setRecord,
    deleteProperty: function (target, hook) {

      // Proxy default
      Reflect.deleteProperty(...arguments)

      const record = locale.locations.records.find(record => record.hook === hook)

      record && delete record.hook

      setTimeout(locale => gazCheck(locale), 300)

      return true
    },
  })

  /**
  @function setRecord

  @description
  tbc

  @param {location} location 
  */
  function setRecord(target, key, location) {

    // Find a free record for location.
    const record = locale.locations.records.find(record => !record.hook)

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
        strokeColor: '#000',
        strokeOpacity: 0.1,
        strokeWidth: 8,
      },
      {
        strokeColor: '#000',
        strokeOpacity: 0.1,
        strokeWidth: 6,
      },
      {
        strokeColor: '#000',
        strokeOpacity: 0.1,
        strokeWidth: 4,
      },
      {
        strokeColor: location.style.strokeColor || '#000',
        strokeWidth: 2,
        fillColor: location.style.fillColor || '#fff',
        fillOpacity: location.style.fillOpacity || 0.2,
      }
    ]);

    // Create OL Style object for pin icon.
    location.pinStyle = mapp.utils.style({
      icon: {
        ...locale.locations.pinStyle,
        letter: record.symbol,
        color: location.style.strokeColor,
      }
    })

    // Create location view.
    mapp.ui.locations.view(location)

    // Collapse all location view drawer in list.
    Object.values(params.target.children).forEach(el => el.classList.remove('expanded'))

    // New location view should be inserted after clearAll but before first current location view.
    params.target.insertBefore(location.view, locale.locations.clearAll.nextSibling)

    // Send event after the location view has been added to the DOM.
    location.view.dispatchEvent(new Event('addLocationView'))

    // Show the clear all button.
    locale.locations.clearAll.style.display = 'block'

    // Click locations tab header.
    document.querySelector('[data-id=locations]').click()

    // Hide locations tab if no gazetteer input present.
    document.querySelector('[data-id=locations]').style.display = 'block'

    return true
  }

}

/**
@function gazCheck

@description
tbc

@param {locale} locale 
*/
function gazCheck(locale) {

  // clearAll should not be shown without locations to clear
  if (!document.querySelectorAll('#locations > .location-view').length) {

    // Activate the layers panel
    document.querySelector('[data-id=layers]').click()

    locale.locations.clearAll.style.display = 'none'

    // Find gazetteer input.
    const gazInput = document.querySelector('#locations input')

    if (gazInput) {

      // Clear the gazetteer input value.
      gazInput.value = '';

    } else {

      // Hide locations tab if no gazetteer input present.
      document.querySelector('[data-id=locations]').style.display = 'none'
    }
  }
}
