/**
## mapp.utils{}

@module /utils
*/

import esmImport from './esmImport.mjs';
import { html, render, svg } from './uhtml.mjs';

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
@function olScript
@async
@memberof module:/utils

@description
The olScript uses the scriptElement utility method to load the Openlayers Application script.
*/
async function olScript() {
  await mapp.utils.scriptElement(
    'https://cdn.jsdelivr.net/npm/ol@v10.6.1/dist/ol.js',
    'application/javascript',
  );
}

/**
@function areSetsEqual
@memberof module:/utils
*/
const areSetsEqual = (a, b) =>
  a.size === b.size && [...a].every((value) => b.has(value));

import compose from './compose.mjs';
import convert from './convert.mjs';
import copyToClipboard from './copyToClipboard.mjs';
import csvDownload from './csvDownload.mjs';
import csvUpload from './csvUpload.mjs';
import { dataURLtoBlob } from './dataURLtoBlob.mjs';
import * as gazetteer from './gazetteer.mjs';
import getCurrentPosition from './getCurrentPosition.mjs';
import { default as hexa } from './hexa.mjs';
import jsonParser from './jsonParser.mjs';
import { keyvalue_dictionary } from './keyvalue_dictionary.mjs';
import loadDictionary from './loadDictionary.mjs';
import loadPlugins from './loadPlugins.mjs';
import merge from './merge.mjs';
import mobile from './mobile.mjs';
import {
  formatNumericValue,
  unformatStringValue,
} from './numericFormatter.mjs';
import style from './olStyle.mjs';
import paramString from './paramString.mjs';
import ping from './ping.mjs';
import { polygonIntersectFeatures } from './polygonIntersectFeatures.mjs';
import promiseAll from './promiseAll.mjs';
import queryParams from './queryParams.mjs';
import scriptElement from './scriptElement.mjs';
import * as svgSymbols from './svgSymbols.mjs';
import svgTemplates from './svgTemplates.mjs';
import { temporal } from './temporal.mjs';
import textFile from './textFile.mjs';
import * as userIndexedDB from './userIndexedDB.mjs';
import * as userLocale from './userLocale.mjs';
import { versionCheck } from './versionCheck.mjs';
import { default as verticeGeoms } from './verticeGeoms.mjs';
import { xhr } from './xhr.mjs';

export default {
  areSetsEqual,
  compose,
  convert,
  copyToClipboard,
  csvDownload,
  csvUpload,
  dataURLtoBlob,
  esmImport,
  formatNumericValue,
  gazetteer,
  getCurrentPosition,
  hexa,
  html,
  jsonParser,
  keyvalue_dictionary,
  loadDictionary,
  loadPlugins,
  merge,
  mobile,
  olScript,
  paramString,
  ping,
  polygonIntersectFeatures,
  promiseAll,
  queryParams,
  render,
  scriptElement,
  simpleStatistics,
  style,
  svg,
  svgSymbols,
  svgTemplates,
  temporal,
  textFile,
  unformatStringValue,
  userIndexedDB,
  userLocale,
  versionCheck,
  verticeGeoms,
  xhr,
};
