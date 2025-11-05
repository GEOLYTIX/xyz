/**
## /ui/elements

The module exports a collection of control modules.

@module /ui/elements

@requires module:/controls/gazetteer

*/
import gazetteer from './gazetteer.mjs';
import layers from './layers.mjs';

export default {
  gazetteer,
  layers,
  loadControls,
};

function loadControls(mapview) {
  const controls = mapview.locale.controls;
  for (const control of controls) {
    const func = control.key || control;
    if (!mapview.locale[func]) continue;

    if (!mapp.controls[func]) {
      console.warn(`missing control function: ${control}`);
      continue;
    }

    const functionParams = mapview.locale[func];

    mapp.controls[func]({
      ...functionParams,
      mapview,
      target: document.getElementById(`${func}`),
    });
  }
}
