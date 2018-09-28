import _xyz from './_xyz.mjs';

export default (init, token) => {

    // Assign token to _xyz.
    _xyz.token = token;

    // XHR to retrieve workspace from backend.
    let xhr = new XMLHttpRequest();
    xhr.open('GET', document.head.dataset.dir + '/workspace/get?token=' + token);
    xhr.onload = e => {

        // Parse and assign workspace to _xyz. Continue with init.
        _xyz.ws = JSON.parse(e.target.response);
        init();
    }

    xhr.send();
}