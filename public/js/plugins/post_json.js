document.dispatchEvent(new CustomEvent('post_json', {
  detail: _xyz => {

    if(!document.getElementById('mapButton')) return

    document.getElementById('mapButton').appendChild(_xyz.utils.html.node`
    <button
      class="mobile-display-none"
        onclick=${e => {

          const body = {
            "bar": "baz",
            "balance": 7.77,
            "active": false
          }

          const xhr = new XMLHttpRequest()

          xhr.open('POST', `${_xyz.host}/api/query/json_input_query`)

          xhr.setRequestHeader('Content-Type', 'application/json')

          xhr.responseType = 'json'

          xhr.onload = e => {
        
            console.log(e.target)
      
          }
      
          xhr.send(JSON.stringify(body))

        }}><div class="xyz-icon icon-bug-report">`)

  }
}))