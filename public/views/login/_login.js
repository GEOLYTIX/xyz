window.onload = () => {

  if (document.getElementById('saml_sso')) {
    const saml_sso = document.getElementById('saml_sso');
    saml_sso.style.display = saml_sso.href ? 'block' : 'none';
  }

  const email = document.getElementById('auth_user_email');
  const password = document.getElementById('auth_user_password');
  const btnLogin = document.getElementById('btnLogin');

  email.addEventListener('change', () => check());
  email.addEventListener('keyup', () => check());

  password.addEventListener('change', () => check());
  password.addEventListener('keyup', () => check());

  function check() {
    btnLogin.disabled = !(
      email.validity.valid &&
      password.validity.valid);
  }

}