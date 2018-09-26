import _xyz from './_xyz.mjs';

import workspace from './workspace.mjs';

export default next => {

    const search = window.location.search.split('token=');

    if (!search[1]) return workspace(next, null);
    
    history.pushState({ token: true }, 'token', document.head.dataset.dir + search[0]);

    const xhr = new XMLHttpRequest();
    xhr.open('GET', document.head.dataset.dir + '/token/renew?token=' + search[1]);
    xhr.onload = e => {
        setTimeout(renewToken, 1*60*1000);
        workspace(next, e.target.response);
    }
    xhr.send();
}

const renewToken = () => {

    const timenow = Date.now();
    
    console.log({
        nanoid: _xyz.ws.nanoid,
        timenow: timenow
    });
    
    const xhr = new XMLHttpRequest();

    xhr.open('GET', document.head.dataset.dir + '/token/renew?token=' + _xyz.ws.token + '&nanoid=' + _xyz.ws.nanoid + '&timenow=' + timenow);
    xhr.onerror = () => document.getElementById('timeout_mask').style.display = 'block';
    xhr.onload = e => {

        // Set timeout mask if token renewal fails
        if (e.target.status !== 200) return document.getElementById('timeout_mask').style.display = 'block';

        _xyz.ws.token = e.target.response;

        setTimeout(renewToken, 1*60*1000);

        // iterate through layers
        Object.values(_xyz.ws.locales[_xyz.ws.locale].layers).forEach(layer => {

            // set URL to acknowledge new token.
            if (layer.base) layer.base.setUrl = layer.provider ?
                _xyz.ws.host + '/proxy/image?uri=' + layer.URI + '&provider=' + layer.provider + '&token=' + _xyz.ws.token :
                layer.URI;
        });
    }
    xhr.send();
}