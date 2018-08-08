const utils = require('./utils');

module.exports = () => {

    global._xyz.hooks = {};

    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m, key, value) => {
        global._xyz.hooks[key] = value;
    });

    // Set view hook containing lat, lng and zoom.
    global._xyz.setViewHook = cntr => {
        global._xyz.hooks.lat = cntr.lat;
        global._xyz.hooks.lng = cntr.lng;
        global._xyz.hooks.z = global._xyz.map.getZoom();
        try {
            history.pushState({ hooks: true }, 'hooks', '?' + utils.paramString(global._xyz.hooks));
        } catch (me) { }
    };

    // Add kvp hook to global._xyz.hooks and URI.
    global._xyz.setHook = (key, val) => {
        global._xyz.hooks[key] = val;
        try {
            history.pushState({ hooks: true }, 'hooks', '?' + utils.paramString(global._xyz.hooks));
        } catch (me) { }
    };

    // Remove hook from global._xyz.hooks and URI.
    global._xyz.removeHook = key => {
        delete global._xyz.hooks[key];
        try {
            history.pushState({ hooks: true }, 'hooks', '?' + utils.paramString(global._xyz.hooks));
        } catch (me) { }
    };

    // Remove all hooks.
    global._xyz.removeHooks = () => {
        Object.keys(global._xyz.hooks).map(key => delete global._xyz.hooks[key]);
        try {
            history.pushState({ hooks: true }, 'hooks', '?' + utils.paramString(global._xyz.hooks));
        } catch (me) { }
    };

    // Push key into an array hook.
    global._xyz.pushHook = (key, val) => {
        if (global._xyz.hooks[key]) {
            global._xyz.hooks[key].push(val);
        } else {
            global._xyz.hooks[key] = [val];
        }
        try {
            history.pushState({ hooks: true }, 'hooks', '?' + utils.paramString(global._xyz.hooks));
        } catch (me) { }
    }

    // Filter key from an array hook.
    global._xyz.filterHook = (key, val) => {
        if (global._xyz.hooks[key]) {
            global._xyz.hooks[key] = global._xyz.hooks[key].filter(el => el !== val);
            if (global._xyz.hooks[key].length === 0) delete global._xyz.hooks[key];
            try {
                history.pushState({ hooks: true }, 'hooks', '?' + utils.paramString(global._xyz.hooks));
            } catch (me) { }
        }
    }

};