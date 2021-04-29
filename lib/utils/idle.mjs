let params = {
  renew: 540,
  idle: 600,
  host: ''
}

export function idle(_params) {

  Object.assign(params, _params)

  if (params.idle === 0) return;

  // Define the events that 
  // would reset the timer 
  window.onload = resetTimer;
  window.onmousemove = resetTimer;
  window.onmousedown = resetTimer;
  window.ontouchstart = resetTimer;
  window.onclick = resetTimer;
  window.onkeypress = resetTimer;
  resetTimer()
  renewToken()
}

import { html } from 'uhtml'

let lockTimeout, renewTimeout, locked

function resetTimer() {

  if (locked) return

  clearTimeout(lockTimeout);

  lockTimeout = setTimeout(lock, params.idle * 1000)

}

function lock() {

  locked = true

  clearTimeout(renewTimeout)

  const xhr = new XMLHttpRequest()
  xhr.open('GET', `${params.host}/api/user/cookie?destroy=true`)
  xhr.send()

  const mask = document.body.appendChild(html.node`<div id="InputMask">`)

  const form = mask.appendChild(html.node`
    <form id="loginForm" action="${params.host + '/api/user/login'}" method="post" autocomplete="off">
     
      <input style="display: none;" name="login" value=true>
  
      <input style="display:none;" name="language" required value="en">
  
      <div class="input-group">
        <input id="auth_user_email" name="email" type="email" required maxlength="50">
        <span class="bar"></span>
        <label for="auth_user_email">E-mail</label>
      </div>
  
      <div class="input-group">
        <input id="auth_user_password" name="password" type="password" required minlength="8">
        <span class="bar"></span>
        <label for="auth_user_password">Password</label>
      </div>
     
      <button id="btnLogin" type="submit">Log In</button>

      <div id="loginMessage" style="color: red"></div>
        
    </form>`)

  form.onsubmit = e => {

    e.preventDefault()

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${params.host}/api/user/login`)
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')

    xhr.onload = e => {

      if (e.target.status === 401) {
        document.getElementById('loginMessage').textContent = e.target.response
      }

      if (e.target.status === 200) {
        locked = false
        mask.remove()
        resetTimer()
        renewToken()
      }

    }

    xhr.send(`login=true&email=${document.getElementById('auth_user_email').value}&password=${document.getElementById('auth_user_password').value}`)

  }

}

function renewToken() {

  renewTimeout = setTimeout(cookie, params.renew * 1000)

  function cookie() {

    const xhr = new XMLHttpRequest()
    xhr.open('GET', `${params.host}/api/user/cookie?renew=true`)

    xhr.onload = e => {

      if (e.target.status === 401) return lock()
      renewToken()
    }

    xhr.send()

  }

}