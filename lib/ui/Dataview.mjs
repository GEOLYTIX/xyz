/**
## ui/Dataview

The ui Dataview module exports the Dataview method to decorate JSON dataview objects.

Different dataview types [eg. ChartJS, Tabulator-tables] require 3rd party libraries loaded via Mapp plugins.

@module /ui/Dataview
*/

/**
@function Dataview

@description
mapp.ui.Dataview(_this)

The Dataview decorator method requires a JSON dataview object to be decorated and returned.

An ID lookup will be attempted if the dataview target is provided as a string value.

@param {Object} _this Dataview object.
@param {HTMLElement} _this.target Dataview HTML Element target.
@param {string} _this.dataview The dataview type.

@return {Object} Decorated dataview object.
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
    console.log(_this);
    return;
  }

  // Return from method if unable to assign dataview type.
  if (checkDataview(_this) instanceof Error) return;

  // Assign queryparams from layer, locale.
  _this.queryparams = {
    ..._this.layer?.mapview?.locale?.queryparams,
    ..._this.layer?.queryparams,
    ..._this.queryparams,
  }

  // Update method for _this.
  _this.update ??= updateDataview

  // Create dataview toolbar
  dataviewToolbar(_this)
 
  await _this.create();

  dataviewMapChange(_this)

  return _this;
};

/**
@function checkDataview

@description
A Dataview object matching `_this.dataview` must be available in mapp.ui.utils{} to support the creation of a new dataview object.

A create method will be assigned to the dataview allowing to re-create the dataview into the designated target if required.

@param {Object} _this Dataview object.
@param {string} _this.dataview The dataview type.

@return {Error} Return Error if Dataview create method is unavailable.
*/

function checkDataview(_this) {

  if (!_this.dataview) {

    // Attempt to assign dataview type from legacy configuration.
    console.warn(`No implicit dataview method for dataview key:${_this.key}`)

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
    console.warn(`mapp.ui.utils.${_this.dataview} doesnt exist`)
    return new Error();
  }

  if (typeof mapp.ui.utils[_this.dataview].create !== 'function') {
    console.warn(`mapp.ui.utils.${_this.dataview}.create() method doesn't exist`)
    return new Error();
  }

  _this.create = function () {
    mapp.ui.utils[_this.dataview].create(this);
  }
}

/**
@function dataviewToolbar

@description
The dataviewToolbar method will create a HTML Element container with target elements for toolbar elements and the dataview itself.

@param {Object} _this Dataview object.
@param {string} _this.toolbar The dataview toolbar configuration.
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
@param {boolean} _this.mapChange Whether the dataview should update when the mapview changes.
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

/**
@function updateDataview

@description
The updateDataview will execute a parameterized query with mapp.utils.xhr(). 

@param {Object} _this Dataview object.
@param {string} _this.query The dataview query template.
*/

async function updateDataview() {

  // Dataviews must not update without a query.
  if (!this.query) return;

  // Compile params object from dataview entry.
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