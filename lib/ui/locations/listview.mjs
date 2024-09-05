/**
## /ui/locations/listview

The listview module exports the listview method as mapp.ui.locations.listview()

@module /ui/locations/listview
*/

 /** 
@global
@typedef {Object} locale
Object containing the details of the locale i.e. layer definitions, plugins, etc.

@property {object} view A latitude and longitude used to determine the centre of the view
@property {array} layers Array of `layers` to display in the listview.
@property {object} [extent] Determines the size of the locale with using degrees east, west, etc.
@property {string} [name] The name of the locale.
@property {integer} [minZoom] limits the minimum zoom level of the mapview.
@property {integer} [maxZoom] limits the maximum zoom level of the mapview.
@property {string} [ScaleLine] sets the units for the scalebar.
@property {object} [gazetteer] Configuration options for location lookups.
@property {object} [roles] sets the roles and deines what they have access to in the locale.
@property {object} [queryparams] params to be assigned to `layer.queryparams` and `entry.queryparams`
@property {boolean} [locator] boolean flag for adding a locator to button column.
@property {array} [plugins] A list of plugins to be loaded.
@property {object} [svg_templates] A list of templates to be cached and used with {@link module:/utils/svgSymbols}
@property {array} [listview_records] An array for the symbol and colour being assigned to `mapview.locations{}`.
@property {layer} [layer] A master for all layers on the locale.
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
Retrieves the locations pinstyle from `locale.locations.pinStyle` and generates the pin
Appends the clear all button the location view which removes all locations from the view.

Creates a Proxy for `params.mapview.locations` which uses {@link module:/ui/locations/listview~setRecord} as its set method,
further assigns a deleteProperty function which removes locations by removing the assigned hook from the record. 
The deleteProperty function also calls {@link module:/ui/locations/listview~gazCheck}

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
    scale: 3,
    anchor: [0.5, 1]
  }

  locale.locations.style ??= {
    strokeColor: '#fff',
    fillColor: '#fff',
    fillOpacity: 0.1
  };

  //Spread assign to the default `markerLetter` pin if only one property is provided
  locale.locations.pinStyle = {...{ type: 'markerLetter',scale: 3, anchor: [0.5, 1] }, ...locale.locations.pinStyle}

  //Assign default records or `listview_records` to the location
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

      setTimeout(() => gazCheck(locale), 300)

      return true
    },
  })

  /**
  @function setRecord

  @description
  Assign a record to selected location.
  A maximum of ten records is available by default. Selecting more than the max will generate an alert.
  Generates and applies the style of the location in the listview
  Creates the OlStyle for the pin associated to the location

  Triggers the event to add the location to view.
  Prepends new locations to the listview, minimizing the other locations when a new one is selected


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

    location.style = locale.locations.style

    // Assign stroke and filleColor from record.
    if (record.colour) {
      location.style.strokeColor &&= record.colour
      location.style.fillColor &&= record.colour
    }

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

    return !!location
  }

}

/**
@function gazCheck

@description
Hides the location view if a gazetteer is being interacted with.
Clears the value of the gazetteer input. 
Controls whether the clear all button is shown by checking if any locations are selected. 

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
