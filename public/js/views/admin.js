let token = window.location.search.replace('?token=','');

history.pushState({ token: true }, 'token', document.head.dataset.dir + '/auth/user/admin');

const _xhr = new XMLHttpRequest();
_xhr.open('GET', document.head.dataset.dir + '/auth/token/renew?token=' + token);
_xhr.onload = e => {
  token = e.target.response;
  setTimeout(renewToken, 6000);
};
_xhr.send();

const renewToken = () => {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', document.head.dataset.dir + '/auth/token/renew?token=' + token);
  xhr.onload = e => {
    token = e.target.response;
    setTimeout(renewToken, 6000);
  };
  xhr.send();
};

const xhr = new XMLHttpRequest();

[].forEach.call(document.querySelectorAll('.checkbox > input'), el => {
  el.addEventListener('click', () => {

    el.disabled = true;

    let user = el.parentNode.parentNode.parentNode.firstChild.nextSibling;

    xhr.open('POST', document.head.dataset.dir + '/auth/user/update?token=' + token);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = () => {
      if (xhr.status === 500) alert('Soz. It\'s me not you.');
      if (xhr.status === 200) el.disabled = false;
    };
    xhr.send(JSON.stringify({
      email: user.innerText,
      role: el.getAttribute('name'),
      chk: el.checked
    }));

  }, false);
});

[].forEach.call(document.querySelectorAll('.delete_account'), el => {
  el.addEventListener('click', () => {

    let row = el.parentNode.parentNode,
      email = row.firstChild.nextSibling;

    row.style.color = '#999';

    if (confirm('Delete account ' + email.innerText)) {
      xhr.open('POST', document.head.dataset.dir + '/auth/user/delete?token=' + token);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onload = () => {
        if (xhr.status === 500) alert('Soz. It\'s me not you.');
        if (xhr.status === 200) row.remove();
      };
      xhr.send(JSON.stringify({
        email: email.innerText
      }));
    } else {
      row.style.color = '#000';
    }
  }, false);
});