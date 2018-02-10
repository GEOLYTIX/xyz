const utils = require('./utils');

module.exports = function(){

    // Create empty hooks object if not exists.
    if (!_xyz.hooks) _xyz.hooks = {};

    // Get hooks from URI and split into _xyz.hooks object
    let params = window.location.search.substring(1).split('&');
    if (params[0] !== '') {
        for (let i = 0; i < params.length; i++) {
            let key_val = params[i].split('=');
            _xyz.hooks[key_val[0]] = key_val[1].split(',');
            //_xyz.hooks[key_val[0]] = key_val[1];
        }
    }

    // if (hooks !== false) {
    //     _xyz.hooks = hooks
    //     try {
    //         history.pushState({ hooks: true }, 'hooks', '?' + utils.paramString(_xyz.hooks));
    //     } catch (me) {}
    // };

    // Set view hook containing lat, lng and zoom.
    _xyz.setViewHook = function (cntr) {
        _xyz.hooks.lat = cntr.lat;
        _xyz.hooks.lng = cntr.lng;
        _xyz.hooks.z = _xyz.map.getZoom();
        try {
            history.pushState({ hooks: true }, 'hooks', '?' + utils.paramString(_xyz.hooks));
        } catch (me) { }
    };

    // Add kvp hook to _xyz.hooks and URI.
    _xyz.setHook = function (key, val) {
        _xyz.hooks[key] = val;
        try {
            history.pushState({hooks: true}, 'hooks', '?' + utils.paramString(_xyz.hooks));
        } catch(me) {}
    };

    // Remove hook from _xyz.hooks and URI.
    _xyz.removeHook = function (key) {
        delete _xyz.hooks[key];
        try {
            history.pushState({hooks: true}, 'hooks', '?' + utils.paramString(_xyz.hooks));
        } catch(me) {}
    };

    // Remove all hooks.
    _xyz.removeHooks = function () {
        Object.keys(_xyz.hooks).map(function (key) {
            delete _xyz.hooks[key];
        });    
        try {
            history.pushState({ hooks: true }, 'hooks', '?' + utils.paramString(_xyz.hooks));
        } catch (me) { }
    };
    
    // Push key into an array hook.
    _xyz.pushHook = function(key, val){
        if (_xyz.hooks[key]) {
            _xyz.hooks[key].push(val);
        } else {
            _xyz.hooks[key] = [val];
        }
        try {
            history.pushState({hooks: true}, 'hooks', '?' + utils.paramString(_xyz.hooks));
        } catch(me) {}
    }

    // Filter key from an array hook.
    _xyz.filterHook = function(key, val){
        if (_xyz.hooks[key]) {
            _xyz.hooks[key] = _xyz.hooks[key].filter(function(el){
                return el !== val;
            });
            if (_xyz.hooks[key].length === 0) delete _xyz.hooks[key];
            try {
                history.pushState({hooks: true}, 'hooks', '?' + utils.paramString(_xyz.hooks));
            } catch(me) {}
        }
    }
    
};