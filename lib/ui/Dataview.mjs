/**
## ui/Dataview

The ui Dataview module exports the Dataview method to decorate JSON dataview objects as mapp.ui.Dataview().

Different dataview types [eg. ChartJS, Tabulator-tables] require 3rd party libraries loaded via Mapp plugins.

@requires /utils/xhr

@module /ui/Dataview
*/

/**
@function Dataview

@description
The Dataview decorator method requires a JSON dataview object as argument to be decorated and returned.

The Dataview method will re-create the dataview if called with a decorated dataview object which has a create() method.

An ID lookup will be attempted if the dataview target is provided as a string value.

A default dataview update method will be assigned if not provided with the dataview configuration. The queryparams from the dataview layer and locale will be spread into the dataview queryparams object.

The displayDataview and hideDataview methods will be assigned after the dataview configuration has been checked.

The dataviewToolbar() method will be called prior to creating the dataview.

The dataview create method will be called.

The dataviewMapChange() method will be called after the dataview has been created.

@param {Object} _this Dataview object.
@param {HTMLElement} _this.target Dataview HTML Element target.
@param {string} _this.dataview The dataview type.
@param {Function} [_this.create] The dataview create method.
@param {Object} [_this.queryParams] Queryparams for dataview update query.
@return {Object} Decorated dataview object.
*/

export default function Dataview(_this) {

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

  _this.displayDataview ??= displayDataview
  _this.hideDataview ??= hideDataview

  // Create dataview toolbar
  dataviewToolbar(_this)
 
  _this.create();

  dataviewMapChange(_this)

  return _this;
};

/**
@function displayDataview

@description
The displayDataview method will show the dataview tab if in a tab view. The show() method only available for tabs will control the dataview update or reconstruction.

A dynamic dataview will be recreated. The dataview update method will be called with the reload flag.

The locationViewTarget element will be displayed.

@param {Object} _this Dataview object.
@param {Function} _this.create Dataview create method.
@param {boolean} [_this.dynamic] Dataview should be recreated.
@param {Function} _this.update Dataview update method.
@param {boolean} [_this.reload] Dataview should reload/update it's data from a query.
@param {Object} [_this.tabview] The dataview should be displayed in a tabview.
@param {HTMLElement} [_this.locationViewTarget] The dataview should be displayed in a location view.
*/

function displayDataview() {

  this.display = true

  if (this.tabview) {

    // Create tab after dataview creation is complete.
    this.tabview.dispatchEvent(new CustomEvent('addTab', {
      detail: this
    }))

    // The show method will update/recreate the dataview.
    this.show()

    return;
  }

  if (this.dynamic) {
    this.create()
    this.update()

  } else if (this.reload) {

    this.update()
  }

  if (this.locationViewTarget) {

    this.locationViewTarget.style.display = 'block'
  }
}

/**
@function hideDataview

@description
The displayDataview method will remove the dataview tab if in a tabview. The remove() method only available for tabs will be called.

The locationViewTarget element display style will be set to 'none'.

@param {Object} _this Dataview object.
@param {Object} [_this.tabview] The dataview tab should be removed it's tabview.
@param {HTMLElement} [_this.locationViewTarget] The dataview locationViewTarget should not be displayed.
*/

function hideDataview() {

  this.display = false

  if (this.locationViewTarget) {

    this.locationViewTarget.style.display = 'none'
  }

  if (this.tabview && typeof this.remove === 'function') {

    this.remove()
  }
}

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
@function updateDataview

@description
The dataview update method requires a query template to be executed with optional query parameter.

A parameterized query will passed as argument to the mapp.utils.xhr() utility method.

The query response will be provided as argument to the dataview's setData() method.

@param {Object} _this Dataview object.
@param {Function} _this.setData Dataview setData method.
@param {string} [_this.query] The dataview query template.
@param {string} [_this.queryParams] Parameter for the dataview. update query.
*/

async function updateDataview() {

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
@param {Function} _this.update The dataview update method.
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