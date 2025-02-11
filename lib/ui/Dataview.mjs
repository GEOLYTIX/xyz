/**
## ui/Dataview

The ui Dataview module exports the Dataview() decorator method to decorate a JSON object and return a `typedef:dataview` object.

Different dataview types [eg. ChartJS, Tabulator-tables] require 3rd party libraries loaded via Mapp plugins.

The checkDataview() method is used to check whether required plugin libraries are loaded.

@requires /utils/xhr
@requires /utils/queryParams

@module /ui/Dataview
*/

/**
@global
@typedef {Object} dataview
@property {string} key A unique for the dataview.
@property {string} dataview The type of dataview
@property {HTMLElement} target Target element in which the dataview is rendered.
@property {Function} create Create method for library supporting the dataview type.
@property {Function} show Method to show a dataview in the document.
@property {Function} hide Method to hide a dataview in the document.
@property {boolean} [dynamic] Dataview should be recreated when shown.
@property {boolean} [display] Whether the dataview should be displayed.
@property {Function} [update] Method to update the dataview data from a query.
@property {boolean} [reload] Dataview should run update query when shown.
@property {string} [query] Query template for the dataview update method.
@property {string} [host] Host for the update query.
@property {Object} [queryparams] Parameter for update query.
@property {Object} data Data to be displayed in the dataview.
@property {Function} [setData] Method to set the data in the dataview.
@property {string} [label] Label for a checkbox input.
@property {HTMLElement} [chkbox] Input element to toggle the dataview display.
*/

/**
@function Dataview
@async

@description
The Dataview method is async for legacy reasons.

The dataview decorator will call an assigned create() method and shortcircuit.

An ID lookup will be attempted if the dataview target is provided as a string value.

A default dataview update method will be assigned if not provided with the dataview configuration. The queryparams from the dataview layer and locale will be spread into the dataview queryparams object.

The checkDataview() method is run to provide warnings for legacy configurations and check whether the dataview can be created.

The show() and hide() methods will be assigned if not explicit in the dataview configuration. A dataview will have show and hide methods if declared as a [tabview]{@link module:/ui/Tabview~Tabview}.

A dataview.chkbox element will be created for an explicit string label property in the dataview.

The dataviewToolbar() method will be called prior to creating the dataview.

The dataviewMapChange() method will be called after the dataview has been created.

@param {Object} _this Dataview object.
@property {string} _this.target A document.getElementById() for the target string is used to assign a target HTMLElement.

@return {dataview} Decorated dataview object.
*/
export default async function Dataview(_this) {
  // A dataview create method has already been assigned by the checkDataview method.
  if (_this.create instanceof Function) {
    _this.create();
    return;
  }

  // The dataview target is defined as string.
  if (typeof _this.target === 'string') {
    // assign target element by ID.
    _this.target = document.getElementById(_this.target);
  }

  // Dataviews must be rendered into a target element.
  if (!(_this.target instanceof HTMLElement)) {
    console.warn('Dataviews require a HTMLHtmlElement target');
    console.log(_this);
    return;
  }

  // Return from method if unable to assign dataview type.
  if (checkDataview(_this) instanceof Error) {
    return _this.err;
  }

  // Assign queryparams from layer, locale.
  _this.queryparams = {
    ..._this.layer?.mapview?.locale?.queryparams,
    ..._this.layer?.queryparams,
    ..._this.location?.layer?.queryparams,
    ..._this.queryparams,
  };

  // Update method for _this.
  _this.update ??= updateDataview;

  _this.show ??= show;

  _this.hide ??= hide;

  // Create dataview toolbar
  dataviewToolbar(_this);

  dataviewMapChange(_this);

  return _this;
}

/**
@function show

@description
The show() method will be bound to the dataview object `this` as `dataview.show()` method in the decorator.

The `dataview.display` flag will be set to true.

A create() method will be assigned from the dataview{} utils if undefined. The create method will be executed.

The create method will also be executed if the `dataview.dynamic` flag is set.

The update() method will be executed if the `dataview.reload` flag is set.

The `dataview.target` element style display property will be set to 'block'.
*/
function show() {
  this.display = true;

  if (this.create === undefined) {
    this.create = function () {
      mapp.ui.utils[this.dataview].create(this);
    };
    this.create();

    this.update instanceof Function && this.update();
  } else if (this.dynamic) {
    this.create();

    this.update instanceof Function && this.update();
  } else if (this.reload) {
    this.update instanceof Function && this.update();
  }

  //Show toolbar buttons if there are any
  this.btnRow?.style.setProperty('display', 'flex');

  this.target.style.display = 'block';
}

/**
@function hide

@description
The hide() method will be bound to the dataview object `this` as `dataview.hide()` method in the decorator.

`dataview.display` flag will be set to false.

The `dataview.target` element style display property will be set to 'none'.
*/
function hide() {
  this.display = false;
  this.target.style.display = 'none';

  //Hide toolbar buttons if there are any
  this.btnRow?.style.setProperty('display', 'none');
}

