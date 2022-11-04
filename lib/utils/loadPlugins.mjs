export default plugins => {

  if (!Array.isArray(plugins)) return;
  
  return new Promise(resolveAll=>{

    const promises = plugins.map(
      plugin => 
        new Promise((resolve, reject) => 
          import(plugin)
          .then(mod=> {
            resolve(mod)
          })
          .catch(err=> {
            console.error(err)
            reject()
          })))

    Promise
      .all(promises)
      .then(mods=>{
        resolveAll(mods)
      })
      .catch(resolveAll)

  })
}