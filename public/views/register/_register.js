window.onload = () => {

  let href = new URL(window.location.href);
  let lang = href.searchParams.get("language") || 'en';

  document.querySelector('.switch').href += document.querySelector('.switch').href.includes('?') ? `&language=${lang}` : `?language=${lang}`;
    
  const email = document.getElementById('auth_user_email');
  const password = document.getElementById('auth_user_password');
  const password_retype = document.getElementById('auth_user_password_retype');
  const btnRegister = document.getElementById('btnRegister');
  const privacy_agreement = document.getElementById('privacy_agreement');
  
  email.addEventListener('change', () => check());
  email.addEventListener('keyup', () => check());
  
  password.addEventListener('change', () => check());
  password.addEventListener('keyup', () => check());
  
  password_retype.addEventListener('change', () => check());
  password_retype.addEventListener('keyup', () => check());
  
  privacy_agreement.addEventListener('change', () => check());
  
  function check() {
  
    btnRegister.disabled = !(
      email.validity.valid &&
      password.validity.valid &&
      password.value === password_retype.value &&
      privacy_agreement.checked);
  }
  
}