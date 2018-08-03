const email = document.getElementById('auth_user_email');
const password = document.getElementById('auth_user_password');
const btnLogin = document.getElementById('btnLogin');

setTimeout(function () {
    email.value.length > 0 ?
        password.focus() :
        email.focus();
    check();
}, 10);

email.addEventListener('keyup', check());

password.addEventListener('keyup', check());

function check() {
    email.validity.valid &&
    password.validity.valid
    ?
    btnLogin.disabled = false :
    btnLogin.disabled = true;
}