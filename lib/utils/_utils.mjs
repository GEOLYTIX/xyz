/**
## mapp.utils{}

@module /utils
*/

// import from node modules
import {render, html, svg} from 'uhtml'

import * as stats from 'simple-statistics'

/**
## mapp.utils.areSetsEqual()
@function areSetsEqual
@memberof module:/utils
*/
const areSetsEqual = (a, b) => a.size === b.size && [...a].every(value => b.has(value))

import csvDownload from './csvDownload.mjs'

/**
## mapp.utils.compose()
@function compose
@memberof module:/utils
*/
const compose = (...fns) => {
  return arg => fns.reduce((acc, fn) => {
    return fn(acc);
  }, arg)
}

/**
## mapp.utils.olScript()
Import ol script through scrit tag in promise.
@function olScript
@memberof module:/utils
*/
const olScript = async() => await new Promise(async resolve => {

  const script = document.createElement('script')

  script.type = 'application/javascript'

  script.src = 'https://cdn.jsdelivr.net/npm/ol@v9.0.0/dist/ol.js'

  script.onload = resolve

  document.head.append(script)

  console.warn('Openlayers library loaded from script tag.')
})

import convert from './convert.mjs'

import {copyToClipboard} from './copyToClipboard.mjs'

import {dataURLtoBlob} from './dataURLtoBlob.mjs'

import {default as hexa} from './hexa.mjs'

import loadPlugins from './loadPlugins.mjs'

import getCurrentPosition from './getCurrentPosition.mjs'

import merge from './merge.mjs'

import paramString from './paramString.mjs'

import promiseAll from './promiseAll.mjs'

import queryParams from './queryParams.mjs'

import style from './olStyle.mjs'

import * as svgSymbols from './svgSymbols.mjs'

import * as gazetteer from './gazetteer.mjs'

import {default as verticeGeoms} from './verticeGeoms.mjs'

import xhr from './xhr.mjs'

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
  gazetteer,
  getCurrentPosition,
  hexa,
  loadPlugins,
  merge,
  olScript,
  paramString,
  promiseAll,
  queryParams,
  style,
  svgSymbols,
  verticeGeoms,
  xhr,
}