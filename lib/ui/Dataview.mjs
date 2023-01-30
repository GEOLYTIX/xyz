export default async (_this) => {
  // The dataview target is defined as string.
  if (typeof _this.target === 'string') {
    // assign target element by ID.
    _this.target = document.getElementById(_this.target);
  }

  // Dataviews must be rendered into a target element.
  if (!_this.target) {
    console.warn('Dataview creation requires a target key-value');
    console.log(_this);
    return;
  }

  // Update method for _this.
  _this.update = async () => {
    // Dataviews must not update without a query.
    if (!_this.query) return;

    // Compile params object from dataview entry.
    const params = mapp.utils.queryParams(_this);

    // Stringify paramString from object.
    const paramString = mapp.utils.paramString(params);

    // Query data as response from query.
    const response = await mapp.utils.xhr(
      `${
        _this.host || _this.location.layer.mapview.host
      }/api/query?${paramString}`
    );

    if (response instanceof Error) return;

    // The responseFunction must set the data to the dataview object.
    if (typeof _this.responseFunction === 'function') {
      _this.responseFunction(response);
      return;
    }

    typeof _this.setData === 'function' && _this.setData(response);
  };

  // Create a container to accomodate for a toolbar and dataview container.
  // Target must already be HTMLElement
  if (_this.toolbar && _this.target instanceof HTMLElement) {
    // Target for the dataview
    let target = mapp.utils.html.node`<div class="dataview-target">`;

    let toolbar =
      (typeof _this.toolbar === 'function' && _this.toolbar()) ||
      Object.keys(_this.toolbar).map((key) =>
        mapp.ui.elements.toolbar_el[key](_this)
      );

    // Append flex container target element and assign as panel to dataview entry.
    // The panel will be assigned in a tabview.
    _this.panel = _this.target.appendChild(mapp.utils.html.node`
        <div class="flex-col">
          <div class="btn-row">${toolbar}</div>
          ${target}`);

    // Assign dataview target as target.
    _this.target = target;
  }

  // Create a ChartJS dataview is chart is defined.
  if (_this.chart) await Chart(_this);

  // Columns in entry indicate missing table config.
  if (typeof _this.columns !== 'undefined') {
    console.warn('Table dataviews should be configured inside a tables object');

    // Assign columns to table config.
    _this.table = { columns: _this.columns };
  }

  // Create a Tabulator dataview if columns are defined.
  if (_this.table) await Table(_this);

  // Update the dataview on mapChange if set.
  _this.mapChange &&
    _this.layer &&
    _this.layer.mapview.Map.getTargetElement().addEventListener(
      'changeEnd',
      () => {
        // Only update dataview if corresponding layer is visible.
        if (_this.layer && !_this.layer.display) return;

        // Only update dataview if _this.tab is active.
        if (_this.tab && !_this.tab.classList.contains('active')) return;

        // Execute mapChange if defined as function or dataview update method.
        (typeof _this.mapChange === 'function' && _this.mapChange()) ||
          _this.update();
      }
    );

  return _this;
};

async function Chart(_this) {
  // Charts most be rendered into a canvas type element.
  const canvas = _this.target.appendChild(mapp.utils.html.node`<canvas>`);

  // Await initialisation of ChartJS object.
  _this.ChartJS = await mapp.ui.utils.Chart(
    canvas,
    mapp.utils.merge(
      {
        type: 'bar',
        options: {
          plugins: {
            legend: {
              display: false,
            },
            datalabels: {
              display: false,
            },
          },
        },
      },
      _this.chart
    )
  );

  // Set chart data
  _this.setData = (data) => {
    if (_this.noDataMask && !data) {
      // Remove display from target
      _this.target.style.display = 'none';

      // Set no data mask on dataview target
      _this.mask =
        !_this.mask &&
        _this.target.parentElement?.appendChild(mapp.utils.html.node`
        <div class="dataview-mask">No Data`);
    } else {
      // Remove existing dataview mask.
      _this.mask && _this.mask.remove();
      delete _this.mask;

      // Set dataview target to display as block.
      _this.target.style.display = 'block';
    }

    // Create a dataset with empty data array if data is falsy.
    if (!data) {
      data = {
        datasets: [
          {
            data: [],
          },
        ],
      };
    }

    // Set data in datasets array if no datasets are defined in data.
    if (!data.datasets) {
      data = {
        datasets: [
          {
            data: data,
          },
        ],
      };
    }

    _this.data = data;

    // Assign datasets from chart object to data.datasets.
    _this.chart.datasets?.length &&
      data.datasets.forEach((dataset, i) =>
        Object.assign(dataset, _this.chart.datasets[i])
      );

    // Get labels from chart if not defined in data.
    data.labels = data.labels || _this.chart.labels;

    // Set data to chartjs object.
    _this.ChartJS.data = data;

    // Update the chartjs object.
    _this.ChartJS.update();
  };
}

async function Table(_this) {

  // Check for custom column methods.
  _this.table.columns.forEach((col) => chkCol(col));

  function chkCol(col) {

    // Column is an array of sub columns.
    if (Array.isArray(col.columns)) {

      col.columns.forEach(col => chkCol(col))
      return;
    }

    // Check for custom headerFilter matched in the ui utils.
    if (
      typeof col.headerFilter === 'string' &&
      mapp.ui.utils.tabulator.headerFilter[col.headerFilter]
    ) {
      // Assign custom headerFilter from ui utils.
      col.headerFilter =
        mapp.ui.utils.tabulator.headerFilter[col.headerFilter](_this);
    }

    // Check for custom formatter in the ui utils.
    if (
      typeof col.formatter === 'string' &&
      mapp.ui.utils.tabulator.formatter[col.formatter]
    ) {
      // Assign custom formatter from ui utils.
      col.formatter =
      mapp.ui.utils.tabulator.formatter[col.formatter](_this);
    }    
  }

  // Await initialisation of Tabulator object.
  _this.Tabulator = await mapp.ui.utils.Tabulator(
    _this.target,
    Object.assign(
      {
        //renderVertical: 'basic',
        //renderHorizontal: 'virtual',
        selectable: false,
      },
      _this.table
    )
  );

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

        _this.Tabulator.on(event[0], mapp.ui.utils.tabulator[event[1].util || event[1]](_this, event[1]));
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
      // Remove display from target
      _this.target.style.display = 'none';

      // Set no data mask on dataview target
      _this.mask =
        !_this.mask &&
        _this.target.parentElement?.appendChild(mapp.utils.html.node`
        <div class="dataview-mask">No Data`);
    } else {
      // Remove existing dataview mask.
      _this.mask && _this.mask.remove();
      delete _this.mask;

      // Set dataview target to display as block.
      _this.target.style.display = 'block';
    }

    // Tabulator data must be an array.
    data = (!data && []) || (data.length && data) || [data];

    // Set data to the tabulator object
    _this.Tabulator.setData(data);

    // Assign data to the dataview object
    _this.data = data;

    typeof _this.setDataCallback === 'function' && _this.setDataCallback(_this);
  };
}
