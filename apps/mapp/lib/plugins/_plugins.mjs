/**
## /plugins

The module exports a collection of core mapp plugins.

Plugins which add buttons to the mapview.mapButton element are ui plugins.

@module /plugins

@requires module:/plugins/consent
@requires module:/plugins/layer_order
@requires module:/plugins/svg_templates
*/

import { svgTemplates } from '../utils/svgTemplates.mjs';
import { consent } from './consent.mjs';
import { layer_order } from './layer_order.mjs';
import { test } from './test.mjs';

/**
@typedef {Object} plugins
@property {function} consent The consent plugin module.
@property {function} layer_order The layer_order plugin module.
@property {function} svgTemplates The svg_templates plugin module.
*/

const plugins = {
  consent,
  layer_order,
  svg_templates: svgTemplates,
  test,
};

export default plugins;
