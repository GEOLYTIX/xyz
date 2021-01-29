export function idle() {

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

let interval, timeout, locked

function resetTimer() {

  if (locked) return

  clearInterval(interval);

  let time = 0

  /* Set a new interval */
  interval = setInterval(addTime, 1000)

  function addTime() {

    time++;

    console.log(time)

    if (time > 60) {

      locked = true

      clearTimeout(timeout)

      const xhr = new XMLHttpRequest()
      xhr.open('GET', `/dev/api/user/cookie?destroy=true`)
      xhr.responseType = 'json'
  
      xhr.onload = e => {
        console.log(e.target) 
      }
  
      xhr.send()

      clearInterval(interval)

      const mask = document.body.appendChild(html.node`<div id="InputMask">`)

      const form = mask.appendChild(html.node`
      <form id="loginForm" action="/dev/api/user/login" method="post" autocomplete="off">
       
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
          
      </form>`)

      form.onsubmit = e => {
        e.preventDefault()
        console.log(e)

        const xhr = new XMLHttpRequest()
        xhr.open('POST', `/dev/api/user/login`)
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
        xhr.responseType = 'json'
    
        xhr.onload = e => {

          console.log(e.target)

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
  
  }
}

function renewToken() {

  timeout = setTimeout(cookie, 40000)

  function cookie() {

    const xhr = new XMLHttpRequest()
    xhr.open('GET', `/dev/api/user/cookie`)
    xhr.responseType = 'json'

    xhr.onload = e => {

      console.log(e)
      renewToken()

    }

    xhr.send()

  }

}