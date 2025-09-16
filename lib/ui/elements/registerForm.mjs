/**
@module ui/elements/registerForm
*/

/**
@function registerForm

@description

@param {Object} params 
@returns {HTMLElement} form
*/

export default function registerForm(params = {}) {
  params.classList ??= '';

  const classList = `register-form ${params.classList}`;

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
      name="password"
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
    label: mapp.dictionary.register_agree,
  });

  agreement_checkbox.querySelector('input').id = 'privacy_agreement';

  const privacy_agreement = mapp.utils.html`
    <h2>${mapp.dictionary.register_privacy}</h2>
    <p>${mapp.dictionary.register_privacy_p1}</p><br>
    <p>${mapp.dictionary.register_privacy_p2}</p><br>
    <p>${mapp.dictionary.register_privacy_p3}</p><br>
    ${agreement_checkbox}`;

  const registerBtn = mapp.utils.html`<button 
    class="primary bold"
    id="btnRegister" type="submit" formaction="register" disabled>
        ${mapp.dictionary.register_reset}
      </button>`;

  const nextSteps = mapp.utils.html`
    <br>
    <h2>${mapp.dictionary.register_next}</h2>
    <p>${mapp.dictionary.register_next_p1}</p><br>
    <p>${mapp.dictionary.register_next_p2}</p><br>
    <p>${mapp.dictionary.register_next_p3}</p><br>`;

  const form = mapp.utils.html.node`<form
    class=${classList}
    method="post"
    autocomplete="off"
    action="register">
    <input style="display: none" name="language" required value="en">
    ${userInput}
    ${passwordInput}
    ${passwordRetypeInput}
    <p class="msg">${params.msg}</p>
    ${privacy_agreement}
    ${registerBtn}
    ${nextSteps}
    <a 
      class="switch"
      href=${params.login}>${mapp.dictionary.register_login}
    </a>
    `;

  return form;

  function check() {}
}
