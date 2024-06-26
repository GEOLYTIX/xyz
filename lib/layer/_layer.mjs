/**
## mapp.layer{}

The individual mapp layer modules are exported as mapp.layer{} object to the mapp library module.

@module /layer
*/

/**
@global
@typedef {Object} layer
@description
A mapp-layer object is a decorated JSON layer object which has been added to a mapview.

@property {boolean} display Whether the layer should be displayed.
@property {layer-style} style The mapp-layer style configuration.
@property {layer-cluster} [cluster] Point layer cluster configuration.
*/

import decorate from './decorate.mjs';
import formats from './format/_format.mjs';
import fade from './fade.mjs';
import changeEnd from './changeEnd.mjs'
import featureHover from './featureHover.mjs';
import featureFilter from './featureFilter.mjs';
import * as featureFormats from './featureFormats.mjs';
import * as featureFields from './featureFields.mjs';
import featureStyle from './featureStyle.mjs';
import styleParser from './styleParser.mjs';
import basic from './themes/basic.mjs';
import categorized from './themes/categorized.mjs';
import distributed from './themes/distributed.mjs';
import graduated from './themes/graduated.mjs';

export default {
  decorate,
  changeEnd,
  formats,
  featureFormats,
  featureFields,
  featureHover,
  featureFilter,
  featureStyle,
  fade,
  styleParser,
  Style,
  themes: {
    basic,
    categorized,
    distributed,
    graduated
  }
};

/**
@function Style
@deprecated

@description
The deprectaed mapp.layer.Style() method will warn if use and return the featureStyle() method which supersedes the Style() method.

@param {Object} layer 

@return {Function} featureStyle
*/

function Style(layer) {
  console.warn(`The mapp.layer.Style() method has been superseeded by the mapp.layer.featureStyle() method.`)
  return featureStyle(layer)
}