import _xyz from './_xyz.mjs';

export default () => {

  window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m, key, value) => {
    _xyz.hooks.current[key] = value;
  });

  // Set view hook containing lat, lng and zoom.
  _xyz.hooks.setView = cntr => {
    _xyz.hooks.current.lat = cntr.lat;
    _xyz.hooks.current.lng = cntr.lng;
    _xyz.hooks.current.z = _xyz.map.getZoom();
    try {
      history.pushState({ hooks: true }, 'hooks', '?' + _xyz.utils.paramString(_xyz.hooks.current));
    } catch (me) { console.log(me); }
  };

  // Add kvp hook to _xyz.hooks.current and URI.
  _xyz.hooks.set = (key, val) => {
    _xyz.hooks.current[key] = val;
    try {
      history.pushState({ hooks: true }, 'hooks', '?' + _xyz.utils.paramString(_xyz.hooks.current));
    } catch (me) { console.log(me); }
  };

  // Remove hook from _xyz.hooks.current and URI.
  _xyz.hooks.remove = key => {
    delete _xyz.hooks.current[key];
    try {
      history.pushState({ hooks: true }, 'hooks', '?' + _xyz.utils.paramString(_xyz.hooks.current));
    } catch (me) { console.log(me); }
  };

  // Remove all hooks.
  _xyz.hooks.removeAll = () => {
    Object.keys(_xyz.hooks.current).map(key => delete _xyz.hooks.current[key]);
    try {
      history.pushState({ hooks: true }, 'hooks', '?' + _xyz.utils.paramString(_xyz.hooks.current));
    } catch (me) { console.log(me); }
  };

  // Push key into an array hook.
  _xyz.hooks.push = (key, val) => {
    if (_xyz.hooks.current[key]) {
      _xyz.hooks.current[key].push(val);
    } else {
      _xyz.hooks.current[key] = [val];
    }
    try {
      history.pushState({ hooks: true }, 'hooks', '?' + _xyz.utils.paramString(_xyz.hooks.current));
    } catch (me) { console.log(me); }
  };

  // Filter key from an array hook.
  _xyz.hooks.filter = (key, val) => {
    if (_xyz.hooks.current[key]) {
      _xyz.hooks.current[key] = _xyz.hooks.current[key].filter(el => el !== val);
      if (_xyz.hooks.current[key].length === 0) delete _xyz.hooks.current[key];
      try {
        history.pushState({ hooks: true }, 'hooks', '?' + _xyz.utils.paramString(_xyz.hooks.current));
      } catch (me) { console.log(me); }
    }
  };

};