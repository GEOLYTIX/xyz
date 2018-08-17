// The svg_symbols module is required in order to build svg symbols when they are evaluated in _xyz application settings.
//const svg_symbols = require('./svg_symbols');

// import * as _utils from './_utils';

module.exports = (next, token) => {

    let xhr = new XMLHttpRequest();

    xhr.open('GET', document.head.dataset.dir + '/workspace/get?token=' + token);

    xhr.onload = e => {
        
        const _xyz = JSON.parse(e.target.response);
        _xyz.token = token;
        _xyz.view_mode = document.body.dataset.viewmode;
        _xyz.host = document.head.dataset.dir;
        global._xyz = _xyz;
        next();
    }

    xhr.send();
}