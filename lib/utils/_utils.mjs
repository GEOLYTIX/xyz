// import from node modules
import {render, html, svg} from 'uhtml'

const areSetsEqual = (a, b) => a.size === b.size && [...a].every(value => b.has(value))

// local import
import clone from './clone.mjs'

const compose = (...fns) => {
  return arg => fns.reduce((acc, fn) => {
    return fn(acc);
  }, arg)
}

// Import ol script through scrit tag in promise.
const olScript = async() => await new Promise(async resolve => {

  const script = document.createElement("script")

  script.type = 'application/javascript'

  script.src = 'https://cdn.jsdelivr.net/npm/ol@v7.1.0/dist/ol.js'

  script.onload = resolve

  document.head.append(script)
})

import convert from './convert.mjs'

import {copyToClipboard} from './copyToClipboard.mjs'

import {dataURLtoBlob} from './dataURLtoBlob.mjs'

import here from './here.mjs'

import {default as hexa} from './hexa.mjs'

import loadPlugins from './loadPlugins.mjs'

import mapboxGeometryFunction from './mapboxGeometryFunction.mjs'

import getCurrentPosition from './getCurrentPosition.mjs'

import merge from './merge.mjs'

import paramString from './paramString.mjs'

import promiseAll from './promiseAll.mjs'

import queryParams from './queryParams.mjs'

import style from './style.mjs'

import * as svgSymbols from './svgSymbols.mjs'

import {default as verticeGeoms} from './verticeGeoms.mjs'

import xhr from './xhr.mjs'

export default {
  render,
  html,
  svg,
  convert,
  areSetsEqual,
  clone,
  compose,
  copyToClipboard,
  dataURLtoBlob,
  getCurrentPosition,
  here,
  hexa,
  loadPlugins,
  mapboxGeometryFunction,
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