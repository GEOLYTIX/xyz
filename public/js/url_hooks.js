const utils = require('./helper');

module.exports = function(_){

    // Get hooks from URI and split into _.hooks object
    let params = window.location.search.substring(1).split('&');
    if (params[0] !== '') {
        for (let i = 0; i < params.length; i++) {
            let key_val = params[i].split('=');
            _.hooks[key_val[0]] = key_val[1].split(',');
            //_.hooks[key_val[0]] = key_val[1];
        }
    }

    // if (hooks !== false) {
    //     _.hooks = hooks
    //     try {
    //         history.pushState({ url_hooks: true }, 'url_hooks', '?' + utils.paramString(_.hooks));
    //     } catch (e) {}
    // };

    // Set view hook containing lat, lng and zoom.
    _.setViewHook = function (cntr) {
        _.hooks.lat = cntr.lat;
        _.hooks.lng = cntr.lng;
        _.hooks.z = _.map.getZoom();
        try {
            history.pushState({ url_hooks: true }, 'url_hooks', '?' + utils.paramString(_.hooks));
        } catch (e) { }
    };

    // Add kvp hook to _.hooks and URI.
    _.setHook = function (key, val) {
        _.hooks[key] = val;
        try {
            history.pushState({url_hooks: true}, 'url_hooks', '?' + utils.paramString(_.hooks));
        } catch(e) {}
    };

    // Remove hook from _.hooks and URI.
    _.removeHook = function (key) {
        delete _.hooks[key];
        try {
            history.pushState({url_hooks: true}, 'url_hooks', '?' + utils.paramString(_.hooks));
        } catch(e) {}
    };
    
    
    // Push key into an array hook.
    _.pushHook = function(key, value){
        if (_.hooks[key]) {
            _.hooks[key].push(value);
        } else {
            _.hooks[key] = [value];
        }
        try {
            history.pushState({url_hooks: true}, 'url_hooks', '?' + utils.paramString(_.hooks));
        } catch(e) {}
    }

    // Filter key from an array hook.
    _.filterHook = function(key, value){
        if (_.hooks[key]) {
            _.hooks[key] = _.hooks[key].filter(function(el){
                return el !== value;
            });
            if (_.hooks[key].length === 0) delete _.hooks[key];
            try {
                history.pushState({url_hooks: true}, 'url_hooks', '?' + utils.paramString(_.hooks));
            } catch(e) {}
        }
    }
    
    //  // replace space in layer name with a plus
    // _.respaceHook = function(_val, _symbol){
    //     if(_symbol === undefined) _symbol = "+";
    //     let _respaced = _val.replace(/ /g, _symbol);
    //     return _respaced;
    // }
    
    // // replace a symbol with a space, reverse _respace 
    // _.unspaceHook = function(_val, _symbol){
    //     _symbol ? _symbol = _symbol : _symbol = '+';
    //     let _unspaced = _val.split(_symbol).join(' ');
    //     return _unspaced;
    // }
    
    // // read multi hook for selected features
    // _.readSelectionMultiHook = function(){
    //     if(_.hooks.selected){
    //         let items = {};
    //         let array = _.hooks.selected.split(",");
    //         array.map(function(el){
    //             let
    //             e = el.split('.'),
    //             key = _.unspaceHook(e[0]);
    //             items[key] = e.slice(1).join('.');
    //         });
    //         return items;
    //     }
    // }
    
};