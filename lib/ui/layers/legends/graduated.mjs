/**
### /ui/layers/legends/graduated

The graduated theme legend module exports the graduatedTheme to the `ui.layers.legend{}` library object.

@requires /ui/elements/legendIcon

@module /ui/layers/legends/graduated
*/

/**
@function graduatedTheme

@description
The graduatedTheme method creates a `catElements[]` array with icons for each graduated theme category. The elements array is passed into a legend element assigned as `layer.style.legend` and returned from the method.

@param {layer} layer The decorated mapp layer.

@returns {HTMLElement} The graduated theme legend element.
*/

export default function graduatedTheme(layer) {
  const theme = layer.style.theme;

  theme.legend ??= {};

  // Switch all control
  const switchAll = mapp.utils.html`<div
    class="switch-all"
    style="grid-column: 1/3;">
    ${mapp.dictionary.layer_style_switch_caption}
    <button
      class="primary-colour bold"
      onclick=${e => {

        const allSwitches = [...e.target.closest('.legend').querySelectorAll('.switch')];
        const disabledSwitches = allSwitches.filter((switch_) => switch_.classList.contains('disabled'));

        if (disabledSwitches.length == 0 || disabledSwitches.length == allSwitches.length) {

          // if all switches are either enabled or disabled, click on all 
          allSwitches.forEach(switch_ => switch_.click());

        } else {

          // if only some of them are enabled, click only on disabled ones
          disabledSwitches.forEach(switch_ => switch_.click());
        }

      }}>${mapp.dictionary.layer_style_switch_all}</button>.`

  const catElements = theme.categories
    .filter((cat) => cat.value !== undefined)
    .map((cat) => {
      const catClass = `contents ${
        theme.legend?.horizontal ? 'horizontal' : ''
      }`;

      const catIcon = mapp.ui.elements.legendIcon({
        width: 24,
        height: 24,
        ...(cat._style || cat.style),
      });

      cat.label ??= cat.value;

      const labelClassList = `label switch ${cat.disabled ? 'disabled' : ''}`

      return mapp.utils.html`<div 
        data-id=${cat.value}
        class=${catClass}>
        <div 
          style="height: 24px; width: 24px; grid-column: 1;">
          ${catIcon}
        </div>
          <div 
            class=${labelClassList}
            style="grid-column: 2;"
            onclick=${(e) => catToggle(e, layer, cat)}>
            ${cat.label}`;
    });

  const classList = `contents-wrapper ${theme.legend?.layout || 'grid'} ${
    theme.legend?.nowrap ? 'nowrap' : ''
  }`;

  theme.legend.node = mapp.utils.html.node`
    <div class="legend">
      ${switchAll}
      <div class=${classList}>
        ${catElements}
      </div>`;

  layer.style.legend ??= theme.legend.node;

  if (layer.style.legend) {
    layer.style.legend.replaceChildren(...theme.legend.node.children);
  }

  return theme.legend.node;
}

/**
@function catToggle

@description
The method toggles the disabled class on the event target element.

If toggled [on] the style will be set to null.

The cat style will be restored if toggled off.

@param {Event} e The cat label click event.
@param {layer} layer The decorated mapp layer.
@param {object} cat The cat object from the theme.
*/
function catToggle(e, layer, cat) {
  const toggle = e.target.classList.toggle('disabled');

  if (toggle) {
    cat.disabled = true;

    // Store style to toggle on.
    cat._style = cat.style;

    // The feature should not be rendered.
    cat.style = null;
  } else {
    delete cat.disabled;

    cat.style = cat._style;

    delete cat._style;
  }

  layer.L.changed();
}
