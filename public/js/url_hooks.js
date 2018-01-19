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
    
    // Tools for multiple values stored in one hook
    
    // push element only if not exists
    _this.pushHook = function(_array, _element){
        let _respaced = _this.respaceHook(_element);
        if(_array.indexOf(_respaced) === -1) _array.push(_respaced);
        return _array.join(",");
    }

    // pop element out of an array
    _this.popHook = function(_array, _element){
        let _respaced = _this.respaceHook(_element), 
            _idx = _array.indexOf(_respaced);
        if(_idx !== -1) _array.splice(_idx, 1);
        return _array.join(",");
    }
    
     // replace space in layer name with a plus
    _this.respaceHook = function(_val, _symbol){
        if(_symbol === undefined) _symbol = "+";
        let _respaced = _val.replace(/ /g, _symbol);
        return _respaced;
    }
    
    // replace a symbol with a space, reverse _respace 
    _this.unspaceHook = function(_val, _symbol){
        _symbol ? _symbol = _symbol : _symbol = '+';
        let _unspaced = _val.split(_symbol).join(' ');
        return _unspaced;
    }
    
    // read multi hook for selected features
    _this.readSelectionMultiHook = function(){
        let _items = {}, _array;
        
        if(_this.hooks.selected){
            _array = _this.hooks.selected.split(",");
            let _mapped = _array.map(function(_el){
                let _e = _el.split("."), _key = _this.unspaceHook(_e[0]);
                _items[_key] = _e.slice(1).join(".");
            });
            return _items;
        }
    }
    
};