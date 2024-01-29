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

  // Assign queryparams from layer, locale.
  _this.queryparams = {
    ..._this.queryparams,
    ..._this.layer?.queryparams,
    ..._this.layer?.mapview?.locale?.queryparams,
    ..._this.location?.layer?.queryparams,
    ..._this.location?.layer?.mapview?.locale?.queryparams}

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
      `${_this.host || _this.location?.layer?.mapview?.host || mapp.host
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


  // Create a ChartJS dataview is chart is defined.
  if (_this.chart) _this.dataview = 'Chart';

  // Columns in entry indicate missing table config.
  if (typeof _this.columns !== 'undefined') {
    console.warn('Table dataviews should be configured inside a tables object');

    // Assign columns to table config.
    _this.table = { columns: _this.columns };

    _this.dataview = 'Tabulator';
  }

  // Create a Tabulator dataview if columns are defined.
  if (_this.table) {
    _this.dataview = 'Tabulator';
  }

  if(!Object.hasOwn(mapp.ui.utils, _this.dataview)) {
    console.warn(`mapp.ui.utils.${_this.dataview} doesnt exist`)
    return;
  }

  // Create a container to accomodate for a toolbar and dataview container.
  // Target must already be HTMLElement
  if (_this.toolbar && _this.target instanceof HTMLElement) {

    // Target for the dataview
    let target = mapp.utils.html.node`<div class="dataview-target">`;

    // should know by now the type of the dataview (_this.dataview) in order to match toolbar methods
    let dataview_type = {
      "Tabulator": "tabulator",
      "Chart": "chart"
    };

    let toolbar =
      (typeof _this.toolbar === 'function' && _this.toolbar()) ||
      Object.keys(_this.toolbar).map((key) => mapp.ui.utils[dataview_type[_this.dataview]]?.toolbar[key]?.(_this));

    // Append flex container target element and assign as panel to dataview entry.
    // The panel will be assigned in a tabview.
    _this.panel = _this.target.appendChild(mapp.utils.html.node`
        <div class="flex-col">
          <div class="btn-row">${toolbar}</div>
          ${target}`);

    // Assign dataview target as target.
    _this.target = target;
  }
  
  await mapp.ui.utils[_this.dataview](_this);

  // Update the dataview on mapChange if set.
  _this.mapChange
    && _this.layer
    && _this.layer.mapview.Map.getTargetElement()
      .addEventListener('changeEnd', () => {

        // Only update dataview if corresponding layer is visible.
        if (_this.layer && !_this.layer.display) return;

        // Only update dataview if _this.tab is active.
        if (_this.tab && !_this.tab.classList.contains('active')) return;

        // Execute mapChange if defined as function or dataview update method.
        (typeof _this.mapChange === 'function' && _this.mapChange()) ||
          _this.update();
      });

  return _this;
};