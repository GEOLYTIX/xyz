window.onload = () => {
  const email = document.getElementById('auth_user_email');
  const password = document.getElementById('auth_user_password');
  const btnLogin = document.getElementById('btnLogin');

  email.addEventListener('change', () => check());
  email.addEventListener('keyup', () => check());

  password.addEventListener('change', () => check());
  password.addEventListener('keyup', () => check());

  function check() {
    // Disable the login button if the email or password is invalid.
    btnLogin.disabled = !(email.validity.valid && password.validity.valid);

    // Set the context of the disabled_info element to an error message if the email or password is invalid.
    document.getElementById('disabled_info').innerHTML = btnLogin.disabled
      ? 'Invalid email or password does not meet the requirement of minimum 12 characters'
      : '';
  }
};
