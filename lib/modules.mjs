export default _xyz => () => new Promise((resolveAll, rejectAll) => {

  if (!_xyz.locale.modules) resolveAll()

  _xyz.layers.modules = true

  const promises = Object.entries(_xyz.locale.modules || {}).map(_module => {

    return new Promise((resolve, reject) => {

      const tag = document.createElement("script")
      
      tag.src = _module[1]

      const eF = e => {
        e.detail(_xyz)
        document.removeEventListener(_module[0], eF, true)
        tag.remove()
        resolve(_module)
      }

      document.addEventListener(_module[0], eF, true)
      document.head.appendChild(tag)
    })
  })

  Promise
    .all(promises)
    .then(arr => resolveAll(arr))
    .catch(error => {
      console.error(error)
      rejectAll(error)
    })

})