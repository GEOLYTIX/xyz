import _xyz from './_xyz.mjs';

import workspace from './workspace.mjs';

// Next will be the the application init function from the entry script.
export default init => {

  // Split url on token definition. Token must be the last parameter!
  const search = window.location.search.split('token=');

  // Immediately retrieve public workspace if no token was found in the URL.
  if (!search[1]) return workspace(init, null);
    
  // Remove the token from the URL and pushState (no reload).
  history.pushState({ token: true }, 'token', document.head.dataset.dir + search[0]);

  // XHR to renew token.
  const xhr = new XMLHttpRequest();
  xhr.open('GET', document.head.dataset.dir + '/auth/token/renew?token=' + search[1]);
  xhr.onload = e => {

    // Set timeout for the token to be renewed.
    setTimeout(renewToken, 1*60*1000);

    // Get workspace with token from the response.
    workspace(init, e.target.response);
  };
  xhr.send();
};

// Renew token method to be run a regular interval.
// Interval must be shorter than expiry of token defined in /auth/token/renew method in auth.js.
const renewToken = () => {

  const timenow = Date.now();
    
  // Log session id and and timestamp in client terminal before token renewal.
  if (_xyz.log) console.log({
    nanoid: _xyz.nanoid,
    timenow: timenow
  });

  // XHR to renew token.
  const xhr = new XMLHttpRequest();
  xhr.open('GET', document.head.dataset.dir + '/auth/token/renew?' + _xyz.utils.paramString({
    token: _xyz.token,
    nanoid: _xyz.nanoid,
    timenow: timenow
  }));
  xhr.onerror = () => document.getElementById('timeout_mask').style.display = 'block';
  xhr.onload = e => {

    // Set timeout mask if token renewal fails
    if (e.target.status !== 200) return document.getElementById('timeout_mask').style.display = 'block';

    _xyz.token = e.target.response;

    // Set timeout to renew token again.
    setTimeout(renewToken, 1*60*1000);
  };
  xhr.send();
};