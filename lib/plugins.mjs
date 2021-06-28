export default _xyz => () => new Promise(resolveAll=>{

  const promises = Object.entries(_xyz.locale.plugins || {})
    .map(plugin => new Promise((resolve, reject) => {

      const script = document.createElement("script")

      script.type = 'application/javascript'

      script.src = plugin[1]

      let eventTriggered

      script.onload = () => {
        setTimeout(()=>{
          !eventTriggered && console.error(`${plugin[1]} event not triggered`)
          document.removeEventListener(plugin[0], eF, true)
          script.remove()
          resolve()
        }, 400)

      }

      script.onerror = () => {
        document.removeEventListener(plugin[0], eF, true)
        script.remove()
        reject()
      }

      document.addEventListener(plugin[0], eF, true)
      document.head.append(script)

      function eF(e){
        eventTriggered = true
        e.detail(_xyz)
      }

    }))

  Promise
    .all(promises)
    .then(resolveAll)
    .catch(resolveAll)

})