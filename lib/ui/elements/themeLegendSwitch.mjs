/**
### /ui/elements/themeLegendSwitch

The module exports a method to create a switch for theme legends.

@module /ui/elements/themeLegendSwitch
*/

/**
@function themeLegendSwitch

@description
The method returns a HTMLElement with a button which toggles all label elements in the legend.

@returns {HTMLElement} HTMLElement with nested button.
*/

export default function themeLegendSwitch() {
  return mapp.utils.html`<div
  class="switch-all"
  style="grid-column: 1/3;">
  ${mapp.dictionary.layer_style_switch_caption}
  <button
    class="bold"
    onclick=${(e) => {
      const allSwitches = [
        ...e.target.closest('.legend').querySelectorAll('.switch'),
      ];
      const disabledSwitches = allSwitches.filter((switch_) =>
        switch_.classList.contains('disabled'),
      );

      if (
        disabledSwitches.length == 0 ||
        disabledSwitches.length == allSwitches.length
      ) {
        // if all switches are either enabled or disabled, click on all
        allSwitches.forEach((switch_) => switch_.click());
      } else {
        // if only some of them are enabled, click only on disabled ones
        disabledSwitches.forEach((switch_) => switch_.click());
      }
    }}>${mapp.dictionary.layer_style_switch_all}</button>.`;
}
