/**
## /hooks

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

@module /hooks
*/

const hooks = {
  current: {
    layers: [],
    locations: [],
  },
  filter,
  parse,
  push,
  remove,
  removeAll,
  set,
};

export default hooks;

/**
@function parse

@description
The method parses key/value pairs of URL searchParams from the document window.location.href.
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

    hooks.current[key] = value.includes(',')
      ? decodeURIComponent(value).split(',')
      : value;
  }

  // Strip token from url
  if (hooks.current.token) {
    url.searchParams.delete('token');
    window.history.replaceState({}, document.title, url.toString());
    delete hooks.current.token;
  }
}

/**
@function set
 
@description
The set method will assign a URL params object to the hooks.current{} before calling the pushState() method.

@param {Object} _hooks A params object to be assigned to the hooks.current.
*/
function set(_hooks) {
  Object.assign(hooks.current, _hooks);

  pushState();
}

/**
@function remove
 
@description
Remove key from mapp.hooks.current and URI. Array properties will be emptied. Other properties will be deleted.

@param {string} key hooks.current{} property key.
*/
function remove(key) {
  if (Array.isArray(hooks.current[key])) {
    // Empty array.
    hooks.current[key].length = 0;
  } else {
    delete hooks.current[key];
  }

  pushState();
}

/**
@function removeAll
 
@description
Iterate through all hooks.current property keys and call the remove method with the key argument.
*/
function removeAll() {
  Object.keys(hooks.current).forEach((key) => remove(key));

  pushState();
}

/**
@function push
 
@description
Assigns the val param to the hooks.current[key] property.

@param {string} key hooks.current{} property key.
@param {*} val hooks.current[key] property val.
*/
function push(key, val) {
  if (hooks.current[key]) {
    if (hooks.current[key].indexOf(val) < 0) hooks.current[key].push(val);
  } else {
    hooks.current[key] = [val];
  }

  pushState();
}

/**
@function filter
 
@description
Filter [remove] a value from an hooks.current array property.

This is requiired to strip a location.hook from the [selected] locations.

@param {string} key hooks.current{} array property key.
@param {*} val hooks.current[key] array property val.
*/
function filter(key, val) {
  if (!Array.isArray(hooks.current[key])) return;

  hooks.current[key] = hooks.current[key].filter((el) => el !== val);

  pushState();
}

/**
@function pushState
 
@description
Pushes changes in the hooks.current to the window URL.
*/
function pushState() {
  try {
    window.history.pushState(
      {},
      document.title,
      `?${mapp.utils.paramString(hooks.current)}`,
    );
  } catch (me) {
    console.log(me);
  }
}
