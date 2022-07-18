export default (function(){

  mapp.plugins.hide_layers = (options, mapview) => {

    const btnColumn = document.getElementById("mapButton")

    if(!btnColumn) return;

    btnColumn.append(mapp.utils.html.node`
      <button
        title="Hide layer views which aren't displayed in the map view in the layer list view."
        onclick=${hide_layers}>
        <div class="mask-icon visibility-off">`);
  
    function hide_layers(e){
  
      // Is the button active?
      if (e.target.classList.contains('active')) {
  
        e.target.classList.remove('active')
  
        Object.values(mapview.layers).forEach(layer => {

          // Only layer views which are HTMLElements can be hidden.
          if (!layer.view instanceof HTMLElement) return;

          // Remove the display property set inline by this plugin.
          layer.view.style.removeProperty('display');

          // Check whether the layer has a group.
          if (!layer.group) return;

          // Remove the display property set inline by this plugin.
          layer.group.drawer.style.removeProperty('display')
    
        })

        return;
      }

      e.target.classList.add('active')

      Object.values(mapview.layers).forEach(layer => {

        // Do not hide layers that are visible.
        if (layer.display) return;

        // Layer must have a view to be hidden.
        if (!layer.view instanceof HTMLElement) return;

        // Hide the layer view.
        layer.view.style.display = 'none'
        
        // Does the layer have a group?
        if (!layer.group) return;

        // Does the layer group contain visible layer?
        if (layer.group.list.some(l => l.display === true)) return;

        // Hide an empty layer group.
        layer.group.drawer.style.display = 'none'
        
      })
     
    }
  }

})()