const utils = require('./xyz_utilities/utils');

module.exports = () => {

    if (!_xyz.hooks) _xyz.hooks = {};

    // Set view hook containing lat, lng and zoom.
    _xyz.setViewHook = cntr => {
        _xyz.hooks.lat = cntr.lat;
        _xyz.hooks.lng = cntr.lng;
        _xyz.hooks.z = _xyz.map.getZoom();
        try {
            history.pushState({ hooks: true }, 'hooks', '?' + utils.paramString(_xyz.hooks));
        } catch (me) { }
    };

    // Add kvp hook to _xyz.hooks and URI.
    _xyz.setHook = (key, val) => {
        _xyz.hooks[key] = val;
        try {
            history.pushState({hooks: true}, 'hooks', '?' + utils.paramString(_xyz.hooks));
        } catch(me) {}
    };

    // Remove hook from _xyz.hooks and URI.
    _xyz.removeHook = key => {
        delete _xyz.hooks[key];
        try {
            history.pushState({hooks: true}, 'hooks', '?' + utils.paramString(_xyz.hooks));
        } catch(me) {}
    };

    // Remove all hooks.
    _xyz.removeHooks = () => {
        Object.keys(_xyz.hooks).map(key => delete _xyz.hooks[key]);    
        try {
            history.pushState({ hooks: true }, 'hooks', '?' + utils.paramString(_xyz.hooks));
        } catch (me) { }
    };
    
    // Push key into an array hook.
    _xyz.pushHook = (key, val) => {
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
    _xyz.filterHook = (key, val) => {
        if (_xyz.hooks[key]) {
            _xyz.hooks[key] = _xyz.hooks[key].filter(el => el !== val);
            if (_xyz.hooks[key].length === 0) delete _xyz.hooks[key];
            try {
                history.pushState({hooks: true}, 'hooks', '?' + utils.paramString(_xyz.hooks));
            } catch(me) {}
        }
    }
    
};