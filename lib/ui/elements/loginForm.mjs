/**
@module ui/elements/loginForm
*/

/**
@function loginForm

@description

@param {Object} params 
@returns {HTMLElement} 
*/

export default function loginForm(params) {
  params.msg ??= '';
  params.formAction = `${mapp.host}/api/user/login`;
  params.register ??= `${mapp.host}/api/user/register?register=true`;
  params.classList ??= '';

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
    <label for="auth_user_email">${mapp.dictionary.login_email}</label>`;

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
      <label for="auth_user_password">${mapp.dictionary.login_password}</label>
      <br>
      <br>
      <b><span id="disabled_info"></span></b>`;

  const loginBtn = mapp.utils.html.node`
    <button id="btnLogin" class="primary bold" type="submit" disabled>${mapp.dictionary.login_button}`;

  const form = mapp.utils.html.node`<form
    class=${classList}
    method="post"
    autocomplete="off"
    action=${params.formAction}>
    <input style="display: none" name="language" required value="en">
    ${userInput}
    ${passwordInput}
    <p class="msg">${params.msg}</p>

    ${loginBtn}

    <p>${mapp.dictionary.login_verificattion_note}</p>

    <a 
      class="switch"
      href=${params.register}>${mapp.dictionary.login_registration_link}</a>`;

  return form;

  function check() {
    const email = userInput.querySelector('input');
    const password = passwordInput.querySelector('input');

    // Disable the login button if the email or password is invalid.
    loginBtn.disabled = !(email.validity.valid && password.validity.valid);

    // Set the context of the disabled_info element to an error message if the email or password is invalid.
    document.getElementById('disabled_info').innerHTML = loginBtn.disabled
      ? mapp.dictionary.login_invalid
      : '';
  }
}
