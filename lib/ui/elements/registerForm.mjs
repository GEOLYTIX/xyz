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
  params.formAction = `${mapp.host}/api/user/register?language=${mapp.language}`;
  params.classList ??= '';
  params.login ??= `${mapp.host}/login?language=${mapp.language}`;
  params.register_privacy_agreement ??= mapp.dictionary.register_privacy_agreement;
  params.register_next_info ??= mapp.dictionary.register_next_info;

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

  const registerBtn = mapp.utils.html.node`<button 
    class="primary bold"
    id="btnRegister" type="submit" disabled>
    ${mapp.dictionary.register_reset}`;

  const form = mapp.utils.html.node`<form
    class=${classList}
    method="post"
    autocomplete="off"
    action=${params.formAction}>
    <input style="display: none" name="language" required value=${mapp.language}>
    ${userInput}
    ${passwordInput}
    ${passwordRetypeInput}
    <p class="msg">${params.msg}</p>
    <h2>${mapp.dictionary.register_privacy}</h2>
    <p>${params.register_privacy_agreement}</p>
    <br>
    ${agreement_checkbox}
    ${registerBtn}
    <br>
    <br>
    <h2>${mapp.dictionary.register_next}</h2>
    <p>${params.register_next_info}</p>
    <br>
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

    registerBtn.disabled = !(
      email.validity.valid &&
      password.validity.valid &&
      password.value === password_retype.value &&
      agreement_checkbox.querySelector('input').checked
    );
  }
}
