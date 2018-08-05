// The svg_symbols module is required in order to build svg symbols when they are evaluated in _xyz application settings.
const svg_symbols = require('./svg_symbols');

module.exports = init => {

    let xhr = new XMLHttpRequest();

    // let host = document.URL.split('?')[0].replace(window.origin, '');
    // host = host === '/' ? '' : host;

    xhr.open('GET', document.head.dataset.dir + '/workspace/get?noredirect=true');

    xhr.onload = e => {
        
        const _xyz = JSON.parse(e.target.response);

        // Evaluates _xyz application settings.
        (function objectEval(_xyz) {
            Object.keys(_xyz).map(key => {
                if (typeof _xyz[key] === 'string') {
                    try {
                        let tmp = eval(_xyz[key]);
                        _xyz[key] = typeof tmp != 'undefined' ? tmp : _xyz[key];
                    }
                    catch (err) {
                        //console.error(err);
                    }
                }
                if (_xyz[key] && typeof _xyz[key] === 'object') objectEval(_xyz[key]);
            })
        })(_xyz)

        _xyz.view_mode = document.body.dataset.viewmode;
        _xyz.host = document.head.dataset.dir;
        global._xyz = _xyz;
        init();
    }

    xhr.send();
}