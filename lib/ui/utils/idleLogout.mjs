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

  // Destroy cookie.
  const xhr = new XMLHttpRequest()
  xhr.open('GET', `${idle.host}/api/user/cookie?destroy=true`)

  // Reload location once cookie has been removed.
  xhr.onload = e => location.reload()
  xhr.send()
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