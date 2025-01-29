window.onload = () => {
  const email = document.getElementById('auth_user_email');
  const password = document.getElementById('auth_user_password');
  const password_retype = document.getElementById('auth_user_password_retype');
  const btnRegister = document.getElementById('btnRegister');
  const privacy_agreement = document.getElementById('privacy_agreement');

  email.addEventListener('input', check);

  password.addEventListener('input', check);

  password_retype.addEventListener('input', check);

  privacy_agreement.addEventListener('change', check);

  function check() {
    btnRegister.disabled = !(
      email.validity.valid &&
      password.validity.valid &&
      password.value === password_retype.value &&
      privacy_agreement.checked
    );
  }
};
