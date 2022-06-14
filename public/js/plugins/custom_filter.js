export default (function(){

  mapp.ui.layers.filters.foo = (layer, entry) => {

    return mapp.ui.elements.chkbox({
      label: 'foo',
      onchange: (checked) => {
        layer.filter.current[entry.filter.field] = {
          boolean: checked
        }
        layer.reload();
        layer.mapview.Map.getTargetElement().dispatchEvent(new Event('changeEnd'))
      }
    })
  }

})()