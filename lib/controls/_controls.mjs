/**
## /ui/elements

The module exports a collection of control modules.

@module /controls

@requires module:/controls/gazetteer
@requires module:/controls/layers

*/
import gazetteer from './gazetteer.mjs';
import listViewPanel from './listView.mjs';

export default {
  gazetteer,
  layers: listViewPanel,
  locations: listViewPanel,
  loadControls,
};

/**
 @function loadControls

 Calls the functions associated with the values specified in locale.controls.

 ```JSON
  locale: {
    controls: ["<control_name>", {"key": <second_control>}]
  }
 ```
 controls are specified as:
 ```JSON
  locale: {
    <control_name>: {},
    <second_cotnrol>: {}
  }
 ```
 where <control_name> is the key of the control element.

 The controls that will be loaded are specified in `locale.controls`.

 @param {Object} mapview The mapview object.
 @property {locale} mapview.locale The locale the controls are specified in.
*/
function loadControls(mapview) {
  const controls = mapview.locale.controls;
  for (const control of controls) {
    const func = control.key || control;
    if (!mapview.locale[func]) continue;

    if (!mapp.controls[func]) {
      console.warn(`missing control function: ${func}`);
      continue;
    }

    const functionParams = mapview.locale[func];

    //Assign default panels as target if none specified.
    functionParams.target ??= mapview.controlPanels.querySelector(`#${func}`);

    //transfrom string targets into html elements.
    functionParams.target =
      functionParams.target instanceof HTMLElement
        ? functionParams.target
        : document.getElementById(functionParams.target);

    //Call the function with a set of parameters.
    //The target for the function is the panel associated
    //with the tab.
    mapp.controls[func]({
      ...functionParams,
      mapview,
      functionKey: func,
    });
  }
}
