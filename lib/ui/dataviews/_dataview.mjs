import Table from './table.mjs'

import Chart from './chart.mjs'

import Toolbar from './toolbar.mjs'

export default async (_this) => {

  // Get _this.target by element ID if provided as string.
  _this.target = typeof _this.target === 'string' 
    && document.getElementById(_this.target)
    || _this.target

  // Assign _this.target div if not already defined.
  _this.target = _this.target instanceof HTMLElement
    && _this.target
    || mapp.utils.html.node`
      <div
        class="dataview-target"
        style="position: absolute; width: 100%; height: 100%">`

  // Update method for _this.
  _this.update = async () => {

    // Dataviews must not update without a query.
    if (!_this.query) return;

    const bounds = _this.viewport && _this.layer.mapview.getBounds();

    if (_this.viewport) _this.queryparams = Object.assign(_this.queryparams || {}, {layer: true})

    const center = _this.queryparams?.center && ol.proj.transform(
      _this.layer.mapview.Map.getView().getCenter(),
      `EPSG:${_xyz.mapview.srid}`,
      `EPSG:4326`)
  
    const paramString = mapp.utils.paramString(
      Object.assign(
        {},

        // queryparams will be assigned to the paramstring with explicit values.
        _this.queryparams || {},

        {
  
          // Queries will fail if the template can not be accessed in workspace.
          template: encodeURIComponent(_this.query),
      
          // Layer filter can only be applied if the layer is provided as reference to a layer object in the layers list.
          filter: _this.queryparams?.filter && _this.layer?.filter?.current,

          // Locale param is only required for layer lookups.
          layer: _this.queryparams?.layer && _this.layer.key,
    
          // Locale param is only required for layer lookups.
          locale: _this.queryparams?.layer && _this.layer.mapview.locale.key,
    
          // ID will be taken if a location object is provided with the params.
          id: _this.queryparams?.id && _this.location && _this.location.id,
    
          // lat lng must be explicit or the the center flag param must be set.
          lat: center && center[1],
          lng: center && center[0],
    
          // z will generated if the z flag is set in the params.
          z: _this.queryparams?.z && _this.layer.mapview.Map.getView().getZoom(),
    
          // Viewport will onlcy be generated if the viewport flag is set on the params.
          viewport: bounds && [bounds.west, bounds.south, bounds.east, bounds.north, _this.layer.mapview.srid]

        }))

    const response = await mapp.utils
      .xhr(`${_this.host || _this.location.layer.mapview.host}/api/query?`+paramString)

    if (response instanceof Error) return;

    if (typeof _this.responseFunction === 'function') return _this.responseFunction(response);
   
    typeof _this.setData === 'function' && _this.setData(response)
  };

  if (_this.toolbar) Toolbar(_this);

  // Create a ChartJS dataview is chart is defined.
  if (_this.chart) await Chart(_this);

  if (typeof _this.columns !== 'undefined') {
    console.warn('Table dataviews should be configured inside a tables object')

    _this.table = Object.assign(_this.table || {}, { columns: _this.columns })
  }

  // Create a Tabulator dataview if columns are defined.
  if (_this.table) await Table(_this);

  // Update the dataview on mapChange if set.
  _this.mapChange && _this.layer &&
    _this.layer.mapview.Map.getTargetElement().addEventListener('changeEnd', () => {

      // Only update dataview if corresponding layer is visible.
      if (_this.layer && !_this.layer.display) return;

      // Only update dataview if _this.tab is active.
      if (_this.tab && !_this.tab.classList.contains("active")) return;

      // Execute mapChange if defined as function or dataview update method.
      typeof _this.mapChange === 'function'
        && _this.mapChange()
        || _this.update();
    });

  return _this;

};