export default (function(){

  document.getElementById("layers").addEventListener('addLayerView', e => {
    console.log(e.detail)
  })

})()