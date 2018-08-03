const email = document.getElementById('auth_user_email');
const password = document.getElementById('auth_user_password');
const password_retype = document.getElementById('auth_user_password_retype');
const btnRegister = document.getElementById('btnRegister');

setTimeout(function () {
    email.value.length > 0 ?
        password.focus() :
        email.focus();
}, 10);

email.addEventListener('keyup', check());

password.addEventListener('keyup', check());

password_retype.addEventListener('keyup', check());

function check() {
    email.validity.valid &&
    password.validity.valid &&
    password.value.length > 0 &&
    password.value === password_retype.value
    ?
    btnRegister.disabled = false :
    btnRegister.disabled = true;
}