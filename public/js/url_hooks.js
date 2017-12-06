const helper = require('./helper');

module.exports = function(_this){
    let params = window.location.search.substring(1).split('&');

    if (params[0] !== '') {
        for (let i = 0; i < params.length; i++) {
            let key_val = params[i].split('=');
            _this.hooks[key_val[0]] = key_val[1];
        }
    }

    if (hooks !== false) {
        _this.hooks = hooks
        try {
            history.pushState({ url_hooks: true }, 'url_hooks', '?' + helper.paramString(_this.hooks));
        } catch (e) { }
    };

    _this.setViewHook = function (cntr) {
        _this.hooks.lat = cntr.lat;
        _this.hooks.lng = cntr.lng;
        _this.hooks.z = _this.map.getZoom();
        try {
            history.pushState({ url_hooks: true }, 'url_hooks', '?' + helper.paramString(_this.hooks));
        } catch (e) { }
    };

    _this.setHook = function (key, val) {
        _this.hooks[key] = val;
        try {
            history.pushState({url_hooks: true}, 'url_hooks', '?' + helper.paramString(_this.hooks));
        } catch(e) {}
    };

    _this.removeHook = function (key) {
        delete _this.hooks[key];
        try {
            history.pushState({url_hooks: true}, 'url_hooks', '?' + helper.paramString(_this.hooks));
        } catch(e) {}
    };
};