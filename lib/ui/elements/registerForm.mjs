/**
@module ui/elements/registerForm
*/

/**
@function registerForm

@description
Creates register form used in user registration view.
@param {Object} params 
@property {String} classList optional list of css classes to apply on form element
@property {String} login optional custom login route to navigate to, defaults to native framework login route.
@returns {HTMLElement} form
*/

export default function registerForm(params = {}) {
  params.msg ??= '';
  params.classList ??= '';
  params.login ??= `${mapp.host}/login?language=${mapp.language}`;

  const classList = `login-form ${params.classList}`;

  const userInput = mapp.utils.html.node`<div class="input-group">
    <input
      id="auth_user_email"
      name="email"
      type="email"
      required
      maxlength="50"
      onkeyup=${check}
      onchange=${check}>
    <span class="bar"></span>
    <label for="auth_user_email">${mapp.dictionary.register_email}</label>`;

  const passwordInput = mapp.utils.html.node`<div class="input-group">
    <input
      id="auth_user_password"
      name="password"
      type="password"
      required
      minlength="12"
      onkeyup=${check}
      onchange=${check}>
      <span class="bar"></span>
      <label for="auth_user_password">${mapp.dictionary.register_new_password}</label>
      <br>
      <br>
      <b><span id="disabled_info"></span></b>`;

  const passwordRetypeInput = mapp.utils.html.node`<div class="input-group">
    <input
      id="auth_user_password_retype"
      name="password_retype"
      type="password"
      required
      minlength="12"
      onkeyup=${check}
      onchange=${check}>
      <span class="bar"></span>
      <label for="auth_user_password_retype">${mapp.dictionary.register_retype_password}</label>
      <br>
      <br>
      <b><span id="disabled_info"></span></b>`;

  const agreement_checkbox = mapp.ui.elements.chkbox({
    name: 'privacy_agreement',
    label: mapp.dictionary.register_agree,
    onchange: check,
  });

  agreement_checkbox.querySelector('input').id = 'privacy_agreement';

  const privacy_p1 = mapp.utils.html.node`<p>`;
  privacy_p1.innerHTML = mapp.dictionary.register_privacy_p1;

  const privacy_p2 = mapp.utils.html.node`<p>`;
  privacy_p2.innerHTML = mapp.dictionary.register_privacy_p2;

  const privacy_p3 = mapp.utils.html.node`<p>`;
  privacy_p3.innerHTML = mapp.dictionary.register_privacy_p3;

  const privacy_agreement = mapp.utils.html`
    <h2>${mapp.dictionary.register_privacy}</h2>
    ${privacy_p1}<br>
    ${privacy_p2}<br>
    ${privacy_p3}<br>
    ${agreement_checkbox}`;

  const registerBtn = mapp.utils.html`<button 
    class="primary bold"
    id="btnRegister" type="submit" disabled>
        ${mapp.dictionary.register_reset}
      </button>`;

  const next_p1 = mapp.utils.html.node`<p>`;
  next_p1.innerHTML = mapp.dictionary.register_next_p1;

  const next_p2 = mapp.utils.html.node`<p>`;
  next_p2.innerHTML = mapp.dictionary.register_next_p2;

  const next_p3 = mapp.utils.html.node`<p>`;
  next_p3.innerHTML = mapp.dictionary.register_next_p3;

  const nextSteps = mapp.utils.html`
    <br>
    <h2>${mapp.dictionary.register_next}</h2>
    ${next_p1}<br>
    ${next_p2}<br>
    ${next_p3}<br>`;

  const form = mapp.utils.html.node`<form
    class=${classList}
    action="register"
    method="post"
    autocomplete="off">
    <input style="display: none" name="language" required value="en">
    ${userInput}
    ${passwordInput}
    ${passwordRetypeInput}
    <p class="msg">${params.msg}</p>
    ${privacy_agreement}
    ${registerBtn}
    <br>
    ${nextSteps}
    <a 
      class="switch"
      href=${params.login}>${mapp.dictionary.register_login}
    </a>
    `;

  return form;

  function check() {
    const email = document.getElementById('auth_user_email');
    const password = document.getElementById('auth_user_password');
    const password_retype = document.getElementById(
      'auth_user_password_retype',
    );
    const btnRegister = document.getElementById('btnRegister');
    const privacy_agreement = document.getElementById('privacy_agreement');

    btnRegister.disabled = !(
      email.validity.valid &&
      password.validity.valid &&
      password.value === password_retype.value &&
      privacy_agreement.checked
    );
  }
}
