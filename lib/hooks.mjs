const hooks = {
  current: {
    layers: [],
    locations: [],
  },
  set,
  parse,
  remove,
  removeAll,
  push,
  filter,
}

export default hooks

function parse() {

  // Take hooks from URL and store as current hooks.
  window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, (match, key, value) => {

    // string 'false' should be boolean false
    if (value === 'false') {

      hooks.current[key] = false
      return;
    }

    // string 'true' should be boolean true
    if (value === 'true') {

      hooks.current[key] = true
      return;
    }

    // layers and locations should always be arrays
    if (key === 'locations' || key === 'layers') {

      hooks.current[key] = decodeURI(value).split(',')
      return;
    }
    
    hooks.current[key] = value.includes(',') && decodeURI(value).split(',') || value
  })

  // Strip token from url.
  if (hooks.current.token) {
    window.history.replaceState(
      {},
      document.title,
      window.location.href.replace(new RegExp(`token=${hooks.current.token}`), ''))
    delete hooks.current.token
  }
}

// Add kvp hook to mapp.hooks.current and URI.
function set(_hooks) {

  Object.assign(hooks.current, _hooks)

  pushState()
}

// Remove hook from mapp.hooks.current and URI.
function remove(key) {

  if (Array.isArray(hooks.current[key])) {

    hooks.current[key].length = 0

  } else {

    delete hooks.current[key]
  }

  pushState()
}

// Remove all hooks.
function removeAll() {

  Object.keys(hooks.current).forEach(key => remove(key))

  pushState()
}

// Push key into an array hook.
function push(key, val) {

  if (hooks.current[key]) {

    if (hooks.current[key].indexOf(val) < 0) hooks.current[key].push(val)

  } else {

    hooks.current[key] = [val]
  }

  pushState()
}

// Filter key from an array hook.
function filter(key, val) {

  hooks.current[key] = hooks.current[key].filter(el => el !== val)

  pushState()
}

// Pushes changes to the url parameter.
function pushState() {

  try {
    window.history.pushState({},
      document.title,
      `?${mapp.utils.paramString(hooks.current)}`)

  } catch (me) {
    console.log(me)
  }
}