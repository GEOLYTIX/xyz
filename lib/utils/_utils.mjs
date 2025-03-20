/**
## mapp.utils{}

@module /utils
*/

// import from node modules
import { render, html, svg } from 'uhtml';

import esmImport from './esmImport.mjs';

/**
@function simpleStatistics
@async

@description
The method import the [simple-statistics]{@link https://www.npmjs.com/package/simple-statistics} module through the esmImport utility.

@returns {Promise<Module>} The promise resolves to the simple-statistics module.
*/
async function simpleStatistics() {
  return await esmImport('simple-statistics@7.8.8');
}

/**
## mapp.utils.areSetsEqual()
@function areSetsEqual
@memberof module:/utils
*/
const areSetsEqual = (a, b) =>
  a.size === b.size && [...a].every((value) => b.has(value));

import csvDownload from './csvDownload.mjs';

import csvUpload from './csvUpload.mjs';

import compose from './compose.mjs';

import convert from './convert.mjs';

import { copyToClipboard } from './copyToClipboard.mjs';

import { dataURLtoBlob } from './dataURLtoBlob.mjs';

import { default as hexa } from './hexa.mjs';

import jsonParser from './jsonParser.mjs';

import { keyvalue_dictionary } from './keyvalue_dictionary.mjs';

import loadPlugins from './loadPlugins.mjs';

import getCurrentPosition from './getCurrentPosition.mjs';

import merge from './merge.mjs';

import mobile from './mobile.mjs';

import olScript from './olScript.mjs';

import paramString from './paramString.mjs';

import { polygonIntersectFeatures } from './polygonIntersectFeatures.mjs';

import promiseAll from './promiseAll.mjs';

import queryParams from './queryParams.mjs';

import style from './olStyle.mjs';

import * as svgSymbols from './svgSymbols.mjs';

import svgTemplates from './svgTemplates.mjs';

import textFile from './textFile.mjs';

import * as userIndexedDB from './userIndexedDB.mjs';

import * as userLocale from './userLocale.mjs';

import * as gazetteer from './gazetteer.mjs';

import { default as verticeGeoms } from './verticeGeoms.mjs';

import { xhr } from './xhr.mjs';

import {
  formatNumericValue,
  unformatStringValue,
} from './numericFormatter.mjs';

import { versionCheck } from './versionCheck.mjs';

import { temporal } from './temporal.mjs';

export default {
  render,
  html,
  svg,
  areSetsEqual,
  compose,
  convert,
  copyToClipboard,
  csvDownload,
  csvUpload,
  dataURLtoBlob,
  esmImport,
  formatNumericValue,
  unformatStringValue,
  gazetteer,
  getCurrentPosition,
  hexa,
  jsonParser,
  keyvalue_dictionary,
  loadPlugins,
  merge,
  mobile,
  olScript,
  paramString,
  polygonIntersectFeatures,
  promiseAll,
  queryParams,
  simpleStatistics,
  style,
  svgSymbols,
  svgTemplates,
  temporal,
  textFile,
  userIndexedDB,
  userLocale,
  verticeGeoms,
  xhr,
  versionCheck,
};
