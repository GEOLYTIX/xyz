/**
## ui/utils/idleLogout

@module /ui/utils/idleLogout
*/

const idle = {
  idle: 600,
};

/**
@function idleLogout

@description
A function for logging out inactive users. Inactivity is determined by no action occuring on the view within a certain amount of time.

The host and the amount of seconds can be specified in the params:

```
  {
    idle: 600,
    host: example.com
  }
```

-Idle is the duration in seconds
-Host the calling url

The logout is achieved by deleting the session cookie.

@param {Object} params configuration options for the the idle state.
@property {Number} [params.idle] The length of time in seconds that establishes the idle state.
@property {String} [params.host] The url host to be logged out of.

*/
export default function idleLogout(params) {
  Object.assign(idle, params);

  if (idle.idle === 0) return;

  // Define window events that reset the lock timeout.
  window.onload = resetTimer;
  window.onmousemove = resetTimer;
  window.onmousedown = resetTimer;
  window.ontouchstart = resetTimer;
  window.onclick = resetTimer;
  window.onkeypress = resetTimer;
  resetTimer();
  renewToken();
}

/**
@function resetTimer

@description
function for resetting the timeout in instances where an action occurs on the view.
*/
function resetTimer() {
  if (idle.locked) return;

  idle.timeout && clearTimeout(idle.timeout);

  idle.timeout = setTimeout(lock, idle.idle * 1000);
}

/**
@function lock

@description
Function which logs the user out of the view by deleting the cookie and reloading the location.
*/
function lock() {
  idle.locked = true;

  // Do not renew cookie when interface is locked.
  idle.renew && clearTimeout(idle.renew);

  // Destroy cookie.
  const params = { url: `${idle.host}/api/user/cookie?destroy=true` };

  // Reload location once cookie has been removed.
  params.onLoad = (e) => location.reload();

  mapp.utils.xhr(params);
}

/**
@function renewToken

@description
Function for getting a new token if some action has taken place on the view.
*/
function renewToken() {
  // Renew token after idle minus 20 seconds.
  idle.renew = setTimeout(cookie, (idle.idle - 20) * 1000);
}

/**
@function cookie

@description
Timeout function for renewing the access token used in {@link module:/ui/utils/idleLogout~renewToken}.
*/
function cookie() {
  const params = { url: `${idle.host}/api/user/cookie?renew=true` };

  params.onLoad = (e) => {
    // Lock interface if cookie renewal fails.
    if (e.target.status === 401) return lock();

    // Re-call method to renew token.
    renewToken();
  };

  mapp.utils.xhr(params);
}
