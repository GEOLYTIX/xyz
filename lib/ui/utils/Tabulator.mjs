let promise, Tabulator = null

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
        alert('Failed to load Tabulator library. Please reload the browser.')
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
  ul_parents.length && Table.on("scrollHorizontal", left => {

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

export default async function(_this) {

  // Check for custom column methods.
  _this.table.columns.forEach((col) => chkCol(col));

  function chkCol(col) {

    // Column is an array of sub columns.
    if (Array.isArray(col.columns)) {

      col.columns.forEach(col => chkCol(col))
      return;
    }

    // Check for custom headerFilter matched in the ui utils.
    if (typeof col.headerFilter === 'string'
      && mapp.ui.utils.tabulator.headerFilter[col.headerFilter]) {

      // Assign custom headerFilter from ui utils.
      col.headerFilter =
        mapp.ui.utils.tabulator.headerFilter[col.headerFilter](_this);
    }

    // Check for custom formatter in the ui utils.
    if (typeof col.formatter === 'string'
      && mapp.ui.utils.tabulator.formatter[col.formatter]) {

      // Assign custom formatter from ui utils.
      col.formatter =
        mapp.ui.utils.tabulator.formatter[col.formatter](_this);
    }
  }

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
  typeof _this.events === 'object' &&
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

  // Set Tabulator data.
  _this.setData = (data) => {

    if (_this.noDataMask && !data) {

      _this.noDataMask = typeof _this.noDataMask === 'string' ? _this.noDataMask : 'No Data';

      // Remove display from target
      _this.target.style.display = 'none';

      // Create _this.mask if undefined.
      _this.mask ??= mapp.utils.html.node`<div class="dataview-mask">${_this.noDataMask}`

      // Append _this.mask to the target parent.
      _this.target.parentElement?.append(_this.mask)

    } else {

      // Remove _this.mask from dom.
      _this.mask?.remove();

      // Set dataview target to display as block.
      _this.target.style.display = 'block';
    }

    // Set data as empty array if nullish.
    data ??= []

    // Make an array of data if not already an array.
    data &&= Array.isArray(data) ? data : [data];
    
    // Set data to the tabulator object
    _this.Tabulator.setData(data);

    _this.data = data;

    // Execute setDataCallback method if defined as function.
    typeof _this.setDataCallback === 'function' && _this.setDataCallback(_this);
  };

  // Set _this.data if provided.
  _this.data && _this.setData(_this.data)

}