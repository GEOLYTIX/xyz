import _xyz from './_xyz.mjs';

export default (next, token) => {

    let xhr = new XMLHttpRequest();

    xhr.open('GET', document.head.dataset.dir + '/workspace/get?token=' + token);

    xhr.onload = e => {
        
        _xyz.ws = JSON.parse(e.target.response);
        _xyz.ws.nanoid = document.body.dataset.nanoid;
        _xyz.ws.token = token;
        _xyz.ws.view_mode = document.body.dataset.viewmode;
        _xyz.ws.host = document.head.dataset.dir;
        next();
    }

    xhr.send();
}