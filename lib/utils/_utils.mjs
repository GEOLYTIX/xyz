export {default as svg_symbols} from './svg_symbols.mjs';

export {default as paramString} from './paramString.mjs';

export {loadScript} from './loadScript.mjs';

export {toggleExpanderParent} from './toggleExpanderParent.mjs';

export {copyToClipboard} from './copyToClipboard.mjs';

export {createElement} from './createElement.mjs';

export {dataURLtoBlob} from './dataURLtoBlob.mjs';

export {getCircularReplacer} from './getCircularReplacer.mjs';

export const compose = (...fns) => p => fns.forEach(f=>f(p));

export const touch = () => ('ontouchstart' in window) ||
  (navigator.maxTouchPoints > 0) ||
  (navigator.msMaxTouchPoints > 0); 

export {flatpickr, formatDate, formatDateTime, meltDateStr} from './datePicker.mjs';

export {render, html, svg} from 'uhtml';

export {TabulatorFormatter} from './TabulatorFormatter.mjs';

export {default as Chroma} from 'chroma-js';

export {default as JWTDecode} from 'jwt-decode';

import 'chartjs-plugin-datalabels';

import 'chartjs-plugin-annotation';

import pointOnFeature from '@turf/point-on-feature';

import kinks from '@turf/kinks';

import flatten from '@turf/flatten';

export const turf = {
  pointOnFeature: pointOnFeature,
  kinks: kinks,
  flatten: flatten
};

export {default as cloneDeep} from 'lodash/cloneDeep.js';