export default _xyz => () => new Promise(resolveAll=>{

  // const promises = _xyz.locale.plugins.forEach(src => {
    
  //   return new Promise(resolve => {

  //     const tag = document.createElement("script")

  //     tag.src = src

  //     const plugin = src.match(/[^\/]+$/)[0]
      
  //     const eF = e => {
  //       e.detail(_xyz)
  //       document.removeEventListener(plugin, eF, true)
  //       tag.remove()
  //       resolve(src)
  //     }

  //     document.addEventListener(plugin, eF, true)
  //     document.head.appendChild(tag)
  //   })
    
  // })

  const promises = Object.entries(_xyz.locale.plugins || {}).map(_plugin => {

    return new Promise(resolve => {

      const tag = document.createElement("script")
      
      tag.src = _plugin[1]

      const eF = e => {
        e.detail(_xyz)
        document.removeEventListener(_plugin[0], eF, true)
        tag.remove()
        resolve(_plugin)
      }

      document.addEventListener(_plugin[0], eF, true)
      document.head.appendChild(tag)
    })
    
  })

  Promise
    .all(promises)
    .then(arr => resolveAll(arr))

})