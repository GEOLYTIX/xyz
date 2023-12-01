// Assign and returns legend to the layer.style object.
export default (layer) => {

  const theme = layer.style.theme

  theme.legend ??= {}

  // Apply dynamic legend methods.
  dynamicLegend(layer)

  theme.legend.grid = []

  // Make 'left' default alignment.
  theme.legend.alignContents ??= 'left'
  theme.legend.alignContents += ' contents'

  let timeout;

  // Switch all control
  theme.legend.switch = layer.filter &&
    mapp.utils.html`
      <div
        class="switch-all"
        style="grid-column: 1/3;">
        ${mapp.dictionary.layer_style_switch_caption}
        <button
          class="primary-colour bold"
          onclick=${e => {

            let allSwitches = [...e.target.closest('.legend').querySelectorAll('.switch')];
            let disabledSwitches = allSwitches.filter((switch_) => switch_.classList.contains('disabled'));

            if (disabledSwitches.length == 0 || disabledSwitches.length == allSwitches.length) {

              // if all switches are either enabled or disabled, click on all 
              allSwitches.forEach(switch_ => switch_.click());

            } else {

              // if only some of them are enabled, click only on disabled ones
              disabledSwitches.forEach(switch_ => switch_.click());
            }

          }}>${mapp.dictionary.layer_style_switch_all}
        </button>.`

  Object.entries(theme.cat).forEach(cat => {

    // Icon has not been defined inside a style block.
    if (cat[1].icon) {

      cat[1].style = {...cat[1].style, icon: cat[1].icon}
    }

    const cat_style = Array.isArray(cat[1].style?.icon)

      // Array style icons cannot be assigned to the default.
      ? cat[1].style

      // Assign icon, or style as icon, or cat to the layer style default.
      : Object.assign({},
        layer.style.default,
        cat[1].style || cat[1].icon || cat[1]);

    if (!cat[1].style?.icon) delete cat_style.icon;

    // Cat icon.
    let icon = mapp.utils.html`
      <div
        style="height: 24px; width: 24px; grid-column: 1;">
        ${mapp.ui.elements.legendIcon({
          width: 24,
          height: 24,
          ...cat_style})}`;

    // Cat label with filter function.
    let label = mapp.utils.html`
      <div
        class=${`label ${layer.filter && 'switch' ||''} ${

          // Check whether cat is in current filter.
          layer.filter?.current[theme.field]?.ni?.indexOf(cat[0]) >= 0 ? 'disabled' : ''
        }`}
        style="grid-column: 2;"
        onclick=${e => {

          if (!layer.filter) return;

          e.target.classList.toggle('disabled')

          // Add cat value to current NI (not in) field filter.
          if (e.target.classList.contains('disabled')) {

            // Create empty field filter object if non exists.
            if (!layer.filter.current[theme.field]) {
              layer.filter.current[theme.field] = {}
            }

            // Create empty NI filter array for field if non exists.
            if (!layer.filter.current[theme.field].ni) {
              layer.filter.current[theme.field].ni = []
            }

            // Push cat value into the NI filter array.
            layer.filter
              .current[theme.field].ni
              .push(cat[1].keys || cat[0])
           
            // Flatten the filter in case of arrays filter.
            layer.filter
              .current[theme.field].ni = layer.filter.current[theme.field].ni.flat()

          // Remove cat value from current NI field filter.
          } else {

            if (Array.isArray(cat[1].keys)) {

              cat[1].keys.forEach(key => {

                // Splice key out of the NI array.
                layer.filter
                  .current[theme.field].ni
                  .splice(layer.filter.current[theme.field].ni.indexOf(key), 1)

              })

            } else {

              // Splice value out of the NI array.
              layer.filter
                .current[theme.field].ni
                .splice(layer.filter.current[theme.field].ni.indexOf(cat[0]), 1)

            }
 
            // Delete current field filter if NI array is empty.
            if (!layer.filter.current[theme.field].ni.length) {
              delete layer.filter.current[theme.field]
            }
          }

          if (timeout) clearTimeout(timeout)

          timeout = setTimeout(() => {

            // theme flag is set in styles or theme.
            (layer.style.filter || theme.filter)
              ? layer.L.changed()
              : layer.reload()

          }, 400)

        }}>${cat[1].label || cat[0]}`

    cat[1].node = mapp.utils.html.node`
    <div
      data-id=${cat[0]}
      class="${theme.legend.alignContents}">
      ${icon}${label}`

    // Push icon and label into legend grid.
    theme.legend.grid.push(cat[1].node)
  })

  // Attach row for cluster locations.
  if (layer.style.cluster) {

    // Create cluster icon.
    let icon = mapp.utils.html`
      <div
        style="height: 40px; width: 40px;">
        ${mapp.ui.elements.legendIcon({
          width: 40,
          height: 40,
          ...layer.style.default,
          ...layer.style.cluster
        })}`
   
    // Create cluster label.
    let label = mapp.utils.html`
      <div
        class="label">
        ${mapp.dictionary.layer_style_cluster}`

    // Push icon and label into legend grid.
    theme.legend.grid.push(mapp.utils.html`
      <div 
        data-id="cluster"
        class=${theme.legend.alignContents}>
        ${icon}${label}`)
  }

  // Default layout to 'grid'
  theme.legend.layout ??= 'grid'

  theme.legend.node = mapp.utils.html.node`
    <div class="legend-wrapper">
      ${theme.legend.switch || ''}
      <div class=${`contents-wrapper ${theme.legend.layout}`}>
        ${theme.legend.grid}`

  layer.style.legend = theme.legend.node

  return layer.style.legend;
}

function dynamicLegend(layer) {

  // shortcircuit if legend is not dynamic.
  if (!layer.style.theme?.legend?.dynamic) return;

  layer.L.once('prerender', prerender)

  function prerender() {

    // shortcircuit if legend is no longer dynamic.
    if (!layer.style.theme?.legend?.dynamic) return;

    // Do not display cat which are disabled/filtered.
    Object.values(layer.style.theme.cat).forEach(cat => {
      if (cat.node.querySelector('.disabled')) return;
      cat.display = 'none'
    })

    layer.L.once('postrender', () => {

      // timeout to allow for the render method to process categories.
      setTimeout(() => {

        // shortcircuit if legend is no longer dynamic.
        if (!layer.style.theme?.legend?.dynamic) return;

        Object.values(layer.style.theme.cat).forEach(cat => {
          cat.node.style.display = cat.display
        })
        
        layer.L.once('prerender', prerender)

      }, 400)
    })

    // Will trigger styling/(post)render
    layer.L.changed()
  }
}