/**
@module ui/elements/loginForm
*/

/**
@function loginForm

@description
Creates a login form used in user login view. 
@param {Object} params 
@property {String} classList optional list of css classes to apply on form element
@property {String} formAction optional custom form action parameter. See native html form tag documentation for more information.
@property {String} msg optional custom text message to display.
@property {String} register optional custom register route to navigate to, defaults to native framework register route.
@returns {HTMLElement} form
*/

export default function loginForm(params = {}) {
  params.msg ??= '';
  params.formAction = `${mapp.host}/api/user/login?language=${mapp.language}`;
  params.register ??= `${mapp.host}/api/user/register?language=${mapp.language}&register=true`;
  params.classList ??= '';
  params.login_email ??= mapp.dictionary.login_email;
  params.login_password ??= mapp.dictionary.login_password;
  params.login_button ??= mapp.dictionary.login_button;
  params.login_verification_note ??= mapp.dictionary.login_verification_note;
  params.login_registration_link ??= mapp.dictionary.login_registration_link;
  params.login_invalid ??= mapp.dictionary.login_invalid;

  const classList = `login-form no-select ${params.classList}`;

  const userInput = mapp.utils.html.node`<input
    id="auth_user_email"
    name="email"
    type="email"
    required
    maxlength="50"
    onkeyup=${check}
    onchange=${check}>`;

  const disabledSpan = mapp.utils.html
    .node`<span class="bold" style="color: var(--color-danger)">`;

  const passwordInput = mapp.utils.html.node`<input
    id="auth_user_password"
    name="password"
    type="password"
    required
    minlength="12"
    onkeyup=${check}
    onchange=${check}>`;

  const loginBtn = mapp.utils.html.node`
    <button id="btnLogin" class="primary bold" type="submit" disabled>${params.login_button}`;

  const form = mapp.utils.html.node`<form
    class=${classList}
    method="post"
    autocomplete="off"
    action=${params.formAction}>
    <input style="display: none" name="language" required value="en">
    <div class="input-group">
      ${userInput}
      <span class="bar"></span>
      <label for="auth_user_email">${params.login_email}</label>
    </div>
    <div class="input-group">
      ${passwordInput}
      <span class="bar"></span>
      <label for="auth_user_password">${params.login_password}</label>
      <br>
      ${disabledSpan}
    </div>
    <p class="msg">${params.msg}</p>

    ${loginBtn}

    <p>${params.login_verification_note}</p>

    <a 
      class="switch"
      href=${params.register}>${params.login_registration_link}</a>`;

  return form;

  function check() {
    // Disable the login button if the email or password is invalid.
    loginBtn.disabled = !(
      userInput.validity.valid && passwordInput.validity.valid
    );

    // Set the context of the disabled_info element to an error message if the email or password is invalid.
    disabledSpan.textContent = loginBtn.disabled ? params.login_invalid : '';
  }
}
