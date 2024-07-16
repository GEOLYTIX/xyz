/**
## ui/Dataview

The ui Dataview module exports the Dataview() decorator method to decorate a JSON object and return a `typedef:dataview` object.

Different dataview types [eg. ChartJS, Tabulator-tables] require 3rd party libraries loaded via Mapp plugins.

@requires /utils/xhr

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
## mapp.ui.Dataview()

The Dataview method will re-create the dataview if called with a decorated dataview object which has a create() method.

The Dataview method is async for legacy reasons.

An ID lookup will be attempted if the dataview target is provided as a string value.

A default dataview update method will be assigned if not provided with the dataview configuration. The queryparams from the dataview layer and locale will be spread into the dataview queryparams object.

The checkDataview() method is run to provide warnings for legacy configurations and check whether the dataview can be created.

The dataview.show() and dataview.hide() will be assigned if nullish.

The dataviewToolbar() method will be called prior to creating the dataview.

The dataview.chkbox element will be created if a label has been provided.

The dataviewMapChange() method will be called after the dataview has been created.

@param {Object} _this Dataview object.
@property {HTMLElement} _this.target A document.getElementById() for the target will be attempted if provided as string.

@return {dataview} Decorated dataview object.
*/

export default async function Dataview(_this) {

  // A dataview create method has already been assigned by the checkDataview method.
  if (_this.create instanceof Function) {

    _this.create()
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
    ..._this.queryparams,
  }

  // Update method for _this.
  _this.update ??= updateDataview

  _this.show ??= show

  _this.hide ??= hide

  // Create checkbox if a label is provided.
  _this.chkbox = _this.label && mapp.ui.elements.chkbox({
    data_id: _this.key,
    label: _this.label,
    checked: !!_this.display,
    disabled: _this.disabled,
    onchange: (checked) => {

      _this.display = checked

      _this.display
        ? _this.show()
        : _this.hide()
    }
  })

  // Create dataview toolbar
  dataviewToolbar(_this)
 
  dataviewMapChange(_this)

  return _this;
};

/**
@function show

@description
`dataview.display` flag will be set to true.

`dataview.create()` will be assigned and executed.

`dataview.create()` will also be executed with the `dataview.dynamic` flag.

`dataview.update()` will be called with the `dataview.reload` flag.

The `dataview.target` element display style will be set to `block`.

@param {dataview} _this Dataview object.
@property {string} dataview The type of dataview
@property {Function} [create] Create method for library supporting the dataview type.
@property {boolean} [dynamic] Dataview should be recreated when shown.
@property {Function} [update] Method to update the dataview data from a query.
@property {boolean} [reload] Dataview should run update query when shown.
@property {HTMLElement} target Target element in which the dataview is rendered.
*/

function show() {

  this.display = true

  if (!this.create || this.dynamic) {
    this.create = function () {
      mapp.ui.utils[this.dataview].create(this);
    }
    this.create()

    // Execute update if available
    this.update && this.update()

  } else if (this.reload) {

    // Execute update if available
    this.update && this.update()
  }

  this.target.style.display = 'block'
}

/**
@function hide

@description
`dataview.display` flag will be set to false.

The `dataview.target` element display style will be set to `none`.

@param {Object} _this Dataview object.
@property {HTMLElement} target Target element in which the dataview is rendered.
*/

function hide() {

  this.display = false
  this.target.style.display = 'none'
}

