import _xyz from '../../../_xyz.mjs';
import _polygon from './polygon.mjs';
import _rect from './rectangle.mjs';
import _circle from './circle.mjs';
import _line from './line.mjs';
import _point from './point.mjs';

export function point(e, layer){
    _point(e, layer);
}

export function polygon(e, layer){
    _polygon(e, layer);
};

export function rect(e, layer){
    _rect(e, layer);
};

export function circle(e, layer){
    _circle(e, layer);
}

export function line(e, layer){
    _line(e, layer);
}

export function switchState(btn){
    if (_xyz.state == btn) {
        btn.classList.remove('active');
        _xyz.dom.map.style.cursor = '';
        return _xyz.state = 'select';
      }

    if (_xyz.state !== 'select') _xyz.state.classList.remove('active');



    _xyz.state = btn;
    _xyz.dom.map.style.cursor = 'crosshair';
    _xyz.state.classList.add('active');
}