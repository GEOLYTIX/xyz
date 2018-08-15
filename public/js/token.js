module.exports = next => {

    let search = window.location.search.split('token=');
    
    history.pushState({ token: true }, 'token', document.head.dataset.dir + search[0]);

    if (search[1]){
        const xhr = new XMLHttpRequest();
        xhr.open('GET', document.head.dataset.dir + '/token/renew?token=' + search[1]);
        xhr.onload = e => {
            setTimeout(renewToken, 60000);
            require('./workspace')(next, e.target.response);
        }
        xhr.send();
    } else {
        require('./workspace')(next, null);
    }
}

const renewToken = () => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', document.head.dataset.dir + '/token/renew?token=' + global._xyz.token);
    xhr.onload = e => {
        global._xyz.token = e.target.response;
        setTimeout(renewToken, 60000);
    }
    xhr.send();
}