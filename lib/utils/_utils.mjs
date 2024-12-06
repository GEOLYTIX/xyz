/**
## mapp.utils{}

@module /utils
*/

// import from node modules
import { render, html, svg } from 'uhtml'

import * as stats from 'simple-statistics'

/**
## mapp.utils.areSetsEqual()
@function areSetsEqual
@memberof module:/utils
*/
const areSetsEqual = (a, b) => a.size === b.size && [...a].every(value => b.has(value))

import csvDownload from './csvDownload.mjs'

import compose from './compose.mjs'

import convert from './convert.mjs'

import { copyToClipboard } from './copyToClipboard.mjs'

import { dataURLtoBlob } from './dataURLtoBlob.mjs'

import { default as hexa } from './hexa.mjs'

import jsonParser from './jsonParser.mjs'

import loadPlugins from './loadPlugins.mjs'

import getCurrentPosition from './getCurrentPosition.mjs'

import merge from './merge.mjs'

import mobile from './mobile.mjs';

import olScript from './olScript.mjs'

import paramString from './paramString.mjs'

import { polygonIntersectFeatures } from './polygonIntersectFeatures.mjs'

import promiseAll from './promiseAll.mjs'

import queryParams from './queryParams.mjs'

import style from './olStyle.mjs'

import * as svgSymbols from './svgSymbols.mjs'

import svgTemplates from './svgTemplates.mjs'

import textFile from './textFile.mjs'

import * as userIndexedDB from './userIndexedDB.mjs'

import * as userLocale from './userLocale.mjs'

import * as gazetteer from './gazetteer.mjs'

import { default as verticeGeoms } from './verticeGeoms.mjs'

import { xhr } from './xhr.mjs'

import { formatNumericValue, unformatStringValue } from './numericFormatter.mjs';

import { versionCheck } from './versionCheck.mjs';

export default {
  stats,
  render,
  html,
  svg,
  convert,
  areSetsEqual,
  compose,
  copyToClipboard,
  csvDownload,
  dataURLtoBlob,
  formatNumericValue,
  unformatStringValue,
  gazetteer,
  getCurrentPosition,
  hexa,
  jsonParser,
  loadPlugins,
  merge,
  mobile,
  olScript,
  paramString,
  polygonIntersectFeatures,
  promiseAll,
  queryParams,
  style,
  svgSymbols,
  svgTemplates,
  textFile,
  userIndexedDB,
  userLocale,
  verticeGeoms,
  xhr,
  versionCheck
}