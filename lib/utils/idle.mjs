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
}

import { html } from 'uhtml'

let interval, locked

function resetTimer() {

  if (locked) return

  clearInterval(interval);

  let time = 0

  /* Set a new interval */
  interval = setInterval(addTime, 1000)

  function addTime() {

    time++;

    console.log(time)

    if (time > 10) {

      locked = true

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

          console.log(e)
    
        }
    
        xhr.send(`login=true&email=${'email'}&password=${'password'}`)

      }

    }
  
  }
}