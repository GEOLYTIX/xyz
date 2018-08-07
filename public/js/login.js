const email = document.getElementById('auth_user_email');
const password = document.getElementById('auth_user_password');
const btnLogin = document.getElementById('btnLogin');

setTimeout(() => {
    email.value.length > 0 ?
        password.focus() :
        email.focus();
    check();
}, 10);

email.addEventListener('keyup', () => check());

password.addEventListener('keyup', () => check());

function check() {
    btnLogin.disabled =
    email.validity.valid &&
    password.validity.valid
    ? false : true;
}