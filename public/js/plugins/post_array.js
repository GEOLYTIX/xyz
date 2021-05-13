document.dispatchEvent(new CustomEvent('post_array', {
  detail: _xyz => {

    if(!document.getElementById('mapButton')) return

    document.getElementById('mapButton').appendChild(_xyz.utils.html.node`
    <button
      class="mobile-display-none"
        onclick=${e => {

          const body = ['a', 'b', 'c']

          const xhr = new XMLHttpRequest()

          xhr.open('POST', `${_xyz.host}/api/query/array_input_query?test=foo`)

          xhr.setRequestHeader('Content-Type', 'application/json')

          xhr.responseType = 'json'

          xhr.onload = e => {
        
            console.log(e.target)
      
          }
      
          xhr.send(JSON.stringify(body))

        }}><div class="xyz-icon icon-bug-report">`)

  }
}))