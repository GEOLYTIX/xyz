export default (function(){

  mapp.plugins.user_filter = layer => {

    if (!mapp.user?.email) return;

    layer.filter.current = Object.assign(layer.filter.current || {}, {
      [layer.user_filter.field]: {
        in: [mapp.user.email]
      }
    })

  }
})()