/**
@function checkDataview

@description
The checkDataview() is executed by the dataview decorator to check whether a dataview can be created with a required dataview utility method.

The `_this.dataview` property will be set to 'chartjs' or 'tabulator' if a `dataview.chart` or `dataview.table` object property are configured.

The dataview.table object will be created if a `dataview.columns` array is present.

A Dataview object matching the dataview type must be available in mapp.ui.utils{} to support the creation of a new dataview object.

@param {dataview} _this Dataview object.
@property {string} [dataview] The type of dataview.
@property {Object} [table] dataview = "tabulator"
@property {Object} [chart] dataview = "chartjs"

@return {Error} Return Error if the dataview cannot be created.
*/
function checkDataview(_this) {
  // Assign key if not implicit.
  _this.key ??= _this.query || _this.title || _this.label;

  if (!_this.dataview) {
    // Create a ChartJS dataview is chart is defined.
    if (_this.chart) _this.dataview = 'chartjs';

    // Columns in entry indicate missing table config.
    if (typeof _this.columns !== 'undefined') {
      console.warn(
        'Table dataviews should be configured inside a tables object',
      );

      // Assign columns to table config.
      _this.table = { columns: _this.columns };

      _this.dataview = 'tabulator';
    }

    // Create a Tabulator dataview if columns are defined.
    if (_this.table) {
      _this.dataview = 'tabulator';
    }
  }

  if (!Object.hasOwn(mapp.ui.utils, _this.dataview)) {
    _this.err = new Error(`mapp.ui.utils.${_this.dataview} doesnt exist`);
    console.error(_this.err);

    _this.update = () =>
      console.warn(`Unable to update ${_this.key} dataview.`);
    return _this.err;
  }

  if (typeof mapp.ui.utils[_this.dataview].create !== 'function') {
    _this.err = new Error(
      `mapp.ui.utils.${_this.dataview}.create() method doesn't exist`,
    );
    console.error(_this.err);
    return _this.err;
  }
}

/**
@function updateDataview

@description
The updateDataview() method will be bound to the dataview object `this` as `dataview.update()` method in the decorator.

The dataview must have been created already. A `dataview.create()` method will be assigned from a plugin if nullish and immediately executed.

The dataview update method requires a query template to be executed with optional query parameter.

A parameterized query will passed as argument to the mapp.utils.xhr() utility method.

A custom `dataview.responseFunction()` will be executed instead of the `dataview.setData()` method if available.
*/
async function updateDataview() {
  if (this.create === undefined) {
    this.create = function () {
      mapp.ui.utils[this.dataview].create(this);
    };
    this.create();
  }

  // Dataviews cannot update without a query.
  if (!this.query) return;

  // Compile params object from dataview this.
  const params = mapp.utils.queryParams(this);

  // Stringify paramString from object.
  const paramString = mapp.utils.paramString(params);

  this.host ??= this.layer?.mapview?.host;

  // Query data as response from query.
  const response = await mapp.utils.xhr(
    `${this.host || mapp.host}/api/query?${paramString}`,
  );

  if (response instanceof Error) return;

  // The responseFunction must set the data to the dataview object.
  if (typeof this.responseFunction === 'function') {
    this.responseFunction(response);
    return;
  }

  // The setData method is assigned in the create() method.
  typeof this.setData === 'function' && this.setData(response);
}

/**
@function dataviewToolbar

@description
The dataviewToolbar method will create a HTML Element container with target elements for toolbar elements and the dataview itself.

@param {dataview} _this Dataview object.
@property {Object} _this.toolbar Configuration object for a toolbar supporting the dataview.
@property {string} _this.dataview The type of dataview
@property {HTMLElement} _this.target Target element in which the dataview is rendered.
@property {HTMLElement} [_this.panel] A panel element to be displayed in a tab[view].
*/
function dataviewToolbar(_this) {
  // A toolbar config object is required.
  if (!_this.toolbar) return;

  // A custome toolbar method has been assigned to the dataview.
  if (typeof _this.toolbar === 'function') {
    _this.toolbar();
  }

  // Target for the dataview.
  const target = mapp.utils.html.node`<div class="dataview-target">`;

  // Find and execute matching toolbar methods.
  const toolbarElements = Object.keys(_this.toolbar)
    .map((key) => mapp.ui.utils[_this.dataview]?.toolbar[key]?.(_this))
    .filter((item) => !!item);

  // Create an element for the toolbar buttons
  _this.btnRow = mapp.utils.html
    .node`<div class="btn-row">${toolbarElements}</div>`;

  // By default btnRow is hidden
  _this.btnRow.style.setProperty('display', 'none');

  // The panel will be assigned in a tabview.
  _this.panel = _this.target.appendChild(mapp.utils.html.node`
    <div class="flex-col">
      ${_this.btnRow}
      ${target}`);

  // Assign dataview target as target.
  _this.target = target;
}

/**
@function dataviewMapChange

@description
The dataviewMapChange method assigns an event listener for the custom changeEnd event of the dataview.layer mapview.

The mapChange property can be a function which is executed if the 'changeEnd' event is triggered. Otherwise the dataview.update() method will be executed.

The event method will shortcircuit if the dataview object is tabview tab without the `.active` class.

@param {Object} _this Dataview object.

@property {Object} mapChange A boolean flag or function.
@property {layer} _this.layer A layer associated with a dataview.
@property {mapview} layer.mapview The layer mapview.
*/
function dataviewMapChange(_this) {
  // The dataview should not update with a mapchange event.
  if (!_this.mapChange) return;

  _this.layer?.mapview?.Map.getTargetElement().addEventListener(
    'changeEnd',
    () => {
      // Only update dataview if corresponding layer is visible.
      if (!_this.layer.display) return;

      // Only update dataview in tab if active.
      if (_this.tab && !_this.tab.classList.contains('active')) return;

      // Execute mapChange if defined as custom function.
      if (typeof _this.mapChange === 'function') {
        _this.mapChange();
      } else {
        _this.update();
      }
    },
  );
}
