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
  xhr.onload = e => location.reload()
  xhr.send()
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