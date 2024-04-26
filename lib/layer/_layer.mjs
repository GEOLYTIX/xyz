/**
## mapp.layer{}
This module exports methods to decorate layer objects.
@module /layer
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

/**
@function layer
@property {function} decorate - A function to decorate layer objects.
@property {function} changeEnd - A function to add the changeEnd event.
@property {Object} formats - An object containing layer format modules.
@property {Object} featureFormats - An object containing feature format modules.
@property {Object} featureFields - An object containing feature field modules.
@property {function} featureHover - A function to handle feature hover interactions.
@property {function} featureFilter - A function to filter features.
@property {function} featureStyle - A function to style features.
@property {function} fade - A function to apply fade effects to layers.
@property {function} styleParser - A function to parse layer styles.
@property {Object} themes - An object containing theme modules.
@property {function} themes.categorized - A function to apply a categorized theme to features.
@property {function} themes.distributed - A function to apply a distributed theme to features.
@property {function} themes.graduated - A function to apply a graduated theme to features.
 */
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
  themes: {
    basic,
    categorized,
    distributed,
    graduated
  }
};