module.exports = next => {

    let search = window.location.search.split('token=');
    
    history.pushState({ token: true }, 'token', document.head.dataset.dir + search[0]);

    if (search[1]){

        const xhr = new XMLHttpRequest();
        xhr.open('GET', document.head.dataset.dir + '/token/renew?token=' + search[1]);
        xhr.onload = e => {
            setTimeout(renewToken, 1*60*1000);
            require('./workspace')(next, e.target.response);
        }
        xhr.send();
    } else {
        require('./workspace')(next, null);
    }
}

const renewToken = () => {

    let timenow = Date.now();
    
    console.log({
        nanoid: _xyz.nanoid,
        timenow: timenow
    });
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', document.head.dataset.dir + '/token/renew?token=' + global._xyz.token + '&nanoid=' + _xyz.nanoid + '&timenow=' + timenow);
    xhr.onerror = () => document.getElementById('timeout_mask').style.display = 'block';
    xhr.onload = e => {

        // Set timeout mask if token renewal fails
        if (e.target.status !== 200) return document.getElementById('timeout_mask').style.display = 'block';

        global._xyz.token = e.target.response;
        setTimeout(renewToken, 1*60*1000);

        // iterate through layers
        Object.values(global._xyz.locales[global._xyz.locale].layers).forEach(layer => {

            // set URL to acknowledge new token.
            if (layer.base) layer.base.setUrl = layer.provider ?
                global._xyz.host + '/proxy/image?uri=' + layer.URI + '&provider=' + layer.provider + '&token=' + global._xyz.token :
                layer.URI;
        });
    }
    xhr.send();
}