/**
@function checkDataview

@description
The dataview type will be set to "chartjs" or "tabulator" if a `dataview.chart` or `dataview.table` object are present.

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
  _this.key ??= _this.query || _this.title || _this.label

  if (!_this.dataview) {

    // Create a ChartJS dataview is chart is defined.
    if (_this.chart) _this.dataview = 'chartjs';

    // Columns in entry indicate missing table config.
    if (typeof _this.columns !== 'undefined') {
      console.warn('Table dataviews should be configured inside a tables object');

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
    console.error(_this.err)

    _this.update = () => console.warn(`Unable to update ${_this.key} dataview.`)
    return _this.err
  }

  if (typeof mapp.ui.utils[_this.dataview].create !== 'function') {

    _this.err = new Error(`mapp.ui.utils.${_this.dataview}.create() method doesn't exist`);
    console.error(_this.err)
    return _this.err
  }
}

/**
@function updateDataview

@description
The dataview must have been created already. A `dataview.create()` method will be assigned from a plugin if nullish and immediately executed.

The dataview update method requires a query template to be executed with optional query parameter.

A parameterized query will passed as argument to the mapp.utils.xhr() utility method.

A custom `dataview.responseFunction()` will be executed instead of the `dataview.setData()` method if available.

@param {dataview} _this Dataview object.
@property {string} [query] Query template for the dataview update method.
@property {string} [host] Host for the update query.
@property {Object} [queryparams] Parameter for update query.
@property {Function} [setData] Method to set the data in the dataview.
@property {Function} [responseFunction] A custom response function to be executed instead of the setData method.
*/

async function updateDataview() {

  if (!this.create) {

    this.create = function () {
      mapp.ui.utils[this.dataview].create(this);
    }
    this.create()
  }

  // Dataviews must not update without a query.
  if (!this.query) return;

  // Compile params object from dataview this.
  const params = mapp.utils.queryParams(this);

  // Stringify paramString from object.
  const paramString = mapp.utils.paramString(params);

  this.host ??= this.layer?.mapview?.host

  // Query data as response from query.
  const response = await mapp.utils.xhr(
    `${this.host || mapp.host}/api/query?${paramString}`);

  if (response instanceof Error) return;

  // The responseFunction must set the data to the dataview object.
  if (typeof this.responseFunction === 'function') {
    this.responseFunction(response);
    return;
  }

  typeof this.setData === 'function' && this.setData(response);
}

/**
@function dataviewToolbar

@description
The dataviewToolbar method will create a HTML Element container with target elements for toolbar elements and the dataview itself.

@param {dataview} _this Dataview object.
@property {Object} [toolbar] Configuration object for a toolbar supporting the dataview.
@property {string} dataview The type of dataview
@property {HTMLElement} target Target element in which the dataview is rendered.
@property {HTMLElement} panel A panel element to be displayed in a tab[view].
*/

function dataviewToolbar(_this) {

  // A toolbar config object is required.
  if (!_this.toolbar) return;

  // A custome toolbar method has been assigned to the dataview.
  if (typeof _this.toolbar === 'function') {
    _this.toolbar()
  }

  // Target for the dataview.
  const target = mapp.utils.html.node`<div class="dataview-target">`;

  // Find and execute matching toolbar methods.
  const toolbarElements = Object.keys(_this.toolbar)
    .map((key) => mapp.ui.utils[_this.dataview]?.toolbar[key]?.(_this))
    .filter((item) => !!item);

  // The panel will be assigned in a tabview.
  _this.panel = _this.target.appendChild(mapp.utils.html.node`
    <div class="flex-col">
      <div class="btn-row">${toolbarElements}</div>
      ${target}`);

  // Assign dataview target as target.
  _this.target = target;
}

/**
@function dataviewMapChange

@description
The dataviewMapChange method assigns an event listener for the custom changeEnd event of the dataview.layer mapview.

The dataview.update() or a custom mapChange() method will be executed if the changeEnd eventlistener is triggered.

@param {Object} _this Dataview object.

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

function dataviewMapChange(_this) {
  
  // The dataview should not update with a mapchange event.
  if (!_this.mapChange) return;

  const targetMapElement = _this.layer?.mapview?.Map?.getTargetElement()
  
  // The dataview requires a layer mapview.
  if (!targetMapElement) return;
  
  targetMapElement.addEventListener('changeEnd', () => {

    // Only update dataview if corresponding layer is visible.
    if (!_this.layer.display) return;

    // Only update dataview in tab if active.
    if (_this.tab && !_this.tab.classList.contains('active')) return;

    // Execute mapChange if defined as custom function.
    if (typeof _this.mapChange === 'function') {

      _this.mapChange()

    } else {

      _this.update();
    }
      
  });
}