import _xyz from './_xyz.mjs';

import * as utils from './utils.mjs';

export default () => {

    _xyz.ws.hooks = {};

    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m, key, value) => {
        _xyz.ws.hooks[key] = value;
    });

    // Set view hook containing lat, lng and zoom.
    _xyz.ws.setViewHook = cntr => {
        _xyz.ws.hooks.lat = cntr.lat;
        _xyz.ws.hooks.lng = cntr.lng;
        _xyz.ws.hooks.z = _xyz.ws.map.getZoom();
        try {
            history.pushState({ hooks: true }, 'hooks', '?' + utils.paramString(_xyz.ws.hooks));
        } catch (me) { }
    };

    // Add kvp hook to _xyz.ws.hooks and URI.
    _xyz.ws.setHook = (key, val) => {
        _xyz.ws.hooks[key] = val;
        try {
            history.pushState({ hooks: true }, 'hooks', '?' + utils.paramString(_xyz.ws.hooks));
        } catch (me) { }
    };

    // Remove hook from _xyz.ws.hooks and URI.
    _xyz.ws.removeHook = key => {
        delete _xyz.ws.hooks[key];
        try {
            history.pushState({ hooks: true }, 'hooks', '?' + utils.paramString(_xyz.ws.hooks));
        } catch (me) { }
    };

    // Remove all hooks.
    _xyz.ws.removeHooks = () => {
        Object.keys(_xyz.ws.hooks).map(key => delete _xyz.ws.hooks[key]);
        try {
            history.pushState({ hooks: true }, 'hooks', '?' + utils.paramString(_xyz.ws.hooks));
        } catch (me) { }
    };

    // Push key into an array hook.
    _xyz.ws.pushHook = (key, val) => {
        if (_xyz.ws.hooks[key]) {
            _xyz.ws.hooks[key].push(val);
        } else {
            _xyz.ws.hooks[key] = [val];
        }
        try {
            history.pushState({ hooks: true }, 'hooks', '?' + utils.paramString(_xyz.ws.hooks));
        } catch (me) { }
    }

    // Filter key from an array hook.
    _xyz.ws.filterHook = (key, val) => {
        if (_xyz.ws.hooks[key]) {
            _xyz.ws.hooks[key] = _xyz.ws.hooks[key].filter(el => el !== val);
            if (_xyz.ws.hooks[key].length === 0) delete _xyz.ws.hooks[key];
            try {
                history.pushState({ hooks: true }, 'hooks', '?' + utils.paramString(_xyz.ws.hooks));
            } catch (me) { }
        }
    }

};