const idle = {
  idle: 600,
}

export default params => {

  Object.assign(idle, params)

  if (idle.idle === 0) return;

  // Define window events that reset the lock timeout.
  window.onload = resetTimer;
  window.onmousemove = resetTimer;
  window.onmousedown = resetTimer;
  window.ontouchstart = resetTimer;
  window.onclick = resetTimer;
  window.onkeypress = resetTimer;
  resetTimer()
  renewToken()
}

// Reset idle timeout
function resetTimer() {

  if (idle.locked) return

  idle.timeout && clearTimeout(idle.timeout);

  idle.timeout = setTimeout(lock, idle.idle * 1000)
}

// Lock interface
function lock() {

  idle.locked = true

  // Do not renew cookie when interface is locked.
  idle.renew && clearTimeout(idle.renew)

  const xhr = new XMLHttpRequest()
  xhr.open('GET', `${idle.host}/api/user/cookie?destroy=true`)
  xhr.send()

  const form = mapp.utils.html.node`
    <form
      class="login"
      action="${`${idle.host}/api/user/login`}"
      method="post"
      autocomplete="off">
       
      <input
        name="language"
        class="display-none"
        value="en"
        required>
  
      <div class="input-group">
        <input
          id="auth_user_email"
          name="email"
          type="email"
          required maxlength="50">
        <span class="bar"></span>
        <label style="color: #fff" for="auth_user_email">E-mail</label>
      </div>
  
      <div class="input-group">
        <input
          id="auth_user_password"
          name="password"
          type="password"
          required minlength="8">
        <span class="bar"></span>
        <label style="color: #fff" for="auth_user_password">Password</label>
      </div>
     
      <button id="btnLogin" type="submit">Log In</button>

      <div class="msg"></div>
        
    </form>`

  form.onsubmit = e => {
    e.preventDefault()

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${idle.host}/api/user/login`)
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    xhr.onload = e => {

      if (e.target.status === 401) {
        form.querySelector('.msg').textContent = e.target.response
      }

      // Remove lock and mask, reset timeout and cookie renewal.
      if (e.target.status === 200) {
        delete idle.locked
        idle.mask.remove()
        resetTimer()
        renewToken()
      }

    }
    xhr.send(
      `login=true&email=${
        form.querySelector('#auth_user_email').value
      }&password=${
        form.querySelector('#auth_user_password').value}`)
  }

  // Append mask and login form to document body.
  idle.mask = document.body.appendChild(mapp.utils.html.node`
    <div class="interface-mask">${form}`)
}

// Renew cookie
function renewToken() {

  // Renew token after idle minus 20 seconds.
  idle.renew = setTimeout(cookie, (idle.idle - 20) * 1000)

  function cookie() {

    const xhr = new XMLHttpRequest()
    xhr.open('GET', `${idle.host}/api/user/cookie?renew=true`)
    xhr.onload = e => {

      // Lock interface if cookie renewal fails.
      if (e.target.status === 401) return lock()

      // Re-call method to renew token.
      renewToken()
    }

    xhr.send()
  }
}