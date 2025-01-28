/**
## mapp.layer{}

The individual mapp layer modules are exported as mapp.layer{} object to the mapp library module.

@module /layer
*/

/**
@global
@typedef {Object} layer
A mapp-layer object is a decorated JSON layer object which has been added to a mapview.
@property {string} layer.srid='3857' Feature layer require a spatial reference identifier (SRID).
@property {object} layer.L Openlayers Layer object.
@property {boolean} layer.display Whether the layer should be displayed.
@property {layer-style} layer.style The mapp-layer style configuration.
@property {string} layer.format The format of the layer data.
@property {layer-cluster} [layer.cluster] Point layer cluster configuration.
@property {string} [layer.table] Table name for layer features.
@property {Array} [layer.tables] An array of tables for different zoom level.
@property {number} [layer.zIndex] The zIndex for the layer canvas element.
@property {Object} layer.mapview mapview typedef object.
*/

import decorate from './decorate.mjs';
import formats from './format/_format.mjs';
import fade from './fade.mjs';
import featureHover from './featureHover.mjs';
import * as featureFormats from './featureFormats.mjs';
import * as featureFields from './featureFields.mjs';
import featureStyle from './featureStyle.mjs';
import styleParser from './styleParser.mjs';
import basic from './themes/basic.mjs';
import categorized from './themes/categorized.mjs';
import distributed from './themes/distributed.mjs';
import graduated from './themes/graduated.mjs';
import { parseObject } from '../plugins/keyvalue_dictionary.mjs';

export default {
  decorate,
  formats,
  featureFormats,
  featureFields,
  featureHover,
  featureStyle,
  fade,
  keyvalue_dictionary,
  styleParser,
  Style,
  themes: {
    basic,
    categorized,
    distributed,
    graduated,
  },
};

/**
@function Style
@deprecated

@description
The deprecated `mapp.layer.Style()` method will warn if used and return the `featureStyle()` method which supersedes this method.

@param {Object} layer 

@return {Function} featureStyle
*/
function Style(layer) {
  console.warn(
    `The mapp.layer.Style() method has been superseeded by the mapp.layer.featureStyle() method.`,
  );
  return featureStyle(layer);
}
