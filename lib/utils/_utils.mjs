export {default as svg_symbols} from './svg_symbols.mjs';

export {default as paramString} from './paramString.mjs';

export {loadScript} from './loadScript.mjs';

export {toggleExpanderParent} from './toggleExpanderParent.mjs';

export {copyToClipboard} from './copyToClipboard.mjs';

export {createElement} from './createElement.mjs';

export {dataURLtoBlob} from './dataURLtoBlob.mjs';

export {getCircularReplacer} from './getCircularReplacer.mjs';

export {deepMerge} from './deepMerge.mjs';

export const compose = (...fns) => p => fns.forEach(f=>f(p));

export const touch = () => ('ontouchstart' in window) ||
  (navigator.maxTouchPoints > 0) ||
  (navigator.msMaxTouchPoints > 0); 

export {flatpickr, formatDate, formatDateTime, meltDateStr} from './datePicker.mjs';

export {wire, bind} from 'hyperhtml/esm';

export {default as Tabulator} from 'tabulator-tables';

export {TabulatorFormatter} from './TabulatorFormatter.mjs';

export {default as Chroma} from 'chroma-js';

export {default as Chart} from 'chart.js';

export {default as JWTDecode} from 'jwt-decode';

import 'chartjs-plugin-datalabels';

import pointOnFeature from '@turf/point-on-feature';

import kinks from '@turf/kinks';

import flatten from '@turf/flatten';

export const turf = {
  pointOnFeature: pointOnFeature,
  kinks: kinks.default,
  flatten: flatten
};

export {default as cloneDeep} from 'lodash/cloneDeep';