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
    <label for="auth_user_email">E-mail</label>`;

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
      <label for="auth_user_password">Password</label>
      <br>
      <br>
      <b><span id="disabled_info"></span></b>`;

  const loginBtn = mapp.utils.html.node`
    <button id="btnLogin" type="submit" disabled>Log In`;

  const form = mapp.utils.html.node`
  <form
    method="post"
    autocomplete="off"
    action=${params.formAction}>
    <input style="display: none" name="language" required value="en">
    ${userInput}
    ${passwordInput}
    <p class="msg">${params.msg}</p>

    ${loginBtn}

    <p>
      Your account must be verified by following a verification link sent to
      the email address and approved by an administrator before you are able
      to log in.
    </p>

    <a 
      class="switch"
      href=${params.register}>
      Register a new account or reset your password.</a>`;

  return form;

  function check() {
    const email = userInput.querySelector('input');
    const password = passwordInput.querySelector('input');

    // Disable the login button if the email or password is invalid.
    loginBtn.disabled = !(email.validity.valid && password.validity.valid);

    // Set the context of the disabled_info element to an error message if the email or password is invalid.
    document.getElementById('disabled_info').innerHTML = loginBtn.disabled
      ? 'Invalid email or password does not meet the requirement of minimum 12 characters'
      : '';
  }
}
