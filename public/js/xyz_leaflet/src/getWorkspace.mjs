import _xyz from '../../_xyz.mjs';

export default next => {

  return next();

  // XHR to retrieve workspace from backend.
  const xhr = new XMLHttpRequest();
  xhr.open('GET', _xyz.host + '/workspace/get?token=' + _xyz.token);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.responseType = 'json';
  xhr.onload = e => {

    // Assign workspace to _xyz. Continue with init.
    _xyz.ws = e.target.response;

    next();

  };

  xhr.send();

};