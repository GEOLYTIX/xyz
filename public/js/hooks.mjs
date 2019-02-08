export default _xyz => {

  let current = {
    layers: []
  };       

  // Take hooks from URL and store as current hooks.
  window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (match, key, value) => {
    current[key] = value;
  });

  return {

    current: current,

    setView: setView,

    set: set,

    remove: remove,

    removeAll: removeAll,

    push: push,

    filter: filter,

  };

  // Set view hook containing lat, lng and zoom.
  function setView(cntr, z) {
    _xyz.hooks.current.lat = cntr.lat;
    _xyz.hooks.current.lng = cntr.lng;
    _xyz.hooks.current.z = z;
    try {
      history.pushState({ hooks: true }, 'hooks', '?' + _xyz.utils.paramString(_xyz.hooks.current));
    } catch (me) { console.log(me); }
  };

  // Add kvp hook to _xyz.hooks.current and URI.
  function set(key, val) {
    _xyz.hooks.current[key] = val;
    try {
      history.pushState({ hooks: true }, 'hooks', '?' + _xyz.utils.paramString(_xyz.hooks.current));
    } catch (me) { console.log(me); }
  };

  // Remove hook from _xyz.hooks.current and URI.
  function remove(key) {
    delete _xyz.hooks.current[key];
    try {
      history.pushState({ hooks: true }, 'hooks', '?' + _xyz.utils.paramString(_xyz.hooks.current));
    } catch (me) { console.log(me); }
  };

  // Remove all hooks.
  function removeAll() {
    Object.keys(_xyz.hooks.current).map(key => delete _xyz.hooks.current[key]);
    try {
      history.pushState({ hooks: true }, 'hooks', '?' + _xyz.utils.paramString(_xyz.hooks.current));
    } catch (me) { console.log(me); }
  };

  // Push key into an array hook.
  function push (key, val) {
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
  function filter(key, val) {
    if (_xyz.hooks.current[key]) {
      _xyz.hooks.current[key] = _xyz.hooks.current[key].filter(el => el !== val);
      if (_xyz.hooks.current[key].length === 0) delete _xyz.hooks.current[key];
      try {
        history.pushState({ hooks: true }, 'hooks', '?' + _xyz.utils.paramString(_xyz.hooks.current));
      } catch (me) { console.log(me); }
    }
  };

};