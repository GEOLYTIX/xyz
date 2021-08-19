window.onload = () => {

  // let url = new URL(window.location.href)
  // let urlparams = new URLSearchParams(url.search)
  // urlparams.delete('msg')
  // window.history.pushState(
  //   {},
  //   document.title,
  //   `?${urlparams.toString()}`)

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