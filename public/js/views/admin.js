const xhr = new XMLHttpRequest();

[].forEach.call(document.querySelectorAll('.checkbox > input'), el => {
  el.addEventListener('click', () => {

    el.disabled = true;

    let user = el.parentNode.parentNode.parentNode.firstChild.nextSibling;

    xhr.open('POST', document.head.dataset.dir + '/auth/user/update?token=' + document.body.dataset.token);
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
      xhr.open('POST', document.head.dataset.dir + '/auth/user/delete?token=' + document.body.dataset.token);
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