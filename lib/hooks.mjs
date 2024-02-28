/**
## mapp.hooks{}

The mapp.hooks{} module parses, updates, and stores URL parameter.

```js
{
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
```

@module hooks
*/

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

export default hooks;

/**
## mapp.hooks.parse()
The method parses key/value pairs of URL searchParams from the document window.location.href.

@function parse
@memberof module:hooks
*/
function parse() {
  
  const url = new URL(window.location.href);

  // Iterate over the search parameters
  for (const [key, value] of url.searchParams.entries()) {
    // string 'false' should be boolean false
    if (value === 'false') {
      hooks.current[key] = false;
      continue;
    }
    // string 'true' should be boolean true
    if (value === 'true') {
      hooks.current[key] = true;
      continue;
    }
    // layers and locations should always be arrays
    if (key === 'locations' || key === 'layers') {
      hooks.current[key] = decodeURIComponent(value).split(',');
      continue;
    }

    hooks.current[key] = value.includes(',') ? decodeURIComponent(value).split(',') : value;
  }

  // Strip token from url
  if (hooks.current.token) {
    url.searchParams.delete('token');
    window.history.replaceState({}, document.title, url.toString());
    delete hooks.current.token;
  }
}

/**
## mapp.hooks.set()
The set method will assign a URL params object to the hooks.current{} before calling the pushState() method.

@function set
@memberof module:hooks
@param {Object} _hooks
A params object to be assigned to the hooks.current.
*/
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