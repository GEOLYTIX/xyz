/**
## ui/Dataview

The ui Dataview module exports the Dataview() decorator method to decorate a JSON object and return a `typedef:dataview` object.

Different dataview types [eg. ChartJS, Tabulator-tables] require 3rd party libraries loaded via Mapp plugins.

The checkDataview() method is used to check whether required plugin libraries are loaded.

@requires /utils/xhr
@requires /utils/queryParams
@requires /ui/elements/chkbox
@requires /ui/utils/dataview

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

The method will check whether the dataview has already been decorated with a create method and short circuit if the dataview is not dynamic. Dataviews flagged as dynamic will be re-created.

The create() method will be executed on a decorated dataview.

An ID lookup will be attempted if the dataview target is provided as a string value.

The checkDataview() method is run to provide warnings for legacy configurations and check whether the dataview can be created.

A chkbox element will be created and assigned to the dataview object if the label property is defined as a string. The dataview chkbox element can be used to toggle the display flag and call the dataview show() or hide() method.

A default dataview update method will be assigned if not provided with the dataview configuration. The queryparams from the dataview layer and locale will be spread into the dataview queryparams object.

The show() and hide() methods will be assigned if not explicit in the dataview configuration. A dataview will have show and hide methods if declared as a [tabview]{@link module:/ui/Tabview~Tabview}.

The mapp.ui.utils.dataview.Toolbar() method will be called prior to creating the dataview.

The mapp.ui.utils.dataview.mapChange() method will be called after the dataview has been created.

@param {Object} _this Dataview object.
@property {HTMLElement} _this.target A document.getElementById() is used to assign a target HTMLElement if target is a string property.
@property {boolean} _this.dynamic The dataview should be created again.
@property {string} _this.label Label for the dataview chkbox.

@return {dataview} Decorated dataview object.
*/
export default async function Dataview(_this) {
  // Only dynamic dataviews should be recreated.
  if (!_this.dynamic && _this.create instanceof Function) {
    return;
  }

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

  if (typeof _this.label === 'string') {
    // Create checkbox control for dataview.
    _this.chkbox = mapp.ui.elements.chkbox({
      checked: !!_this.display,
      data_id: _this.key,
      disabled: _this.disabled,
      label: _this.label,
      onchange: (checked) => {
        _this.display = checked;
        _this.display ? _this.show() : _this.hide();
      },
    });
  }

  // Assign default update method.
  _this.update ??= updateDataview;

  _this.show ??= show;

  _this.hide ??= hide;

  // Create dataview toolbar
  mapp.ui.utils.dataview.Toolbar(_this);

  mapp.ui.utils.dataview.mapChange(_this);

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
