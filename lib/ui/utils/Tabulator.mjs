let promise, Tabulator = null

mapp.utils.merge(mapp.dictionaries, {
  en: {
    fail_tabulator_load: 'Failed to load Tabulator library. Please reload the browser.',
  },
  de: {
    fail_tabulator_load: 'Laden des Tabulator Modules fehlgeschlagen.',
  },
  zh: {
    fail_tabulator_load: '无法加载制表符库。 请重新加载浏览器。',
  },
  zh_tw: {
    fail_tabulator_load: '無法載入定位字元庫。 請重新載入流覽器。',
  },
  pl: {
    fail_tabulator_load: 'Nie udało się załadować biblioteki Tabulator. Otwórz ponownie przeglądarkę.',
  },
  fr: {
    fail_tabulator_load: 'Erreur de chargement de la librairie Tabulator. Veuillez actualiser la page.',
  },
  ja: {
    fail_tabulator_load: 'Tabulatorライブラリはロードに失敗しました。ブラウザをリロードしてください.',
  },
  es: {
    fail_tabulator_load: 'No se pudo cargar la biblioteca Tabulator. Por favor actualice la página.',
  },
  tr: {
    fail_tabulator_load: 'Tabulator kutuphanesi yuklenemedi. Lutfen sayfayi yenileyiniz.',
  },
  it: {
    fail_tabulator_load: 'Errore nel caricare la libreria Tabulator. Per favore ricarica il browser',
  },
  th: {
    fail_tabulator_load: 'ไม่สามารถโหลดไลบรารีแบบตารางได้ กรุณาโหลดเบราว์เซอร์อีกครั้ง',
  },
})

async function tabulator() {

  // Create promise to load Tabulator library if null.
  promise ??= new Promise(resolve => {

    // Assign from window if Tabulator library is loaded from link
    if (window.Tabulator) {

      Tabulator = window.Tabulator

      resolve()

      return
    }

    // Append the tabulator css to the document head.
    document.getElementsByTagName('HEAD')[0].append(mapp.utils.html.node`
      <link rel="stylesheet" href="https://unpkg.com/tabulator-tables@5.5.2/dist/css/tabulator.min.css"/>`);

    // Import Chart and plugins.
    Promise
      .all([
        import('https://unpkg.com/tabulator-tables@5.5.2/dist/js/tabulator_esm.min.js')
      ])
      .then(imports => {

        Tabulator = imports[0].TabulatorFull

        resolve()
      })
      .catch(error => {
        console.error(error.message)
        alert(`${mapp.dictionary.fail_tabulator_load}`)
      })

  })

  await promise

  // Built Tabulator instance
  const Table = new Tabulator(...arguments);

  // Await for the Tabulator table instance to be built in Promise
  await new Promise(resolve => Table.on('tableBuilt', resolve))

  // Find ul_parents that are positioned fixed in table header.
  const ul_parents = Table.element.querySelectorAll('.ul-parent')

  // Adjust fixed dropdowns on scroll.
  ul_parents.length && Table.on('scrollHorizontal', left => {

    // Get the table element bounds.
    const table_bounds = Table.element.getBoundingClientRect()

    for (const ul_parent of ul_parents) {

      // Get the ul_parent bounds.
      const header_bounds = ul_parent.getBoundingClientRect()

      // Get ul element itself
      const ul = ul_parent.querySelector('ul')

      // The ul may not exist if populated from a query.
      if (ul) {

        // Set fixed element to be the difference of the parent and table bounds on scroll.
        ul.style.left = `${header_bounds.left - table_bounds.left}px`
      }

    }
  });

  // Return built Tabulator instance.
  return Table
}

export default async function (_this) {

  // Apply tabulator column methods
  mapp.ui.utils.tabulator.columns(_this)

  // Await initialisation of Tabulator object.
  _this.Tabulator = await tabulator(
    _this.target,
    {
      //renderVertical: 'basic',
      //renderHorizontal: 'virtual',
      selectable: false,
      //data: _this.data,
      ..._this.table
    });

  // Table will not automatically redraw on resize.
  if (_this.table.autoResize === false) {
    let debounce = 0;

    // debounce resizeOberserver by 800.
    _this.resizeObserver = new ResizeObserver(() => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        _this.target.offsetHeight > 9 && _this.Tabulator.redraw();
      }, 800);
    });

    _this.resizeObserver.observe(_this.target);
  }

  // Assign tabulator events from object.
  events(_this)

  // Set Tabulator data.
  _this.setData = setData

  // Set _this.data if provided.
  _this.data && _this.setData(_this.data)
}

function events(_this) {

  if (typeof _this.events !== 'object') return;

  Object.entries(_this.events).forEach((event) => {

    // Get event method from tabulator utils.
    if (typeof mapp.ui.utils.tabulator[event[1].util || event[1]] === 'function') {

      _this.Tabulator.on(event[0],
        mapp.ui.utils.tabulator[event[1].util || event[1]](_this, event[1]));
      return;
    }

    // Shortcircuit if events object value is not a function.
    if (typeof event[1] !== 'function') return;

    // Key is event name. Value is the event function.
    _this.Tabulator.on(event[0], event[1]);
  });
}

function setData(data) {

  if (this.noDataMask && !data) {

    this.noDataMask = typeof this.noDataMask === 'string' ? this.noDataMask : 'No Data';

    // Remove display from target
    this.target.style.display = 'none';

    // Create this.mask if undefined.
    this.mask ??= mapp.utils.html.node`<div class="dataview-mask">${this.noDataMask}`

    // Append this.mask to the target parent.
    this.target.parentElement?.append(this.mask)

  } else {

    // Remove this.mask from dom.
    this.mask?.remove();

    // Set dataview target to display as block.
    this.target.style.display = 'block';
  }

  // Set data as empty array if nullish.
  data ??= []

  // Make an array of data if not already an array.
  data &&= Array.isArray(data) ? data : [data];

  // Set data to the tabulator object
  this.Tabulator.setData(data);

  this.data = data;

  // Execute setDataCallback method if defined as function.
  typeof this.setDataCallback === 'function' && this.setDataCallback(_this);
};