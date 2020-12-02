export default _xyz => {

  if (!_xyz.hooks) return null

  const current = {
    layers: [],
    locations: [],
  }

  // Take hooks from URL and store as current hooks.
  window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (match, key, value) => {
    if (current[key]) {
      current[key] = decodeURI(value).split(',')
    } else {
      current[key] = decodeURI(value);
    }
  })

  // Strip token from url.
  if (current.token) {
    window.history.replaceState(
      {},
      document.title,
      window.location.href.replace(new RegExp(`token=${current.token}`), ''))
    delete current.token
  }

  return {

    current: current,

    set: set,

    remove: remove,

    removeAll: removeAll,

    push: push,

    filter: filter,

  }

  // Add kvp hook to _xyz.hooks.current and URI.
  function set(hooks) {

    Object.assign(_xyz.hooks.current, hooks)
    pushState()
  }

  // Remove hook from _xyz.hooks.current and URI.
  function remove(key) {

    if (Array.isArray(_xyz.hooks.current[key])) {

      _xyz.hooks.current[key].length = 0

    } else {

      delete _xyz.hooks.current[key]

    }

    pushState()
  }

  // Remove all hooks.
  function removeAll() {

    Object.keys(_xyz.hooks.current).forEach(key => remove(key))
    pushState()
  }

  // Push key into an array hook.
  function push (key, val) {

    if (_xyz.hooks.current[key]) {

      if (_xyz.hooks.current[key].indexOf(val)<0) _xyz.hooks.current[key].push(val)

    } else {

      _xyz.hooks.current[key] = [val]

    }

    pushState()
  }

  // Filter key from an array hook.
  function filter(key, val) {

    _xyz.hooks.current[key] = _xyz.hooks.current[key].filter(el => el !== val)

    pushState()
  }

  // Pushes changes to the url parameter.
  function pushState() {

    try {
      window.history.pushState(
        {},
        document.title,
        `?${_xyz.utils.paramString(_xyz.hooks.current)}`)

    } catch (me) { console.log(me) }

  }

}