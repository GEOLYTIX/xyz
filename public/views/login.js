const email = document.getElementById('auth_user_email');
const password = document.getElementById('auth_user_password');
const btnLogin = document.getElementById('btnLogin');
const captcha_input = document.getElementById('captcha_input');
const captcha_key = document.body.dataset.captcha;

email.addEventListener('change', () => check());
email.addEventListener('keyup', () => check());

password.addEventListener('change', () => check());
password.addEventListener('keyup', () => check());

function check() {
  btnLogin.disabled = !(
    email.validity.valid &&
    password.validity.valid &&
    captcha_input.validity.valid);
}

if (captcha_key) {

  grecaptcha.ready(() => {
    grecaptcha.execute(
      captcha_key, {action: 'login'}).then(
      token => {
  
        captcha_input.value = token;
        check();
    
      });
  });

} else {

  captcha_input.value = 'foo';
}