/*import style from './style.mjs';

export default (layer) => { return style(layer) };*/ // this works

import _polygon from './polygon.mjs';

export function polygon(e, layer){
    _polygon(e, layer);
    //console.log(layer);
    //console.log(e);
};