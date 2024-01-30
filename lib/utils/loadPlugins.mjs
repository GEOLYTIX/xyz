export default (plugins, endsWith = ['.js','.mjs']) => {

  if (!Array.isArray(plugins)) return;

  return new Promise(resolveAll => {

    const promises = plugins
      .filter(plugin => endsWith.some(_this => plugin.endsWith(_this)))
      .map(
        plugin =>
          new Promise((resolve, reject) =>
            import(plugin)
              .then(mod => {
                resolve(mod)
              })
              .catch(() => {
                reject()
              })))

    Promise
      .allSettled(promises)
      .then(() => {
        resolveAll()
      })
      .catch(err => {
        console.error(err)
        resolveAll()
      })

  })
}